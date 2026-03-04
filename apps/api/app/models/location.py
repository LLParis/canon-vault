from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import CanonEntityBase, CanonStatus, JSONText


class Location(CanonEntityBase, table=True):
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_location_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    location_type: str | None = Field(default=None, index=True)
    region: str | None = Field(default=None, index=True)
    parent_location_id: int | None = Field(default=None, foreign_key="location.id")
    description: str | None = None
    atmosphere: str | None = None
    visual_style: str | None = None
    notable_features: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    associated_characters: list | None = Field(
        default=None, sa_column=Column(JSONText, nullable=True)
    )
    prompt_description: str | None = None
    assets: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))


class LocationCreate(SQLModel):
    name: str
    canon_id: str
    universe_id: int
    location_type: str | None = None
    region: str | None = None
    parent_location_id: int | None = None
    status: CanonStatus = CanonStatus.DRAFT
    description: str | None = None
    atmosphere: str | None = None
    visual_style: str | None = None
    notable_features: list[str] | None = None
    associated_characters: list[str] | None = None
    prompt_description: str | None = None
    assets: list | None = None
    tags: list[str] | None = None
    notes: str | None = None


class LocationRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    location_type: str | None = None
    region: str | None = None
    parent_location_id: int | None = None
    status: CanonStatus
    description: str | None = None
    atmosphere: str | None = None
    visual_style: str | None = None
    notable_features: list | None = None
    associated_characters: list | None = None
    prompt_description: str | None = None
    assets: list | None = None
    tags: list | None = None
    notes: str | None = None


class LocationUpdate(SQLModel):
    name: str | None = None
    location_type: str | None = None
    region: str | None = None
    parent_location_id: int | None = None
    status: CanonStatus | None = None
    description: str | None = None
    atmosphere: str | None = None
    visual_style: str | None = None
    notable_features: list[str] | None = None
    associated_characters: list[str] | None = None
    prompt_description: str | None = None
    assets: list | None = None
    tags: list[str] | None = None
    notes: str | None = None
