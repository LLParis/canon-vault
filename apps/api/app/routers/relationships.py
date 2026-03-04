from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import RelationshipType, utcnow
from app.models.relationship import (
    Relationship,
    RelationshipCreate,
    RelationshipRead,
    RelationshipUpdate,
)

router = APIRouter(prefix="/api/v1/relationships", tags=["relationships"])


@router.get("/", response_model=list[RelationshipRead])
def list_relationships(
    *,
    session: Session = Depends(get_session),
    character_id: int | None = None,
    relationship_type: RelationshipType | None = None,
    universe_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Relationship)
    if universe_id is not None:
        query = query.where(Relationship.universe_id == universe_id)
    if character_id is not None:
        query = query.where(
            (Relationship.source_character_id == character_id)
            | (Relationship.target_character_id == character_id)
        )
    if relationship_type:
        query = query.where(Relationship.relationship_type == relationship_type)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=RelationshipRead, status_code=201)
def create_relationship(
    *, session: Session = Depends(get_session), relationship: RelationshipCreate
):
    db_rel = Relationship.model_validate(relationship)
    session.add(db_rel)
    session.commit()
    session.refresh(db_rel)
    return db_rel


@router.get("/{relationship_id}", response_model=RelationshipRead)
def get_relationship(*, session: Session = Depends(get_session), relationship_id: int):
    rel = session.get(Relationship, relationship_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return rel


@router.patch("/{relationship_id}", response_model=RelationshipRead)
def update_relationship(
    *,
    session: Session = Depends(get_session),
    relationship_id: int,
    relationship: RelationshipUpdate,
):
    db_rel = session.get(Relationship, relationship_id)
    if not db_rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    update_data = relationship.model_dump(exclude_unset=True)
    update_data["updated_at"] = utcnow()
    db_rel.sqlmodel_update(update_data)
    session.add(db_rel)
    session.commit()
    session.refresh(db_rel)
    return db_rel


@router.delete("/{relationship_id}", status_code=204)
def delete_relationship(*, session: Session = Depends(get_session), relationship_id: int):
    rel = session.get(Relationship, relationship_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    session.delete(rel)
    session.commit()
