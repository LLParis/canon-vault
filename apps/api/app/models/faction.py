from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import CanonEntityBase, CanonStatus, JSONText


class Faction(CanonEntityBase, table=True):
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_faction_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    description: str | None = None
    motto: str | None = None
    symbol: str | None = None
    aesthetic: str | None = None
    hierarchy: str | None = None
    goals: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    methods: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    territory: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))


class FactionCreate(SQLModel):
    name: str
    canon_id: str
    universe_id: int
    status: CanonStatus = CanonStatus.DRAFT
    description: str | None = None
    motto: str | None = None
    symbol: str | None = None
    aesthetic: str | None = None
    hierarchy: str | None = None
    goals: list[str] | None = None
    methods: list[str] | None = None
    territory: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None


class FactionRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    status: CanonStatus
    description: str | None = None
    motto: str | None = None
    symbol: str | None = None
    aesthetic: str | None = None
    hierarchy: str | None = None
    goals: list | None = None
    methods: list | None = None
    territory: list | None = None
    tags: list | None = None
    notes: str | None = None


class FactionUpdate(SQLModel):
    name: str | None = None
    status: CanonStatus | None = None
    description: str | None = None
    motto: str | None = None
    symbol: str | None = None
    aesthetic: str | None = None
    hierarchy: str | None = None
    goals: list[str] | None = None
    methods: list[str] | None = None
    territory: list[str] | None = None
    tags: list[str] | None = None
    notes: str | None = None
