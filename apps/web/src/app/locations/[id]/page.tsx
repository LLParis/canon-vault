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

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const locationId = Number(params.id);

  const { data: location, isLoading, error } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => api.locations.get(locationId),
    enabled: Number.isFinite(locationId),
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!location) {
        throw new Error("Location not loaded");
      }

      if (location.status === "locked") {
        return api.locations.unlock(location.id);
      }

      return api.locations.update(location.id, { status: "locked" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["location", locationId] }),
        queryClient.invalidateQueries({ queryKey: ["locations"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  if (!Number.isFinite(locationId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid location route"
        description="The requested location ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Location unavailable"
        description="The requested location could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !location) {
    return <LoadingState label="Loading location dossier..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Location dossier"
        title={location.name}
        description="Atmosphere, region, and worldbuilding anchors for this location."
        actions={
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to locations
          </Link>
        }
      />

      <EntityHero
        title={location.name}
        subtitle={location.atmosphere ?? location.visual_style}
        summary={location.description ?? location.prompt_description}
        status={location.status}
        canonId={location.canon_id}
        chips={[location.location_type, location.region]}
        tags={location.tags}
        lockable
        lockPending={lockMutation.isPending}
        onToggleLock={() => lockMutation.mutate()}
      />

      <JsonSection
        title="Atmosphere"
        description="How the location should feel, read, and render."
        data={{
          description: location.description,
          atmosphere: location.atmosphere,
          visual_style: location.visual_style,
          prompt_description: location.prompt_description,
          parent_location_id: location.parent_location_id,
          notes: location.notes,
        }}
      />

      <JsonSection
        title="World details"
        description="Notable features and associated canon anchors."
        data={{
          notable_features: location.notable_features,
          associated_characters: location.associated_characters,
          assets: location.assets,
        }}
      />
    </div>
  );
}
