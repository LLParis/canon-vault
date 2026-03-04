"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, BookOpenText, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

const COUNT_CARDS = [
  { key: "characters", label: "Characters", href: "/characters" },
  { key: "relationships", label: "Relationships", href: "/relationships" },
  { key: "episodes", label: "Episodes", href: "/episodes" },
  { key: "chapters", label: "Chapters", href: "/chapters" },
  { key: "locations", label: "Locations", href: "/locations" },
  { key: "factions", label: "Factions", href: "/factions" },
  { key: "promptTemplates", label: "Prompt templates", href: "/prompt-templates" },
] as const;

export default function DashboardPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", selectedUniverseId],
    queryFn: () => api.dashboard.getSnapshot(selectedUniverseId as number),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={Activity}
        title="No universe selected"
        description="Select a universe from the sidebar to bring the Canon OS online."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Activity}
        title="Dashboard unavailable"
        description="The API is reachable, but the dashboard snapshot failed to load. Check the local API and try again."
      />
    );
  }

  if (isLoading || !data) {
    return <LoadingState label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Canon Operating System"
        title={data.universe ? `${data.universe.name} control surface` : "Canon control surface"}
        description="One look should tell you if the universe is healthy, drifting, or ready for production."
        actions={
          <>
            <Link
              href="/characters"
              className="rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-sm font-medium text-sky-200"
            >
              Open cast registry
            </Link>
            <Link
              href="/ingest"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-300"
            >
              <UploadCloud className="h-4 w-4" />
              Ingest YAML
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <SectionPanel tone="hero" className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-medium text-sky-300/50">North star</p>
              <h2 className="text-2xl font-medium tracking-[-0.02em] text-white">
                Fast, low-friction, anti-drift canon operations.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                Characters remain the nucleus. Lock state, changelog visibility, and ingest readiness stay in the foreground at all times.
              </p>
            </div>
            <div className="rounded-xl border border-sky-400/10 bg-sky-400/[0.04] p-4 text-right">
              <p className="text-xs font-medium text-sky-300/50">Reviewed</p>
              <p className="mt-2 text-3xl font-medium text-white">{formatCount(data.reviewedCharacters)}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-slate-500">Locked records</p>
              <p className="mt-2 text-2xl font-medium text-white">{formatCount(data.lockedCharacters)}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-slate-500">Prompt assets</p>
              <p className="mt-2 text-2xl font-medium text-white">
                {formatCount(data.counts.promptTemplates)}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-slate-500">Narrative chain</p>
              <p className="mt-2 text-2xl font-medium text-white">
                {formatCount(data.counts.chapters + data.counts.episodes)}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-slate-500">World surface</p>
              <p className="mt-2 text-2xl font-medium text-white">
                {formatCount(data.counts.locations + data.counts.factions)}
              </p>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Immediate actions</p>
            <h3 className="text-lg font-medium text-white">Move the universe forward</h3>
          </div>
          <div className="space-y-2">
            <Link
              href="/ingest"
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="inline-flex items-center gap-3">
                <UploadCloud className="h-4 w-4 text-sky-400/60" />
                Ingest a canon YAML file
              </span>
              <span className="text-slate-500">Drop, validate, upsert</span>
            </Link>
            <Link
              href="/prompt-templates"
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="inline-flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-slate-400" />
                Render a production prompt
              </span>
              <span className="text-slate-500">Preview output quickly</span>
            </Link>
            <Link
              href="/chapters"
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="inline-flex items-center gap-3">
                <BookOpenText className="h-4 w-4 text-slate-400" />
                Inspect story architecture
              </span>
              <span className="text-slate-500">Chapters and episodes</span>
            </Link>
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.4fr_1fr]">
        <SectionPanel className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Entity pressure</p>
            <h3 className="text-lg font-medium text-white">Universe footprint</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {COUNT_CARDS.map((card) => (
              <EntityCard
                key={card.key}
                href={card.href}
                title={formatCount(data.counts[card.key])}
                subtitle={card.label}
              />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Character spotlight</p>
            <h3 className="text-lg font-medium text-white">Most recently touched dossiers</h3>
          </div>
          {data.spotlightCharacters.length ? (
            <div className="space-y-3">
              {data.spotlightCharacters.map((character) => (
                <EntityCard
                  key={character.id}
                  href={`/characters/${character.id}`}
                  title={character.name}
                  subtitle={character.codename ?? character.prompt_description ?? "Character dossier"}
                  status={character.status}
                  meta={[character.canon_id, character.faction, character.cast_tier]}
                  tags={character.tags}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No characters yet"
              description="Ingest or create your first character and they will appear here."
            />
          )}
        </SectionPanel>
      </div>
    </div>
  );
}
