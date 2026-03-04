from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import CanonStatus, utcnow
from app.models.changelog import ChangeLog
from app.models.chapter import Chapter, ChapterCreate, ChapterRead, ChapterUpdate
from app.services.changelog import apply_update_with_changelog, check_lock_allows_update

router = APIRouter(prefix="/api/v1/chapters", tags=["chapters"])


@router.get("/", response_model=list[ChapterRead])
def list_chapters(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    season: int | None = None,
    status: CanonStatus | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Chapter)
    if universe_id is not None:
        query = query.where(Chapter.universe_id == universe_id)
    if season is not None:
        query = query.where(Chapter.season == season)
    if status is not None:
        query = query.where(Chapter.status == status)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=ChapterRead, status_code=201)
def create_chapter(*, session: Session = Depends(get_session), chapter: ChapterCreate):
    db_chapter = Chapter.model_validate(chapter)
    session.add(db_chapter)
    session.commit()
    session.refresh(db_chapter)
    return db_chapter


@router.get("/{chapter_id}", response_model=ChapterRead)
def get_chapter(*, session: Session = Depends(get_session), chapter_id: int):
    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.patch("/{chapter_id}", response_model=ChapterRead)
def update_chapter(
    *, session: Session = Depends(get_session), chapter_id: int, chapter: ChapterUpdate
):
    db_chapter = session.get(Chapter, chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    update_data = chapter.model_dump(exclude_unset=True)

    is_locked = db_chapter.status == CanonStatus.LOCKED.value
    if is_locked:
        forbidden = check_lock_allows_update(db_chapter, update_data)
        if forbidden:
            apply_update_with_changelog(session, db_chapter, "chapter", update_data, source="api")
            session.commit()
            session.refresh(db_chapter)
            return db_chapter

    if update_data.get("status") == CanonStatus.LOCKED.value and not is_locked:
        update_data["locked_at"] = utcnow()

    apply_update_with_changelog(session, db_chapter, "chapter", update_data, source="api")
    session.commit()
    session.refresh(db_chapter)
    return db_chapter


@router.post("/{chapter_id}/unlock", response_model=ChapterRead)
def unlock_chapter(*, session: Session = Depends(get_session), chapter_id: int):
    db_chapter = session.get(Chapter, chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if db_chapter.status != CanonStatus.LOCKED.value:
        raise HTTPException(status_code=400, detail="Chapter is not locked")

    apply_update_with_changelog(
        session,
        db_chapter,
        "chapter",
        {"status": CanonStatus.DRAFT.value, "locked_at": None, "locked_by": None},
        source="api",
    )
    session.commit()
    session.refresh(db_chapter)
    return db_chapter


@router.delete("/{chapter_id}", status_code=204)
def delete_chapter(*, session: Session = Depends(get_session), chapter_id: int):
    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if chapter.status == CanonStatus.LOCKED.value:
        raise HTTPException(status_code=403, detail="Cannot delete a locked chapter")
    session.delete(chapter)
    session.commit()


@router.get("/{chapter_id}/changelog")
def get_chapter_changelog(*, session: Session = Depends(get_session), chapter_id: int):
    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    query = (
        select(ChangeLog)
        .where(ChangeLog.entity_type == "chapter")
        .where(ChangeLog.entity_id == chapter_id)
        .order_by(ChangeLog.changed_at.desc())  # type: ignore[union-attr]
    )
    return session.exec(query).all()
