"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Shield } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

export default function FactionsPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: factions = [], isLoading } = useQuery({
    queryKey: ["factions", selectedUniverseId],
    queryFn: () => api.factions.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={Shield}
        title="Select a universe first"
        description="Faction power blocs only resolve inside an active universe."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading faction power blocs..." />;
  }

  const filteredFactions = factions.filter((faction) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${faction.name} ${faction.canon_id} ${faction.description ?? ""} ${faction.motto ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesStatus = status === "all" || faction.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Power blocs"
        title="Factions"
        description="Ideology, methods, territory, and control surfaces for the forces shaping the universe."
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-sky-200" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, canon ID, motto..."
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
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Visible factions</p>
            <p className="mt-3 text-2xl font-medium text-white">{formatCount(filteredFactions.length)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Locked factions</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredFactions.filter((item) => item.status === "locked").length)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Doctrine-rich</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredFactions.filter((item) => (item.goals?.length ?? 0) > 0).length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredFactions.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredFactions.map((faction) => (
            <EntityCard
              key={faction.id}
              href={`/factions/${faction.id}`}
              title={faction.name}
              subtitle={faction.motto ?? faction.aesthetic ?? "Faction dossier"}
              status={faction.status}
              accent="rose"
              meta={[faction.canon_id, faction.hierarchy]}
              tags={faction.tags}
              footer={
                <p className="text-sm leading-relaxed text-slate-300">
                  {faction.description ?? "Open the faction to inspect doctrine, methods, and territory."}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title="No factions match the active filters"
          description="Broaden the filters or add power blocs to the active universe."
        />
      )}
    </div>
  );
}
