from datetime import datetime

from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import JSONText, PromptEngine, WorkflowStatus, utcnow


class PromptTemplate(SQLModel, table=True):
    __tablename__ = "prompt_template"
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_prompt_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    universe_id: int = Field(foreign_key="universe.id", index=True)
    name: str = Field(index=True)
    canon_id: str = Field(index=True)
    engine: str = Field(index=True)  # sdxl, veo, runway, comfyui
    entity_type: str | None = None  # character, location, scene
    status: str = Field(default="draft")
    template: str  # text with {{character.name}}, {{location.atmosphere}}, etc.
    neg_prompt: str | None = None
    loras: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    parameters: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    notes: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class PromptTemplateCreate(SQLModel):
    name: str
    canon_id: str
    universe_id: int
    engine: PromptEngine
    entity_type: str | None = None
    status: WorkflowStatus = WorkflowStatus.DRAFT
    template: str
    neg_prompt: str | None = None
    loras: list | None = None
    parameters: dict | None = None
    tags: list[str] | None = None
    notes: str | None = None


class PromptTemplateRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    engine: PromptEngine
    entity_type: str | None = None
    status: WorkflowStatus
    template: str
    neg_prompt: str | None = None
    loras: list | None = None
    parameters: dict | None = None
    tags: list | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class PromptTemplateUpdate(SQLModel):
    name: str | None = None
    engine: PromptEngine | None = None
    entity_type: str | None = None
    status: WorkflowStatus | None = None
    template: str | None = None
    neg_prompt: str | None = None
    loras: list | None = None
    parameters: dict | None = None
    tags: list[str] | None = None
    notes: str | None = None
