from datetime import datetime

from sqlalchemy import Column, Index
from sqlmodel import Field, SQLModel

from app.models._base import JSONText, utcnow


class ChangeLog(SQLModel, table=True):
    __tablename__ = "changelog"
    __table_args__ = (
        Index("ix_changelog_entity", "entity_type", "entity_id"),
        Index("ix_changelog_canon", "entity_type", "entity_canon_id"),
    )

    id: int | None = Field(default=None, primary_key=True)
    universe_id: int = Field(foreign_key="universe.id", index=True)

    # What changed
    entity_type: str = Field(index=True)  # EntityType enum value
    entity_id: int
    entity_canon_id: str = Field(index=True)

    # Version tracking
    entity_version_before: int
    entity_version_after: int

    # Grouping (multiple field changes from one operation share a change_set_id)
    change_set_id: str | None = Field(default=None, index=True)

    # What specifically changed
    field_changed: str  # dotpath like "moveset.signature_moves" or "name"
    old_value: dict | list | str | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    new_value: dict | list | str | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )

    # Who/what did it
    change_source: str  # ChangeSource enum value: "api", "ingest", "ui"
    changed_at: datetime = Field(default_factory=utcnow)
    changed_by: str | None = None
