"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { EntityHero } from "@/components/entity-hero";
import { JsonSection } from "@/components/json-section";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/client";

export default function FactionDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const factionId = Number(params.id);

  const { data: faction, isLoading, error } = useQuery({
    queryKey: ["faction", factionId],
    queryFn: () => api.factions.get(factionId),
    enabled: Number.isFinite(factionId),
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!faction) {
        throw new Error("Faction not loaded");
      }

      if (faction.status === "locked") {
        return api.factions.unlock(faction.id);
      }

      return api.factions.update(faction.id, { status: "locked" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["faction", factionId] }),
        queryClient.invalidateQueries({ queryKey: ["factions"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  if (!Number.isFinite(factionId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid faction route"
        description="The requested faction ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Faction unavailable"
        description="The requested faction could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !faction) {
    return <LoadingState label="Loading faction dossier..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faction dossier"
        title={faction.name}
        description="Identity, doctrine, methods, and territory for the power bloc."
        actions={
          <Link
            href="/factions"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to factions
          </Link>
        }
      />

      <EntityHero
        title={faction.name}
        subtitle={faction.motto ?? faction.aesthetic}
        summary={faction.description}
        status={faction.status}
        canonId={faction.canon_id}
        chips={[faction.hierarchy, faction.symbol]}
        tags={faction.tags}
        lockable
        lockPending={lockMutation.isPending}
        onToggleLock={() => lockMutation.mutate()}
      />

      <JsonSection
        title="Faction identity"
        description="How the bloc presents itself and organizes power."
        data={{
          description: faction.description,
          motto: faction.motto,
          symbol: faction.symbol,
          aesthetic: faction.aesthetic,
          hierarchy: faction.hierarchy,
          notes: faction.notes,
        }}
      />

      <JsonSection
        title="Doctrine and territory"
        description="Goals, methods, and the surface they control."
        data={{
          goals: faction.goals,
          methods: faction.methods,
          territory: faction.territory,
        }}
      />
    </div>
  );
}
