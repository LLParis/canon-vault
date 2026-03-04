"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPinned, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

export default function LocationsPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState("all");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations", selectedUniverseId],
    queryFn: () => api.locations.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={MapPinned}
        title="Select a universe first"
        description="Location geography only resolves when a universe is active."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading world surface..." />;
  }

  const locationTypes = [...new Set(locations.map((location) => location.location_type).filter(Boolean))];
  const regions = [...new Set(locations.map((location) => location.region).filter(Boolean))];
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${location.name} ${location.canon_id} ${location.description ?? ""} ${location.atmosphere ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesType = locationType === "all" || location.location_type === locationType;
    const matchesRegion = region === "all" || location.region === region;
    const matchesStatus = status === "all" || location.status === status;

    return matchesSearch && matchesType && matchesRegion && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="World surface"
        title="Locations"
        description="Geography, atmosphere, and production-facing anchors for the universe."
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Search</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <Search className="h-4 w-4 text-cyan-100/90" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, canon ID, atmosphere..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Type</span>
            <select
              value={locationType}
              onChange={(event) => setLocationType(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All types</option>
              {locationTypes.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Region</span>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All regions</option>
              {regions.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
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
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Visible locations</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCount(filteredLocations.length)}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Regions present</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(new Set(filteredLocations.map((item) => item.region).filter(Boolean)).size)}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Locked sites</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(filteredLocations.filter((item) => item.status === "locked").length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredLocations.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredLocations.map((location) => (
            <EntityCard
              key={location.id}
              href={`/locations/${location.id}`}
              title={location.name}
              subtitle={location.atmosphere ?? location.prompt_description ?? "Location dossier"}
              status={location.status}
              accent="cyan"
              meta={[location.canon_id, location.location_type, location.region]}
              tags={location.tags}
              footer={
                <p className="text-sm leading-6 text-slate-300/80">
                  {location.description ?? "Open the location to inspect atmosphere, features, and production assets."}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPinned}
          title="No locations match the active filters"
          description="Broaden the search or add new world anchors to the universe."
        />
      )}
    </div>
  );
}
