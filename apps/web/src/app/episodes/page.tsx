"use client";

import { useQuery } from "@tanstack/react-query";
import { Clapperboard, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

export default function EpisodesPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["episodes", selectedUniverseId],
    queryFn: () => api.episodes.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["episodes-chapters", selectedUniverseId],
    queryFn: () => api.chapters.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  const chapterById = useMemo(
    () => new Map(chapters.map((chapter) => [chapter.id, chapter.name])),
    [chapters],
  );

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="Select a universe first"
        description="Episode architecture only resolves inside an active universe."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading episode architecture..." />;
  }

  const seasons = [...new Set(episodes.map((episode) => episode.season))].sort((a, b) => a - b);
  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${episode.name} ${episode.canon_id} ${episode.logline ?? ""} ${episode.synopsis ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesSeason = season === "all" || episode.season === Number(season);
    const matchesStatus = status === "all" || episode.status === status;

    return matchesSearch && matchesSeason && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Story delivery"
        title="Episodes"
        description="The production-facing episode layer: beats, scenes, continuity anchors, and cliffhangers."
        actions={
          <Link
            href="/chapters"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-100"
          >
            Open chapters
          </Link>
        }
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Search</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <Search className="h-4 w-4 text-cyan-100/90" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Episode name, canon ID, logline..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Season</span>
            <select
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">
                All seasons
              </option>
              {seasons.map((value) => (
                <option key={value} value={value} className="bg-slate-950">
                  Season {value}
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
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Visible episodes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCount(filteredEpisodes.length)}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Script locked</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(filteredEpisodes.filter((episode) => episode.script_locked).length)}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Locked canon</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(filteredEpisodes.filter((episode) => episode.status === "locked").length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredEpisodes.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredEpisodes.map((episode) => (
            <EntityCard
              key={episode.id}
              href={`/episodes/${episode.id}`}
              title={episode.name}
              subtitle={episode.logline ?? `Episode ${episode.number}`}
              status={episode.status}
              accent="amber"
              meta={[
                episode.canon_id,
                `Season ${episode.season}`,
                episode.chapter_id ? chapterById.get(episode.chapter_id) : undefined,
              ]}
              tags={episode.tags}
              footer={
                <p className="text-sm leading-6 text-slate-300/80">
                  {episode.synopsis ?? "Open the episode to inspect beats, scene stack, and continuity anchors."}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clapperboard}
          title="No episodes match the active filters"
          description="Adjust the filters or create episode architecture in the active universe."
        />
      )}
    </div>
  );
}
