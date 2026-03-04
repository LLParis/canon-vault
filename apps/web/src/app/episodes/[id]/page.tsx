"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ChangelogTimeline } from "@/components/changelog-timeline";
import { EmptyState } from "@/components/empty-state";
import { EntityHero } from "@/components/entity-hero";
import { JsonSection } from "@/components/json-section";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ScriptViewer } from "@/components/script-viewer";
import { api } from "@/lib/api/client";

export default function EpisodeDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const episodeId = Number(params.id);

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ["episode", episodeId],
    queryFn: () => api.episodes.get(episodeId),
    enabled: Number.isFinite(episodeId),
  });
  const { data: changelog = [] } = useQuery({
    queryKey: ["episode-changelog", episodeId],
    queryFn: () => api.episodes.getChangelog(episodeId),
    enabled: !!episode,
  });
  const { data: script, isLoading: scriptLoading } = useQuery({
    queryKey: ["episode-script", episodeId],
    queryFn: () => api.episodes.getScript(episodeId),
    enabled: !!episode,
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["episode-chapters", episode?.universe_id],
    queryFn: () => api.chapters.list({ universe_id: episode?.universe_id }),
    enabled: !!episode?.universe_id,
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!episode) {
        throw new Error("Episode not loaded");
      }

      if (episode.status === "locked") {
        return api.episodes.unlock(episode.id);
      }

      return api.episodes.update(episode.id, { status: "locked" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["episode", episodeId] }),
        queryClient.invalidateQueries({ queryKey: ["episodes"] }),
        queryClient.invalidateQueries({ queryKey: ["episode-changelog", episodeId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  if (!Number.isFinite(episodeId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid episode route"
        description="The requested episode ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Episode unavailable"
        description="The requested episode could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !episode) {
    return <LoadingState label="Loading episode dossier..." />;
  }

  const chapter = chapters.find((item) => item.id === episode.chapter_id) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Episode dossier"
        title={episode.name}
        description="Production-facing episode structure, continuity load, and change history."
        actions={
          <Link
            href="/episodes"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to episodes
          </Link>
        }
      />

      <EntityHero
        title={episode.name}
        subtitle={`Episode ${episode.number}`}
        summary={episode.synopsis ?? episode.logline}
        status={episode.status}
        canonId={episode.canon_id}
        chips={[
          `Season ${episode.season}`,
          chapter?.name,
          episode.script_locked ? "Script locked" : "Script open",
        ]}
        tags={episode.tags}
        lockable
        lockPending={lockMutation.isPending}
        onToggleLock={() => lockMutation.mutate()}
      />

      <ScriptViewer script={script} isLoading={scriptLoading} />

      <JsonSection
        title="Episode overview"
        description="Logline, synopsis, and core source text orbit."
        data={{
          logline: episode.logline,
          synopsis: episode.synopsis,
          chapter: chapter?.name,
          meta_text: episode.meta_text,
          beats_text: episode.beats_text,
          scenelist_text: episode.scenelist_text,
          notes: episode.notes,
        }}
      />

      <JsonSection
        title="Character load"
        description="Who the episode carries, opposes, and accelerates."
        data={{
          featured_characters: episode.featured_characters,
          supporting_characters: episode.supporting_characters,
          antagonists: episode.antagonists,
        }}
      />

      <JsonSection
        title="Scene stack"
        description="Structured scenes and beat flow."
        data={episode.scenes}
      />

      <JsonSection
        title="Narrative threads"
        description="Continuity anchors, progression threads, and hooks."
        data={{
          threads_introduced: episode.threads_introduced,
          threads_advanced: episode.threads_advanced,
          threads_resolved: episode.threads_resolved,
          continuity_anchors: episode.continuity_anchors,
          cliffhanger: episode.cliffhanger,
          cinema_crack_moment: episode.cinema_crack_moment,
          animation_notes: episode.animation_notes,
          music_cues: episode.music_cues,
          script_path: episode.script_path,
        }}
      />

      <ChangelogTimeline entries={changelog} />
    </div>
  );
}
