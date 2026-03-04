import type { components } from "@/lib/api/generated";

export type Universe = components["schemas"]["UniverseRead"];
export type Character = components["schemas"]["CharacterRead"];
export type CharacterUpdateInput = components["schemas"]["CharacterUpdate"];
export type Relationship = components["schemas"]["RelationshipRead"];
export type Episode = components["schemas"]["EpisodeRead"];
export type EpisodeScript = components["schemas"]["EpisodeScriptRead"];
export type EpisodeUpdateInput = components["schemas"]["EpisodeUpdate"];
export type Chapter = components["schemas"]["ChapterRead"];
export type ChapterUpdateInput = components["schemas"]["ChapterUpdate"];
export type Location = components["schemas"]["LocationRead"];
export type LocationUpdateInput = components["schemas"]["LocationUpdate"];
export type Faction = components["schemas"]["FactionRead"];
export type FactionUpdateInput = components["schemas"]["FactionUpdate"];
export type PromptTemplate = components["schemas"]["PromptTemplateRead"];
export type PromptTemplateUpdateInput = components["schemas"]["PromptTemplateUpdate"];

export type CanonStatus = components["schemas"]["CanonStatus"];
export type WorkflowStatus = components["schemas"]["WorkflowStatus"];
export type RelationshipType = components["schemas"]["RelationshipType"];
export type PromptEngine = components["schemas"]["PromptEngine"];

// --- Hand-written types below ---
// These backend responses lack dedicated Pydantic schemas, so they're not in
// the OpenAPI spec. Add response models to the API routers to auto-generate.

export interface ChangeLogEntry {
  id: number;
  universe_id: number;
  entity_type: string;
  entity_id: number;
  entity_canon_id: string;
  entity_version_before: number;
  entity_version_after: number;
  change_set_id: string | null;
  field_changed: string;
  old_value: unknown;
  new_value: unknown;
  change_source: string;
  changed_at: string;
  changed_by: string | null;
}

export interface IngestCharacterResult {
  action: "created" | "updated" | "skipped";
  reason?: string;
  canon_id: string;
  character_id: number;
  relationships_created: number;
}

export interface BootstrapSourceResult {
  source_root: string;
  yaml_processed: number;
  yaml_imported: number;
  yaml_skipped: number;
  season_roots_processed: number;
  chapter_roots_processed: number;
  chapters_imported: number;
  chapters_skipped: number;
  episode_packs_processed: number;
  episodes_imported: number;
  episodes_skipped: number;
  text_bundles_processed: number;
  text_imported: number;
  text_skipped: number;
  errors: string[];
}

export interface PromptRenderResult {
  template_id: number;
  engine: PromptEngine;
  rendered_prompt: string;
  neg_prompt: string | null;
  parameters: Record<string, unknown> | null;
  loras: unknown[] | null;
  unresolved_variables?: string[];
}

// Client-side aggregation — no backend equivalent.
export interface DashboardSnapshot {
  universe: Universe | null;
  counts: {
    characters: number;
    relationships: number;
    episodes: number;
    chapters: number;
    locations: number;
    factions: number;
    promptTemplates: number;
  };
  spotlightCharacters: Character[];
  lockedCharacters: number;
  reviewedCharacters: number;
}

// Client-side enrichment — joins character names onto raw relationship data.
export interface ResolvedRelationship extends Relationship {
  source_name: string;
  target_name: string;
}
