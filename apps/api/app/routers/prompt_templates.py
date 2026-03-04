import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import PromptEngine, utcnow
from app.models.character import Character
from app.models.location import Location
from app.models.prompt_template import (
    PromptTemplate,
    PromptTemplateCreate,
    PromptTemplateRead,
    PromptTemplateUpdate,
)

router = APIRouter(prefix="/api/v1/prompt-templates", tags=["prompt-templates"])


@router.get("/", response_model=list[PromptTemplateRead])
def list_prompt_templates(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    engine: PromptEngine | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(PromptTemplate)
    if universe_id is not None:
        query = query.where(PromptTemplate.universe_id == universe_id)
    if engine:
        query = query.where(PromptTemplate.engine == engine)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=PromptTemplateRead, status_code=201)
def create_prompt_template(
    *, session: Session = Depends(get_session), template: PromptTemplateCreate
):
    db_template = PromptTemplate.model_validate(template)
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template


@router.get("/{template_id}", response_model=PromptTemplateRead)
def get_prompt_template(*, session: Session = Depends(get_session), template_id: int):
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="PromptTemplate not found")
    return template


@router.patch("/{template_id}", response_model=PromptTemplateRead)
def update_prompt_template(
    *,
    session: Session = Depends(get_session),
    template_id: int,
    template: PromptTemplateUpdate,
):
    db_template = session.get(PromptTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="PromptTemplate not found")
    update_data = template.model_dump(exclude_unset=True)
    update_data["updated_at"] = utcnow()
    db_template.sqlmodel_update(update_data)
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template


@router.delete("/{template_id}", status_code=204)
def delete_prompt_template(*, session: Session = Depends(get_session), template_id: int):
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="PromptTemplate not found")
    session.delete(template)
    session.commit()


@router.post("/{template_id}/render")
def render_prompt_template(
    *,
    session: Session = Depends(get_session),
    template_id: int,
    character_id: int | None = None,
    location_id: int | None = None,
):
    """Render a prompt template by substituting {{variable}} placeholders."""
    db_template = session.get(PromptTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="PromptTemplate not found")

    # Build variable context
    context: dict[str, str] = {}

    if character_id is not None:
        character = session.get(Character, character_id)
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        context["character.name"] = character.name
        context["character.codename"] = character.codename or character.name
        context["character.faction"] = character.faction or ""
        context["character.prompt_description"] = character.prompt_description or ""
        # Flatten visual fields if available
        if character.visual and isinstance(character.visual, dict):
            for k, v in character.visual.items():
                if isinstance(v, str):
                    context[f"character.visual.{k}"] = v

    if location_id is not None:
        location = session.get(Location, location_id)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        context["location.name"] = location.name
        context["location.atmosphere"] = location.atmosphere or ""
        context["location.visual_style"] = location.visual_style or ""
        context["location.description"] = location.description or ""

    # Render template
    rendered = db_template.template
    for key, value in context.items():
        rendered = rendered.replace("{{" + key + "}}", value)

    result = {
        "template_id": db_template.id,
        "engine": db_template.engine,
        "rendered_prompt": rendered,
        "neg_prompt": db_template.neg_prompt,
        "parameters": db_template.parameters,
        "loras": db_template.loras,
    }

    # Flag unresolved variables
    unresolved = re.findall(r"\{\{[^}]+\}\}", rendered)
    if unresolved:
        result["unresolved_variables"] = unresolved

    return result
