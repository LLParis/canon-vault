from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import CanonStatus, utcnow
from app.models.location import (
    Location,
    LocationCreate,
    LocationRead,
    LocationUpdate,
)
from app.services.changelog import apply_update_with_changelog, check_lock_allows_update

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])


@router.get("/", response_model=list[LocationRead])
def list_locations(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    location_type: str | None = None,
    region: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Location)
    if universe_id is not None:
        query = query.where(Location.universe_id == universe_id)
    if location_type:
        query = query.where(Location.location_type == location_type)
    if region:
        query = query.where(Location.region == region)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=LocationRead, status_code=201)
def create_location(*, session: Session = Depends(get_session), location: LocationCreate):
    db_location = Location.model_validate(location)
    session.add(db_location)
    session.commit()
    session.refresh(db_location)
    return db_location


@router.get("/{location_id}", response_model=LocationRead)
def get_location(*, session: Session = Depends(get_session), location_id: int):
    location = session.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.patch("/{location_id}", response_model=LocationRead)
def update_location(
    *, session: Session = Depends(get_session), location_id: int, location: LocationUpdate
):
    db_location = session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")

    update_data = location.model_dump(exclude_unset=True)

    is_locked = db_location.status == CanonStatus.LOCKED.value
    if is_locked:
        forbidden = check_lock_allows_update(db_location, update_data)
        if forbidden:
            apply_update_with_changelog(
                session, db_location, "location", update_data, source="api",
            )
            session.commit()
            session.refresh(db_location)
            return db_location

    if update_data.get("status") == CanonStatus.LOCKED.value and not is_locked:
        update_data["locked_at"] = utcnow()

    apply_update_with_changelog(
        session, db_location, "location", update_data, source="api",
    )
    session.commit()
    session.refresh(db_location)
    return db_location


@router.post("/{location_id}/unlock", response_model=LocationRead)
def unlock_location(*, session: Session = Depends(get_session), location_id: int):
    db_location = session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    if db_location.status != CanonStatus.LOCKED.value:
        raise HTTPException(status_code=400, detail="Location is not locked")

    apply_update_with_changelog(
        session, db_location, "location",
        {"status": CanonStatus.DRAFT.value, "locked_at": None, "locked_by": None},
        source="api",
    )
    session.commit()
    session.refresh(db_location)
    return db_location


@router.delete("/{location_id}", status_code=204)
def delete_location(*, session: Session = Depends(get_session), location_id: int):
    location = session.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.status == CanonStatus.LOCKED.value:
        raise HTTPException(status_code=403, detail="Cannot delete a locked location")
    session.delete(location)
    session.commit()
