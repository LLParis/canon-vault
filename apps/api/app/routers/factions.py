from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import CanonStatus, utcnow
from app.models.faction import (
    Faction,
    FactionCreate,
    FactionRead,
    FactionUpdate,
)
from app.services.changelog import apply_update_with_changelog, check_lock_allows_update

router = APIRouter(prefix="/api/v1/factions", tags=["factions"])


@router.get("/", response_model=list[FactionRead])
def list_factions(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Faction)
    if universe_id is not None:
        query = query.where(Faction.universe_id == universe_id)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=FactionRead, status_code=201)
def create_faction(*, session: Session = Depends(get_session), faction: FactionCreate):
    db_faction = Faction.model_validate(faction)
    session.add(db_faction)
    session.commit()
    session.refresh(db_faction)
    return db_faction


@router.get("/{faction_id}", response_model=FactionRead)
def get_faction(*, session: Session = Depends(get_session), faction_id: int):
    faction = session.get(Faction, faction_id)
    if not faction:
        raise HTTPException(status_code=404, detail="Faction not found")
    return faction


@router.patch("/{faction_id}", response_model=FactionRead)
def update_faction(
    *, session: Session = Depends(get_session), faction_id: int, faction: FactionUpdate
):
    db_faction = session.get(Faction, faction_id)
    if not db_faction:
        raise HTTPException(status_code=404, detail="Faction not found")

    update_data = faction.model_dump(exclude_unset=True)

    is_locked = db_faction.status == CanonStatus.LOCKED.value
    if is_locked:
        forbidden = check_lock_allows_update(db_faction, update_data)
        if forbidden:
            apply_update_with_changelog(
                session, db_faction, "faction", update_data, source="api",
            )
            session.commit()
            session.refresh(db_faction)
            return db_faction

    if update_data.get("status") == CanonStatus.LOCKED.value and not is_locked:
        update_data["locked_at"] = utcnow()

    apply_update_with_changelog(
        session, db_faction, "faction", update_data, source="api",
    )
    session.commit()
    session.refresh(db_faction)
    return db_faction


@router.post("/{faction_id}/unlock", response_model=FactionRead)
def unlock_faction(*, session: Session = Depends(get_session), faction_id: int):
    db_faction = session.get(Faction, faction_id)
    if not db_faction:
        raise HTTPException(status_code=404, detail="Faction not found")
    if db_faction.status != CanonStatus.LOCKED.value:
        raise HTTPException(status_code=400, detail="Faction is not locked")

    apply_update_with_changelog(
        session, db_faction, "faction",
        {"status": CanonStatus.DRAFT.value, "locked_at": None, "locked_by": None},
        source="api",
    )
    session.commit()
    session.refresh(db_faction)
    return db_faction


@router.delete("/{faction_id}", status_code=204)
def delete_faction(*, session: Session = Depends(get_session), faction_id: int):
    faction = session.get(Faction, faction_id)
    if not faction:
        raise HTTPException(status_code=404, detail="Faction not found")
    if faction.status == CanonStatus.LOCKED.value:
        raise HTTPException(status_code=403, detail="Cannot delete a locked faction")
    session.delete(faction)
    session.commit()
