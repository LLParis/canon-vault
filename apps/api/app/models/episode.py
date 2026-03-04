from pydantic import BaseModel
from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import CanonEntityBase, CanonStatus, JSONText

# ── Sub-models (loose validation — not enforced on input in v1) ──────────────


class Beat(BaseModel):
    description: str
    characters: list[str] = []
    emotional_note: str | None = None
    visual_note: str | None = None
    is_cinema_crack: bool = False


class Scene(BaseModel):
    title: str
    location_name: str | None = None
    location_id: int | None = None
    characters: list[str] = []
    summary: str = ""
    beats: list[Beat] = []
    emotional_arc: str | None = None
    visual_notes: str | None = None
    duration_estimate: str | None = None


# ── Table ────────────────────────────────────────────────────────────────────


class Episode(CanonEntityBase, table=True):
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_episode_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))

    # Queryable — canon_id IS the episode code (e.g. "S1E01")
    number: int = Field(default=0)
    season: int = Field(default=1, index=True)
    chapter_id: int | None = Field(default=None, foreign_key="chapter.id", index=True)
    script_locked: bool = Field(default=False)

    # Raw source storage
    meta_text: str | None = None
    beats_text: str | None = None
    scenelist_text: str | None = None
    script_path: str | None = None

    # JSON blobs (loosely validated in v1)
    logline: str | None = None
    synopsis: str | None = None
    scenes: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    featured_characters: list | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    supporting_characters: list | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    antagonists: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    threads_introduced: list | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    threads_advanced: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    threads_resolved: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    continuity_anchors: list | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    cliffhanger: str | None = None
    cinema_crack_moment: str | None = None
    animation_notes: str | None = None
    music_cues: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))


# ── Request/Response schemas ─────────────────────────────────────────────────


class EpisodeCreate(SQLModel):
    name: str
    canon_id: str  # e.g. "S1E01"
    universe_id: int
    number: int = 0
    season: int = 1
    chapter_id: int | None = None
    status: CanonStatus = CanonStatus.DRAFT
    script_locked: bool = False
    meta_text: str | None = None
    beats_text: str | None = None
    scenelist_text: str | None = None
    script_path: str | None = None
    logline: str | None = None
    synopsis: str | None = None
    scenes: list | None = None
    featured_characters: list[str] | None = None
    supporting_characters: list[str] | None = None
    antagonists: list[str] | None = None
    threads_introduced: list[str] | None = None
    threads_advanced: list[str] | None = None
    threads_resolved: list[str] | None = None
    continuity_anchors: list[str] | None = None
    cliffhanger: str | None = None
    cinema_crack_moment: str | None = None
    animation_notes: str | None = None
    music_cues: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None


class EpisodeRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    number: int
    season: int
    chapter_id: int | None = None
    status: CanonStatus
    script_locked: bool
    meta_text: str | None = None
    beats_text: str | None = None
    scenelist_text: str | None = None
    script_path: str | None = None
    logline: str | None = None
    synopsis: str | None = None
    scenes: list | None = None
    featured_characters: list | None = None
    supporting_characters: list | None = None
    antagonists: list | None = None
    threads_introduced: list | None = None
    threads_advanced: list | None = None
    threads_resolved: list | None = None
    continuity_anchors: list | None = None
    cliffhanger: str | None = None
    cinema_crack_moment: str | None = None
    animation_notes: str | None = None
    music_cues: list | None = None
    tags: list | None = None
    notes: str | None = None


class EpisodeUpdate(SQLModel):
    name: str | None = None
    number: int | None = None
    season: int | None = None
    chapter_id: int | None = None
    status: CanonStatus | None = None
    script_locked: bool | None = None
    meta_text: str | None = None
    beats_text: str | None = None
    scenelist_text: str | None = None
    script_path: str | None = None
    logline: str | None = None
    synopsis: str | None = None
    scenes: list | None = None
    featured_characters: list[str] | None = None
    supporting_characters: list[str] | None = None
    antagonists: list[str] | None = None
    threads_introduced: list[str] | None = None
    threads_advanced: list[str] | None = None
    threads_resolved: list[str] | None = None
    continuity_anchors: list[str] | None = None
    cliffhanger: str | None = None
    cinema_crack_moment: str | None = None
    animation_notes: str | None = None
    music_cues: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None


class EpisodeScriptRead(SQLModel):
    episode_id: int
    canon_id: str
    path: str | None = None
    source_type: str | None = None
    is_available: bool
    content: str | None = None
    line_count: int = 0
    message: str | None = None
