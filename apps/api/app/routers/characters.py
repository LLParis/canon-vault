from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import CanonStatus, utcnow
from app.models.changelog import ChangeLog
from app.models.character import (
    Character,
    CharacterCreate,
    CharacterRead,
    CharacterUpdate,
)
from app.models.relationship import Relationship, RelationshipRead
from app.services.changelog import apply_update_with_changelog, check_lock_allows_update

router = APIRouter(prefix="/api/v1/characters", tags=["characters"])


@router.get("/", response_model=list[CharacterRead])
def list_characters(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    faction: str | None = None,
    cast_tier: str | None = None,
    status: CanonStatus | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Character)
    if universe_id is not None:
        query = query.where(Character.universe_id == universe_id)
    if faction:
        query = query.where(Character.faction == faction)
    if cast_tier:
        query = query.where(Character.cast_tier == cast_tier)
    if status:
        query = query.where(Character.status == status)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=CharacterRead, status_code=201)
def create_character(*, session: Session = Depends(get_session), character: CharacterCreate):
    # Validate JSON blobs via Pydantic sub-models (already done by CharacterCreate parsing)
    # Convert sub-models to dicts for JSON storage
    data = character.model_dump(exclude_unset=False)
    for field in (
        "identity", "visual", "personality", "quirks", "voice",
        "moveset", "forms", "arc_phases", "canon_rules", "open_hooks",
        "assets", "section_versions",
    ):
        val = data.get(field)
        if val is not None and hasattr(val, "model_dump"):
            data[field] = val.model_dump()

    db_character = Character(**data)
    session.add(db_character)
    session.commit()
    session.refresh(db_character)
    return db_character


@router.get("/{character_id}", response_model=CharacterRead)
def get_character(*, session: Session = Depends(get_session), character_id: int):
    character = session.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.patch("/{character_id}", response_model=CharacterRead)
def update_character(
    *, session: Session = Depends(get_session), character_id: int, character: CharacterUpdate
):
    db_character = session.get(Character, character_id)
    if not db_character:
        raise HTTPException(status_code=404, detail="Character not found")

    update_data = character.model_dump(exclude_unset=True)

    # Convert Pydantic sub-models to dicts
    for field in (
        "identity", "visual", "personality", "quirks", "voice",
        "moveset", "forms", "arc_phases", "canon_rules", "open_hooks",
        "assets", "section_versions",
    ):
        val = update_data.get(field)
        if val is not None:
            if hasattr(val, "model_dump"):
                update_data[field] = val.model_dump()
            elif isinstance(val, list):
                update_data[field] = [
                    item.model_dump() if hasattr(item, "model_dump") else item
                    for item in val
                ]

    # Lock enforcement
    is_locked = db_character.status == CanonStatus.LOCKED.value
    if is_locked:
        forbidden = check_lock_allows_update(db_character, update_data)
        if forbidden:
            # Route through changelog for canon-critical fields
            apply_update_with_changelog(
                session,
                db_character,
                "character",
                update_data,
                source="api",
            )
            session.commit()
            session.refresh(db_character)
            return db_character

    # Handle status transition to locked
    if update_data.get("status") == CanonStatus.LOCKED.value and not is_locked:
        update_data["locked_at"] = utcnow()

    # Normal update (unlocked entity or notes/tags only)
    apply_update_with_changelog(
        session,
        db_character,
        "character",
        update_data,
        source="api",
    )
    session.commit()
    session.refresh(db_character)
    return db_character


@router.post("/{character_id}/unlock", response_model=CharacterRead)
def unlock_character(*, session: Session = Depends(get_session), character_id: int):
    db_character = session.get(Character, character_id)
    if not db_character:
        raise HTTPException(status_code=404, detail="Character not found")
    if db_character.status != CanonStatus.LOCKED.value:
        raise HTTPException(status_code=400, detail="Character is not locked")

    apply_update_with_changelog(
        session,
        db_character,
        "character",
        {"status": CanonStatus.DRAFT.value, "locked_at": None, "locked_by": None},
        source="api",
    )
    session.commit()
    session.refresh(db_character)
    return db_character


@router.delete("/{character_id}", status_code=204)
def delete_character(*, session: Session = Depends(get_session), character_id: int):
    character = session.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.status == CanonStatus.LOCKED.value:
        raise HTTPException(status_code=403, detail="Cannot delete a locked character")
    session.delete(character)
    session.commit()


@router.get("/{character_id}/relationships", response_model=list[RelationshipRead])
def get_character_relationships(*, session: Session = Depends(get_session), character_id: int):
    character = session.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    query = select(Relationship).where(
        (Relationship.source_character_id == character_id)
        | (Relationship.target_character_id == character_id)
    )
    return session.exec(query).all()


@router.get("/{character_id}/changelog")
def get_character_changelog(*, session: Session = Depends(get_session), character_id: int):
    character = session.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    query = (
        select(ChangeLog)
        .where(ChangeLog.entity_type == "character")
        .where(ChangeLog.entity_id == character_id)
        .order_by(ChangeLog.changed_at.desc())  # type: ignore[union-attr]
    )
    return session.exec(query).all()
