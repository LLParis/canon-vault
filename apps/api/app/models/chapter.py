from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import CanonEntityBase, CanonStatus, JSONText


class Chapter(CanonEntityBase, table=True):
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_chapter_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    chapter_number: int = Field(default=1)
    season: int = Field(default=1, index=True)
    episode_range: str | None = None
    premise: str | None = None
    central_conflict: str | None = None
    resolution: str | None = None
    themes: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    motifs: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))


class ChapterCreate(SQLModel):
    name: str
    canon_id: str
    universe_id: int
    chapter_number: int = 1
    season: int = 1
    status: CanonStatus = CanonStatus.DRAFT
    episode_range: str | None = None
    premise: str | None = None
    central_conflict: str | None = None
    resolution: str | None = None
    themes: list[str] | None = None
    motifs: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None


class ChapterRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    chapter_number: int
    season: int
    status: CanonStatus
    episode_range: str | None = None
    premise: str | None = None
    central_conflict: str | None = None
    resolution: str | None = None
    themes: list | None = None
    motifs: list | None = None
    tags: list | None = None
    notes: str | None = None


class ChapterUpdate(SQLModel):
    name: str | None = None
    chapter_number: int | None = None
    season: int | None = None
    status: CanonStatus | None = None
    episode_range: str | None = None
    premise: str | None = None
    central_conflict: str | None = None
    resolution: str | None = None
    themes: list[str] | None = None
    motifs: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None
