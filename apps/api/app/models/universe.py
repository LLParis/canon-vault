from datetime import datetime

from sqlalchemy import Column
from sqlmodel import Field, SQLModel

from app.models._base import JSONText, utcnow


class UniverseBase(SQLModel):
    name: str = Field(index=True, unique=True)
    slug: str = Field(index=True, unique=True)
    description: str | None = None
    author: str | None = None
    genre: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    rating: str | None = None


class Universe(UniverseBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class UniverseCreate(SQLModel):
    name: str
    slug: str
    description: str | None = None
    author: str | None = None
    genre: list[str] | None = None
    rating: str | None = None


class UniverseRead(UniverseBase):
    id: int
    created_at: datetime
    updated_at: datetime


class UniverseUpdate(SQLModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    author: str | None = None
    genre: list[str] | None = None
    rating: str | None = None
