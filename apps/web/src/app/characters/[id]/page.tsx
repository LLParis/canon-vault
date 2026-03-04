"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CharacterDossier } from "@/components/character-dossier";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/client";
import type { ResolvedRelationship } from "@/lib/api/types";

export default function CharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const characterId = Number(params.id);

  const { data: character, isLoading, error } = useQuery({
    queryKey: ["character", characterId],
    queryFn: () => api.characters.get(characterId),
    enabled: Number.isFinite(characterId),
  });

  const { data: relationships = [] } = useQuery({
    queryKey: ["character-relationships", characterId],
    queryFn: () => api.characters.listRelationships(characterId),
    enabled: !!character,
  });

  const { data: changelog = [] } = useQuery({
    queryKey: ["character-changelog", characterId],
    queryFn: () => api.characters.getChangelog(characterId),
    enabled: !!character,
  });

  const { data: universeCharacters = [] } = useQuery({
    queryKey: ["characters", character?.universe_id, "for-detail"],
    queryFn: () => api.characters.list({ universe_id: character?.universe_id }),
    enabled: !!character?.universe_id,
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!character) {
        throw new Error("Character not loaded");
      }

      if (character.status === "locked") {
        return api.characters.unlock(character.id);
      }

      return api.characters.update(character.id, { status: "locked" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["character", characterId] }),
        queryClient.invalidateQueries({ queryKey: ["characters"] }),
        queryClient.invalidateQueries({ queryKey: ["character-relationships", characterId] }),
        queryClient.invalidateQueries({ queryKey: ["character-changelog", characterId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  if (!Number.isFinite(characterId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid character route"
        description="The requested character ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Character dossier unavailable"
        description="The requested character could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !character) {
    return <LoadingState label="Loading full character dossier..." />;
  }

  const byId = new Map(universeCharacters.map((item) => [item.id, item.name]));
  const resolvedRelationships: ResolvedRelationship[] = relationships.map((relationship) => ({
    ...relationship,
    source_name: byId.get(relationship.source_character_id) ?? `Character #${relationship.source_character_id}`,
    target_name: byId.get(relationship.target_character_id) ?? `Character #${relationship.target_character_id}`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dossier"
        title={character.name}
        description="Read the structured canon, inspect relationship context, and audit every recorded mutation from one page."
        actions={
          <Link
            href="/characters"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cast registry
          </Link>
        }
      />

      <CharacterDossier
        character={character}
        relationships={resolvedRelationships}
        changelog={changelog}
        onToggleLock={() => lockMutation.mutate()}
        lockPending={lockMutation.isPending}
      />
    </div>
  );
}
