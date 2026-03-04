
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import utcnow
from app.models.universe import Universe, UniverseCreate, UniverseRead, UniverseUpdate

router = APIRouter(prefix="/api/v1/universes", tags=["universes"])


@router.get("/", response_model=list[UniverseRead])
def list_universes(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Universe).offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=UniverseRead, status_code=201)
def create_universe(*, session: Session = Depends(get_session), universe: UniverseCreate):
    db_universe = Universe.model_validate(universe)
    session.add(db_universe)
    session.commit()
    session.refresh(db_universe)
    return db_universe


@router.get("/{universe_id}", response_model=UniverseRead)
def get_universe(*, session: Session = Depends(get_session), universe_id: int):
    universe = session.get(Universe, universe_id)
    if not universe:
        raise HTTPException(status_code=404, detail="Universe not found")
    return universe


@router.patch("/{universe_id}", response_model=UniverseRead)
def update_universe(
    *, session: Session = Depends(get_session), universe_id: int, universe: UniverseUpdate
):
    db_universe = session.get(Universe, universe_id)
    if not db_universe:
        raise HTTPException(status_code=404, detail="Universe not found")
    update_data = universe.model_dump(exclude_unset=True)
    update_data["updated_at"] = utcnow()
    db_universe.sqlmodel_update(update_data)
    session.add(db_universe)
    session.commit()
    session.refresh(db_universe)
    return db_universe


@router.delete("/{universe_id}", status_code=204)
def delete_universe(*, session: Session = Depends(get_session), universe_id: int):
    universe = session.get(Universe, universe_id)
    if not universe:
        raise HTTPException(status_code=404, detail="Universe not found")
    session.delete(universe)
    session.commit()
