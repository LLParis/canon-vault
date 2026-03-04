"""Shared base classes, enums, and JSON column helper for Canon Vault."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import Text
from sqlalchemy.types import TypeDecorator
from sqlmodel import Field, SQLModel

# ── JSON column type for SQLite ──────────────────────────────────────────────


class JSONText(TypeDecorator):
    """Store Python dicts/lists as JSON TEXT in SQLite."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value: Any, dialect: Any) -> str | None:
        if value is not None:
            return json.dumps(value, ensure_ascii=False, default=str)
        return None

    def process_result_value(self, value: str | None, dialect: Any) -> Any:
        if value is not None:
            return json.loads(value)
        return None


# ── Enums ────────────────────────────────────────────────────────────────────


class CanonStatus(StrEnum):
    DRAFT = "draft"
    REVIEW = "review"
    LOCKED = "locked"
    EXPERIMENT = "experiment"
    DEPRECATED = "deprecated"


class WorkflowStatus(StrEnum):
    DRAFT = "draft"
    REVIEW = "review"
    EXPERIMENT = "experiment"
    DEPRECATED = "deprecated"


class FactionAlignment(StrEnum):
    HEAVEN = "heaven"
    HELL = "hell"
    NEUTRAL = "neutral"
    HYBRID = "hybrid"


class RelationshipType(StrEnum):
    ROMANTIC = "romantic"
    FAMILY = "family"
    MENTOR = "mentor"
    RIVAL = "rival"
    ENEMY = "enemy"
    ALLY = "ally"
    PARTNER = "partner"
    COMPLICATED = "complicated"


class RuleSeverity(StrEnum):
    ABSOLUTE = "absolute"
    STRONG = "strong"
    SOFT = "soft"


class PromptEngine(StrEnum):
    SDXL = "sdxl"
    VEO = "veo"
    RUNWAY = "runway"
    COMFYUI = "comfyui"


class ChangeSource(StrEnum):
    API = "api"
    INGEST = "ingest"
    UI = "ui"


class EntityType(StrEnum):
    CHARACTER = "character"
    EPISODE = "episode"
    CHAPTER = "chapter"
    LOCATION = "location"
    FACTION = "faction"
    RELATIONSHIP = "relationship"
    PROMPT_TEMPLATE = "prompt_template"
    UNIVERSE = "universe"


# ── Helpers ──────────────────────────────────────────────────────────────────

# Fields that can be edited on locked entities without changelog
LOCK_EXEMPT_FIELDS = {"notes", "tags"}


def utcnow() -> datetime:
    return datetime.now(UTC)


# ── Base entity mixin ────────────────────────────────────────────────────────


class CanonEntityBase(SQLModel):
    """Fields shared by every canon entity table."""

    name: str = Field(index=True)
    canon_id: str = Field(index=True)
    status: str = Field(default=CanonStatus.DRAFT.value, index=True)
    universe_id: int = Field(foreign_key="universe.id", index=True)
    # tags: defined per-table (sa_column can't be shared across tables)
    notes: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    version: int = Field(default=1)
    locked_at: datetime | None = None
    locked_by: str | None = None
    source_hash: str | None = None

    # Note: UNIQUE(universe_id, canon_id) is added per-table via __table_args__
