from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models._base import CanonStatus, utcnow
from app.models.changelog import ChangeLog
from app.models.episode import Episode, EpisodeCreate, EpisodeRead, EpisodeScriptRead, EpisodeUpdate
from app.services.changelog import apply_update_with_changelog, check_lock_allows_update
from app.services.script_reader import read_script_file

router = APIRouter(prefix="/api/v1/episodes", tags=["episodes"])


@router.get("/", response_model=list[EpisodeRead])
def list_episodes(
    *,
    session: Session = Depends(get_session),
    universe_id: int | None = None,
    season: int | None = None,
    chapter_id: int | None = None,
    status: CanonStatus | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(Episode)
    if universe_id is not None:
        query = query.where(Episode.universe_id == universe_id)
    if season is not None:
        query = query.where(Episode.season == season)
    if chapter_id is not None:
        query = query.where(Episode.chapter_id == chapter_id)
    if status is not None:
        query = query.where(Episode.status == status)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@router.post("/", response_model=EpisodeRead, status_code=201)
def create_episode(*, session: Session = Depends(get_session), episode: EpisodeCreate):
    db_episode = Episode.model_validate(episode)
    session.add(db_episode)
    session.commit()
    session.refresh(db_episode)
    return db_episode


@router.get("/{episode_id}", response_model=EpisodeRead)
def get_episode(*, session: Session = Depends(get_session), episode_id: int):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode


@router.get("/{episode_id}/script", response_model=EpisodeScriptRead)
def get_episode_script(*, session: Session = Depends(get_session), episode_id: int):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    if not episode.script_path:
        return EpisodeScriptRead(
            episode_id=episode.id,
            canon_id=episode.canon_id,
            path=None,
            source_type=None,
            is_available=False,
            content=None,
            line_count=0,
            message="No script file is attached to this episode yet.",
        )

    path = Path(episode.script_path)
    if not path.exists():
        return EpisodeScriptRead(
            episode_id=episode.id,
            canon_id=episode.canon_id,
            path=episode.script_path,
            source_type=path.suffix.lower().lstrip(".") or None,
            is_available=False,
            content=None,
            line_count=0,
            message="The script file path exists in canon metadata, but the file was not found on disk.",
        )

    try:
        content, source_type = read_script_file(episode.script_path)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    line_count = len(content.splitlines()) if content else 0
    return EpisodeScriptRead(
        episode_id=episode.id,
        canon_id=episode.canon_id,
        path=episode.script_path,
        source_type=source_type,
        is_available=bool(content.strip()),
        content=content or None,
        line_count=line_count,
        message=None if content.strip() else "The script file exists but is currently empty.",
    )


@router.patch("/{episode_id}", response_model=EpisodeRead)
def update_episode(
    *, session: Session = Depends(get_session), episode_id: int, episode: EpisodeUpdate
):
    db_episode = session.get(Episode, episode_id)
    if not db_episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    update_data = episode.model_dump(exclude_unset=True)

    is_locked = db_episode.status == CanonStatus.LOCKED.value
    if is_locked:
        forbidden = check_lock_allows_update(db_episode, update_data)
        if forbidden:
            apply_update_with_changelog(session, db_episode, "episode", update_data, source="api")
            session.commit()
            session.refresh(db_episode)
            return db_episode

    if update_data.get("status") == CanonStatus.LOCKED.value and not is_locked:
        update_data["locked_at"] = utcnow()

    apply_update_with_changelog(session, db_episode, "episode", update_data, source="api")
    session.commit()
    session.refresh(db_episode)
    return db_episode


@router.post("/{episode_id}/unlock", response_model=EpisodeRead)
def unlock_episode(*, session: Session = Depends(get_session), episode_id: int):
    db_episode = session.get(Episode, episode_id)
    if not db_episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    if db_episode.status != CanonStatus.LOCKED.value:
        raise HTTPException(status_code=400, detail="Episode is not locked")

    apply_update_with_changelog(
        session,
        db_episode,
        "episode",
        {"status": CanonStatus.DRAFT.value, "locked_at": None, "locked_by": None},
        source="api",
    )
    session.commit()
    session.refresh(db_episode)
    return db_episode


@router.delete("/{episode_id}", status_code=204)
def delete_episode(*, session: Session = Depends(get_session), episode_id: int):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    if episode.status == CanonStatus.LOCKED.value:
        raise HTTPException(status_code=403, detail="Cannot delete a locked episode")
    session.delete(episode)
    session.commit()


@router.get("/{episode_id}/changelog")
def get_episode_changelog(*, session: Session = Depends(get_session), episode_id: int):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    query = (
        select(ChangeLog)
        .where(ChangeLog.entity_type == "episode")
        .where(ChangeLog.entity_id == episode_id)
        .order_by(ChangeLog.changed_at.desc())  # type: ignore[union-attr]
    )
    return session.exec(query).all()
