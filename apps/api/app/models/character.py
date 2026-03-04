"""Character model — the centerpiece of Canon Vault.

Pydantic sub-models validate JSON on write; SQLModel table stores
queryable columns + JSON TEXT blobs.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models._base import CanonEntityBase, CanonStatus, JSONText

# ── Pydantic sub-models (validation only, not DB tables) ─────────────────────


class Lineage(BaseModel):
    father: str | None = None
    father_id: str | None = None
    father_power: str | None = None
    mother: str | None = None
    mother_id: str | None = None
    mother_power: str | None = None
    notes: str | None = None


class AetherialType(BaseModel):
    primary: str | None = None  # FactionAlignment value
    secondary: str | None = None
    ratio: str | None = None  # e.g. "90/10 Heaven/Hell"
    source: str | None = None  # bloodline, ritual, graft
    description: str | None = None
    rules: list[str] = []


class CoreIdentity(BaseModel):
    codename: str | None = None
    real_name: str | None = None
    aliases: list[str] = []
    role: str | None = None
    generation: str | None = None
    lineage: Lineage | None = None
    aetherial: AetherialType | None = None
    symbol: str | None = None
    concept: str | None = None
    theme_question: str | None = None


class VisualRule(BaseModel):
    element: str  # hair, eyes, wings, etc.
    rule: str
    is_locked: bool = False
    notes: str | None = None


class VisualSilhouette(BaseModel):
    age_range: str | None = None
    build: str | None = None
    height: str | None = None
    hair_color: str | None = None
    hair_style: str | None = None
    hair_notes: str | None = None
    eye_color: str | None = None
    eye_notes: str | None = None
    scars: list[str] = []
    tattoos: list[str] = []
    wings: str | None = None
    halo: str | None = None
    horns: str | None = None
    aether_veins: str | None = None
    other_features: list[str] = []
    clothing_lane: str | None = None
    typical_fits: list[str] = []
    visual_rules: list[VisualRule] = []


class Personality(BaseModel):
    surface_read: str | None = None
    inner_world: str | None = None
    core_wound: str | None = None
    core_desire: str | None = None
    core_fear: str | None = None
    traits: list[str] = []
    strengths: list[str] = []
    flaws: list[str] = []
    secrets: list[str] = []


class Quirks(BaseModel):
    behaviors: list[str] = []
    tells: list[str] = []
    habits: list[str] = []
    combat_behaviors: list[str] = []


class Voice(BaseModel):
    tone: str | None = None
    speech_patterns: str | None = None
    swearing: str | None = None
    humor_style: str | None = None
    flirting_style: str | None = None
    sample_lines: list[str] = []


class Move(BaseModel):
    name: str
    visual: str | None = None
    function: str | None = None
    cost: str | None = None
    evolution: str | None = None
    notes: str | None = None


class Moveset(BaseModel):
    alignment_source: str | None = None
    visual_motif: str | None = None
    rules: list[str] = []
    core_moves: list[Move] = []
    signature_moves: list[Move] = []
    passives: list[Move] = []
    inherited_tech: list[Move] = []
    future_unlocks: list[Move] = []


class FormStage(BaseModel):
    stage: int
    name: str
    age: str | None = None
    hair: str | None = None
    eyes: str | None = None
    veins: str | None = None
    aura: str | None = None
    other_visuals: list[str] = []
    power_ratio: str | None = None
    kit: list[str] = []
    role: str | None = None
    scale: str | None = None
    notes: str | None = None


class ArcPhase(BaseModel):
    phase: int
    name: str
    age_range: str | None = None
    description: str | None = None
    key_events: list[str] = []
    form_stage: int | None = None
    notes: str | None = None


class AssetReference(BaseModel):
    path: str
    category: str | None = None
    description: str | None = None
    is_canon: bool = True


class CanonRuleItem(BaseModel):
    rule: str
    severity: str = "strong"  # absolute/strong/soft
    reason: str | None = None


class SectionVersions(BaseModel):
    identity: int = 1
    visual: int = 1
    personality: int = 1
    voice: int = 1
    moveset: int = 1
    forms: int = 1
    relationships: int = 1
    timeline: int = 1
    notes: int = 1


# ── SQLModel table ───────────────────────────────────────────────────────────


class Character(CanonEntityBase, table=True):
    __table_args__ = (
        UniqueConstraint("universe_id", "canon_id", name="uq_character_universe_canon"),
    )

    id: int | None = Field(default=None, primary_key=True)
    tags: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))

    # Queryable columns
    codename: str | None = Field(default=None, index=True)
    faction: str | None = Field(default=None, index=True)
    cast_tier: str | None = Field(default=None, index=True)

    # JSON blob columns
    identity: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    visual: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    personality: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    quirks: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    voice: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    moveset: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    forms: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    themes: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    arc_phases: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    canon_rules: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    open_hooks: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    assets: list | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    section_versions: dict | None = Field(default=None, sa_column=Column(JSONText, nullable=True))
    prompt_description: str | None = None


# ── Request/Response schemas ─────────────────────────────────────────────────


class CharacterCreate(SQLModel):
    name: str
    canon_id: str
    universe_id: int
    codename: str | None = None
    faction: str | None = None
    cast_tier: str | None = None
    status: CanonStatus = CanonStatus.DRAFT
    tags: list[str] | None = None
    notes: str | None = None
    identity: CoreIdentity | None = None
    visual: VisualSilhouette | None = None
    personality: Personality | None = None
    quirks: Quirks | None = None
    voice: Voice | None = None
    moveset: Moveset | None = None
    forms: list[FormStage] | None = None
    themes: list[str] | None = None
    arc_phases: list[ArcPhase] | None = None
    canon_rules: list[CanonRuleItem] | None = None
    open_hooks: list[str] | None = None
    assets: list[AssetReference] | None = None
    section_versions: SectionVersions | None = None
    prompt_description: str | None = None


class CharacterRead(SQLModel):
    id: int
    name: str
    canon_id: str
    universe_id: int
    codename: str | None = None
    faction: str | None = None
    cast_tier: str | None = None
    status: CanonStatus
    tags: list | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    version: int
    locked_at: datetime | None = None
    locked_by: str | None = None
    source_hash: str | None = None
    identity: dict | None = None
    visual: dict | None = None
    personality: dict | None = None
    quirks: dict | None = None
    voice: dict | None = None
    moveset: dict | None = None
    forms: list | None = None
    themes: list | None = None
    arc_phases: list | None = None
    canon_rules: list | None = None
    open_hooks: list | None = None
    assets: list | None = None
    section_versions: dict | None = None
    prompt_description: str | None = None


class CharacterUpdate(SQLModel):
    name: str | None = None
    codename: str | None = None
    faction: str | None = None
    cast_tier: str | None = None
    status: CanonStatus | None = None
    tags: list[str] | None = None
    notes: str | None = None
    identity: CoreIdentity | None = None
    visual: VisualSilhouette | None = None
    personality: Personality | None = None
    quirks: Quirks | None = None
    voice: Voice | None = None
    moveset: Moveset | None = None
    forms: list[FormStage] | None = None
    themes: list[str] | None = None
    arc_phases: list[ArcPhase] | None = None
    canon_rules: list[CanonRuleItem] | None = None
    open_hooks: list[str] | None = None
    assets: list[AssetReference] | None = None
    section_versions: SectionVersions | None = None
    prompt_description: str | None = None
