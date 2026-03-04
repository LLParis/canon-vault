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
import { api } from "@/lib/api/client";

export default function ChapterDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const chapterId = Number(params.id);

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => api.chapters.get(chapterId),
    enabled: Number.isFinite(chapterId),
  });
  const { data: changelog = [] } = useQuery({
    queryKey: ["chapter-changelog", chapterId],
    queryFn: () => api.chapters.getChangelog(chapterId),
    enabled: !!chapter,
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!chapter) {
        throw new Error("Chapter not loaded");
      }

      if (chapter.status === "locked") {
        return api.chapters.unlock(chapter.id);
      }

      return api.chapters.update(chapter.id, { status: "locked" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chapter", chapterId] }),
        queryClient.invalidateQueries({ queryKey: ["chapters"] }),
        queryClient.invalidateQueries({ queryKey: ["chapter-changelog", chapterId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  if (!Number.isFinite(chapterId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid chapter route"
        description="The requested chapter ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Chapter unavailable"
        description="The requested chapter could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !chapter) {
    return <LoadingState label="Loading chapter dossier..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Chapter dossier"
        title={chapter.name}
        description="Narrative cluster overview, thematic load, and audit trail."
        actions={
          <Link
            href="/chapters"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chapters
          </Link>
        }
      />

      <EntityHero
        title={chapter.name}
        subtitle={`Chapter ${chapter.chapter_number}`}
        summary={chapter.premise}
        status={chapter.status}
        canonId={chapter.canon_id}
        chips={[`Season ${chapter.season}`, chapter.episode_range]}
        tags={chapter.tags}
        lockable
        lockPending={lockMutation.isPending}
        onToggleLock={() => lockMutation.mutate()}
      />

      <JsonSection
        title="Narrative core"
        description="Premise, central conflict, and the intended end-state of the cluster."
        data={{
          premise: chapter.premise,
          central_conflict: chapter.central_conflict,
          resolution: chapter.resolution,
          episode_range: chapter.episode_range,
          notes: chapter.notes,
        }}
      />

      <JsonSection
        title="Themes and motifs"
        description="Meaning load, recurring motifs, and canon signal."
        data={{
          themes: chapter.themes,
          motifs: chapter.motifs,
        }}
      />

      <ChangelogTimeline entries={changelog} />
    </div>
  );
}
