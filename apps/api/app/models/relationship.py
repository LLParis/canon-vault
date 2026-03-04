from datetime import datetime

from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import JSONText, RelationshipType, WorkflowStatus, utcnow


class RelationshipBase(SQLModel):
    universe_id: int = Field(foreign_key="universe.id", index=True)
    source_character_id: int = Field(foreign_key="character.id", index=True)
    target_character_id: int = Field(foreign_key="character.id", index=True)
    relationship_type: str = Field(index=True)  # RelationshipType enum value
    status: str = Field(default="draft", index=True)
    role: str | None = None
    dynamic: str | None = None
    tension: str | None = None
    their_view: str | None = None
    my_view: str | None = None
    key_beats: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    open_hooks: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    notes: str | None = None


class Relationship(RelationshipBase, table=True):
    __table_args__ = (
        UniqueConstraint(
            "source_character_id",
            "target_character_id",
            "relationship_type",
            name="uq_relationship_pair_type",
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class RelationshipCreate(SQLModel):
    universe_id: int
    source_character_id: int
    target_character_id: int
    relationship_type: RelationshipType
    status: WorkflowStatus = WorkflowStatus.DRAFT
    role: str | None = None
    dynamic: str | None = None
    tension: str | None = None
    their_view: str | None = None
    my_view: str | None = None
    key_beats: list[str] | None = None
    open_hooks: list[str] | None = None
    notes: str | None = None


class RelationshipRead(SQLModel):
    id: int
    universe_id: int
    source_character_id: int
    target_character_id: int
    relationship_type: RelationshipType
    status: WorkflowStatus
    role: str | None = None
    dynamic: str | None = None
    tension: str | None = None
    their_view: str | None = None
    my_view: str | None = None
    key_beats: list | None = None
    open_hooks: list | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class RelationshipUpdate(SQLModel):
    relationship_type: RelationshipType | None = None
    status: WorkflowStatus | None = None
    role: str | None = None
    dynamic: str | None = None
    tension: str | None = None
    their_view: str | None = None
    my_view: str | None = None
    key_beats: list[str] | None = None
    open_hooks: list[str] | None = None
    notes: str | None = None
