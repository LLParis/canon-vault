import type {
  CanonStatus,
  ChangeLogEntry,
  Chapter,
  ChapterUpdateInput,
  Character,
  CharacterUpdateInput,
  DashboardSnapshot,
  Episode,
  EpisodeScript,
  EpisodeUpdateInput,
  Faction,
  FactionUpdateInput,
  BootstrapSourceResult,
  IngestCharacterResult,
  Location,
  LocationUpdateInput,
  PromptEngine,
  PromptRenderResult,
  PromptTemplate,
  PromptTemplateUpdateInput,
  Relationship,
  RelationshipType,
  Universe,
  WorkflowStatus,
} from "@/lib/api/types";
import { dateSortValue } from "@/lib/utils";

type QueryValue = string | number | boolean | null | undefined;
type QueryRecord = Record<string, QueryValue>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function buildUrl(path: string, query?: QueryRecord) {
  const url = new URL(path, API_BASE_URL);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function readError(response: Response) {
  try {
    return await response.json();
  } catch {
    return response.statusText;
  }
}

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: QueryRecord;
    body?: BodyInit | FormData | null | unknown;
  } = {},
) {
  const { method = "GET", query, body } = options;
  const headers = new Headers();
  let payload: BodyInit | null | undefined = null;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined && body !== null) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
  });

  if (!response.ok) {
    const detail = await readError(response);
    throw new ApiError(`API request failed for ${path}`, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function withDefaultLimit(query?: QueryRecord) {
  return { limit: 500, ...query };
}

export const api = {
  universes: {
    list: () => request<Universe[]>("/api/v1/universes/"),
    get: (id: number) => request<Universe>(`/api/v1/universes/${id}`),
  },
  dashboard: {
    async getSnapshot(universeId: number): Promise<DashboardSnapshot> {
      const [universes, characters, relationships, episodes, chapters, locations, factions, promptTemplates] =
        await Promise.all([
          api.universes.list(),
          api.characters.list({ universe_id: universeId }),
          api.relationships.list({ universe_id: universeId }),
          api.episodes.list({ universe_id: universeId }),
          api.chapters.list({ universe_id: universeId }),
          api.locations.list({ universe_id: universeId }),
          api.factions.list({ universe_id: universeId }),
          api.promptTemplates.list({ universe_id: universeId }),
        ]);

      const universe = universes.find((item) => item.id === universeId) ?? null;
      const spotlightCharacters = [...characters]
        .sort((left, right) => dateSortValue(right.updated_at) - dateSortValue(left.updated_at))
        .slice(0, 3);

      return {
        universe,
        counts: {
          characters: characters.length,
          relationships: relationships.length,
          episodes: episodes.length,
          chapters: chapters.length,
          locations: locations.length,
          factions: factions.length,
          promptTemplates: promptTemplates.length,
        },
        spotlightCharacters,
        lockedCharacters: characters.filter((character) => character.status === "locked").length,
        reviewedCharacters: characters.filter((character) => character.status === "review").length,
      };
    },
  },
  characters: {
    list: (query?: {
      universe_id?: number | null;
      faction?: string;
      cast_tier?: string;
      status?: CanonStatus | null;
    }) => request<Character[]>("/api/v1/characters/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<Character>(`/api/v1/characters/${id}`),
    update: (id: number, data: CharacterUpdateInput) =>
      request<Character>(`/api/v1/characters/${id}`, { method: "PATCH", body: data }),
    unlock: (id: number) =>
      request<Character>(`/api/v1/characters/${id}/unlock`, { method: "POST" }),
    listRelationships: (id: number) =>
      request<Relationship[]>(`/api/v1/characters/${id}/relationships`),
    getChangelog: (id: number) =>
      request<ChangeLogEntry[]>(`/api/v1/characters/${id}/changelog`),
  },
  relationships: {
    list: (query?: {
      universe_id?: number | null;
      character_id?: number | null;
      relationship_type?: RelationshipType | null;
    }) => request<Relationship[]>("/api/v1/relationships/", { query: withDefaultLimit(query) }),
  },
  episodes: {
    list: (query?: {
      universe_id?: number | null;
      season?: number | null;
      chapter_id?: number | null;
      status?: CanonStatus | null;
    }) => request<Episode[]>("/api/v1/episodes/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<Episode>(`/api/v1/episodes/${id}`),
    getScript: (id: number) => request<EpisodeScript>(`/api/v1/episodes/${id}/script`),
    update: (id: number, data: EpisodeUpdateInput) =>
      request<Episode>(`/api/v1/episodes/${id}`, { method: "PATCH", body: data }),
    unlock: (id: number) => request<Episode>(`/api/v1/episodes/${id}/unlock`, { method: "POST" }),
    getChangelog: (id: number) => request<ChangeLogEntry[]>(`/api/v1/episodes/${id}/changelog`),
  },
  chapters: {
    list: (query?: {
      universe_id?: number | null;
      season?: number | null;
      status?: CanonStatus | null;
    }) => request<Chapter[]>("/api/v1/chapters/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<Chapter>(`/api/v1/chapters/${id}`),
    update: (id: number, data: ChapterUpdateInput) =>
      request<Chapter>(`/api/v1/chapters/${id}`, { method: "PATCH", body: data }),
    unlock: (id: number) => request<Chapter>(`/api/v1/chapters/${id}/unlock`, { method: "POST" }),
    getChangelog: (id: number) => request<ChangeLogEntry[]>(`/api/v1/chapters/${id}/changelog`),
  },
  locations: {
    list: (query?: {
      universe_id?: number | null;
      location_type?: string;
      region?: string;
      status?: CanonStatus | null;
    }) => request<Location[]>("/api/v1/locations/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<Location>(`/api/v1/locations/${id}`),
    update: (id: number, data: LocationUpdateInput) =>
      request<Location>(`/api/v1/locations/${id}`, { method: "PATCH", body: data }),
    unlock: (id: number) =>
      request<Location>(`/api/v1/locations/${id}/unlock`, { method: "POST" }),
  },
  factions: {
    list: (query?: {
      universe_id?: number | null;
      status?: CanonStatus | null;
    }) => request<Faction[]>("/api/v1/factions/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<Faction>(`/api/v1/factions/${id}`),
    update: (id: number, data: FactionUpdateInput) =>
      request<Faction>(`/api/v1/factions/${id}`, { method: "PATCH", body: data }),
    unlock: (id: number) =>
      request<Faction>(`/api/v1/factions/${id}/unlock`, { method: "POST" }),
  },
  promptTemplates: {
    list: (query?: {
      universe_id?: number | null;
      engine?: PromptEngine | null;
      status?: WorkflowStatus | null;
    }) =>
      request<PromptTemplate[]>("/api/v1/prompt-templates/", { query: withDefaultLimit(query) }),
    get: (id: number) => request<PromptTemplate>(`/api/v1/prompt-templates/${id}`),
    update: (id: number, data: PromptTemplateUpdateInput) =>
      request<PromptTemplate>(`/api/v1/prompt-templates/${id}`, {
        method: "PATCH",
        body: data,
      }),
    render: (id: number, query?: { character_id?: number | null; location_id?: number | null }) =>
      request<PromptRenderResult>(`/api/v1/prompt-templates/${id}/render`, {
        method: "POST",
        query,
      }),
  },
  ingest: {
    characterYaml: async (file: File, universeId: number) => {
      const formData = new FormData();
      formData.set("file", file);
      return request<IngestCharacterResult>("/api/v1/ingest/character-yaml", {
        method: "POST",
        query: { universe_id: universeId },
        body: formData,
      });
    },
    bootstrapSource: (universeId: number, sourceRoot?: string) =>
      request<BootstrapSourceResult>("/api/v1/ingest/bootstrap-source", {
        method: "POST",
        query: { universe_id: universeId },
        body: { source_root: sourceRoot || null },
      }),
  },
};
