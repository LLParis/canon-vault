"use client";

import { useQuery } from "@tanstack/react-query";
import { GitBranchPlus, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount, formatDateTime } from "@/lib/utils";

export default function RelationshipsPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [characterId, setCharacterId] = useState("all");
  const [relationshipType, setRelationshipType] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ["relationships", selectedUniverseId],
    queryFn: () => api.relationships.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });
  const { data: characters = [] } = useQuery({
    queryKey: ["relationships-characters", selectedUniverseId],
    queryFn: () => api.characters.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  const byId = useMemo(
    () => new Map(characters.map((character) => [character.id, character.name])),
    [characters],
  );

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={GitBranchPlus}
        title="Select a universe first"
        description="Relationship topology is universe-scoped. Pick a universe to inspect the social graph."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Resolving relationship lattice..." />;
  }

  const relationshipTypes = [
    ...new Set(relationships.map((relationship) => relationship.relationship_type).filter(Boolean)),
  ];

  const filteredRelationships = relationships.filter((relationship) => {
    const sourceName = byId.get(relationship.source_character_id) ?? `Character #${relationship.source_character_id}`;
    const targetName = byId.get(relationship.target_character_id) ?? `Character #${relationship.target_character_id}`;
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${sourceName} ${targetName} ${relationship.relationship_type} ${relationship.dynamic ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesCharacter =
      characterId === "all" ||
      relationship.source_character_id === Number(characterId) ||
      relationship.target_character_id === Number(characterId);
    const matchesType =
      relationshipType === "all" || relationship.relationship_type === relationshipType;

    return matchesSearch && matchesCharacter && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Social graph"
        title="Relationship lattice"
        description="The emotional geometry of the universe. Tension, allegiance, rivalry, and fracture lines live here."
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-sky-200" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Names, types, dynamics..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Character</span>
            <select
              value={characterId}
              onChange={(event) => setCharacterId(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">
                All characters
              </option>
              {characters.map((character) => (
                <option key={character.id} value={character.id} className="bg-slate-950">
                  {character.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Type</span>
            <select
              value={relationshipType}
              onChange={(event) => setRelationshipType(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">
                All relationship types
              </option>
              {relationshipTypes.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Visible edges</p>
            <p className="mt-3 text-2xl font-medium text-white">{formatCount(filteredRelationships.length)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Types present</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(new Set(filteredRelationships.map((item) => item.relationship_type)).size)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Review queue</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredRelationships.filter((item) => item.status === "review").length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredRelationships.length ? (
        <div className="space-y-3">
          {filteredRelationships.map((relationship) => {
            const sourceName =
              byId.get(relationship.source_character_id) ?? `Character #${relationship.source_character_id}`;
            const targetName =
              byId.get(relationship.target_character_id) ?? `Character #${relationship.target_character_id}`;

            return (
              <SectionPanel key={relationship.id} className="space-y-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={relationship.status} />
                      <span className="rounded-full border border-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300">
                        {relationship.relationship_type}
                      </span>
                      {relationship.role ? (
                        <span className="rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-3 py-1 text-xs font-medium text-sky-200">
                          {relationship.role}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-2xl font-medium tracking-[-0.02em] text-white">
                      {sourceName} to {targetName}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {relationship.dynamic ?? relationship.tension ?? "No dynamic summary written yet."}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-300">
                    <p>Source #{relationship.source_character_id}</p>
                    <p>Target #{relationship.target_character_id}</p>
                    <p>Updated {formatDateTime(relationship.updated_at)}</p>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] p-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">Their view</p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {relationship.their_view ?? "Not written."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] p-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">My view</p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {relationship.my_view ?? "Not written."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] p-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">Tension</p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {relationship.tension ?? "No active tension marker."}
                    </p>
                  </div>
                </div>
              </SectionPanel>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={GitBranchPlus}
          title="No relationship edges match the active filters"
          description="Broaden the filters or ingest more canon to populate the lattice."
        />
      )}
    </div>
  );
}
