"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import type { Character } from "@/lib/api/types";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

function characterAccent(character: Character) {
  if (character.faction === "hell") {
    return "rose";
  }
  if (character.faction === "hybrid") {
    return "lime";
  }
  if (character.faction === "neutral") {
    return "amber";
  }
  return "cyan";
}

export default function CharactersPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [faction, setFaction] = useState("all");
  const [castTier, setCastTier] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["characters", selectedUniverseId],
    queryFn: () => api.characters.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={Users}
        title="Select a universe first"
        description="Character operations are universe-scoped. Pick a universe from the left rail to bring the cast online."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading character dossiers..." />;
  }

  const factions = [...new Set(characters.map((character) => character.faction).filter(Boolean))];
  const castTiers = [...new Set(characters.map((character) => character.cast_tier).filter(Boolean))];

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${character.name} ${character.canon_id} ${character.codename ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());

    const matchesStatus = status === "all" || character.status === status;
    const matchesFaction = faction === "all" || character.faction === faction;
    const matchesCastTier = castTier === "all" || character.cast_tier === castTier;

    return matchesSearch && matchesStatus && matchesFaction && matchesCastTier;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Character nucleus"
        title="Cast registry"
        description="Browse, filter, and enter the canonical dossiers that every other workflow depends on."
        actions={
          <Link
            href="/ingest"
            className="rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-sm font-medium text-sky-200"
          >
            Ingest character YAML
          </Link>
        }
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-sky-200" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, codename, canon ID..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All statuses</option>
              <option value="draft" className="bg-slate-950">Draft</option>
              <option value="review" className="bg-slate-950">Review</option>
              <option value="locked" className="bg-slate-950">Locked</option>
              <option value="experiment" className="bg-slate-950">Experiment</option>
              <option value="deprecated" className="bg-slate-950">Deprecated</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Faction</span>
            <select
              value={faction}
              onChange={(event) => setFaction(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All factions</option>
              {factions.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Cast tier</span>
            <select
              value={castTier}
              onChange={(event) => setCastTier(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All cast tiers</option>
              {castTiers.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Visible dossiers</p>
            <p className="mt-3 text-2xl font-medium text-white">{formatCount(filteredCharacters.length)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Locked</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredCharacters.filter((character) => character.status === "locked").length)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Review queue</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredCharacters.filter((character) => character.status === "review").length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredCharacters.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredCharacters.map((character) => (
            <EntityCard
              key={character.id}
              href={`/characters/${character.id}`}
              title={character.name}
              subtitle={character.codename ?? character.prompt_description ?? "Character dossier"}
              status={character.status}
              accent={characterAccent(character)}
              meta={[character.canon_id, character.faction, character.cast_tier]}
              tags={character.tags}
              footer={
                <p className="text-sm leading-relaxed text-slate-300">
                  {character.prompt_description ?? "Enter the dossier to inspect structured canon sections and changelog drift."}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No characters match the active filters"
          description="Broaden the search or ingest a new YAML file to populate the cast registry."
        />
      )}
    </div>
  );
}
