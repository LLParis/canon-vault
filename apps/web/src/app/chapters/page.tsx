"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

export default function ChaptersPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ["chapters", selectedUniverseId],
    queryFn: () => api.chapters.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={BookOpenText}
        title="Select a universe first"
        description="Chapter architecture only resolves inside an active universe."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading chapter architecture..." />;
  }

  const seasons = [...new Set(chapters.map((chapter) => chapter.season))].sort((a, b) => a - b);
  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${chapter.name} ${chapter.canon_id} ${chapter.premise ?? ""} ${chapter.central_conflict ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesSeason = season === "all" || chapter.season === Number(season);
    const matchesStatus = status === "all" || chapter.status === status;

    return matchesSearch && matchesSeason && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Narrative clusters"
        title="Chapters"
        description="Season-level structure, central conflicts, thematic load, and episode grouping."
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
                placeholder="Name, canon ID, premise..."
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
              <option value="all" className="bg-slate-950">All seasons</option>
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
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Visible chapters</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCount(filteredChapters.length)}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Locked canon</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(filteredChapters.filter((item) => item.status === "locked").length)}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">Themes loaded</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatCount(filteredChapters.filter((item) => (item.themes?.length ?? 0) > 0).length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredChapters.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredChapters.map((chapter) => (
            <EntityCard
              key={chapter.id}
              href={`/chapters/${chapter.id}`}
              title={chapter.name}
              subtitle={chapter.premise ?? `Chapter ${chapter.chapter_number}`}
              status={chapter.status}
              accent="lime"
              meta={[chapter.canon_id, `Season ${chapter.season}`, chapter.episode_range]}
              tags={chapter.tags}
              footer={
                <p className="text-sm leading-6 text-slate-300/80">
                  {chapter.central_conflict ?? "Open the chapter to inspect themes, conflict, and resolution."}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpenText}
          title="No chapters match the active filters"
          description="Adjust the filters or add new chapter structure to the active universe."
        />
      )}
    </div>
  );
}
