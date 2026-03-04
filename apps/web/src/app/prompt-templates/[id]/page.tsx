"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityHero } from "@/components/entity-hero";
import { JsonSection } from "@/components/json-section";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api, ApiError } from "@/lib/api/client";

export default function PromptTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const templateId = Number(params.id);
  const [characterId, setCharacterId] = useState("none");
  const [locationId, setLocationId] = useState("none");

  const { data: template, isLoading, error } = useQuery({
    queryKey: ["prompt-template", templateId],
    queryFn: () => api.promptTemplates.get(templateId),
    enabled: Number.isFinite(templateId),
  });
  const { data: characters = [] } = useQuery({
    queryKey: ["prompt-template-characters", template?.universe_id],
    queryFn: () => api.characters.list({ universe_id: template?.universe_id }),
    enabled: !!template?.universe_id,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["prompt-template-locations", template?.universe_id],
    queryFn: () => api.locations.list({ universe_id: template?.universe_id }),
    enabled: !!template?.universe_id,
  });

  const renderMutation = useMutation({
    mutationFn: () =>
      api.promptTemplates.render(templateId, {
        character_id: characterId === "none" ? null : Number(characterId),
        location_id: locationId === "none" ? null : Number(locationId),
      }),
  });

  const renderError = useMemo(() => {
    if (renderMutation.error instanceof ApiError) {
      return JSON.stringify(renderMutation.error.detail);
    }

    if (renderMutation.error instanceof Error) {
      return renderMutation.error.message;
    }

    return null;
  }, [renderMutation.error]);

  if (!Number.isFinite(templateId)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Invalid prompt template route"
        description="The requested template ID is not a valid number."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Prompt template unavailable"
        description="The requested prompt template could not be loaded from the local API."
      />
    );
  }

  if (isLoading || !template) {
    return <LoadingState label="Loading prompt template..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Prompt forge"
        title={template.name}
        description="Inspect source template text and render it against live canon entities."
        actions={
          <Link
            href="/prompt-templates"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to prompt forge
          </Link>
        }
      />

      <EntityHero
        title={template.name}
        subtitle={template.entity_type ?? "Universal template"}
        summary={template.notes ?? "Production prompt template with runtime variable substitution."}
        status={template.status}
        canonId={template.canon_id}
        chips={[template.engine, template.entity_type]}
        tags={template.tags}
        createdAt={template.created_at}
        updatedAt={template.updated_at}
      />

      <SectionPanel className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Render preview</p>
          <h3 className="text-lg font-medium text-white">Bind live canon variables</h3>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Character</span>
            <select
              value={characterId}
              onChange={(event) => setCharacterId(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="none" className="bg-slate-950">No character</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id} className="bg-slate-950">
                  {character.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Location</span>
            <select
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="none" className="bg-slate-950">No location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id} className="bg-slate-950">
                  {location.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => renderMutation.mutate()}
              disabled={renderMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-4 py-3 text-sm font-medium text-sky-200 disabled:cursor-wait disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" />
              {renderMutation.isPending ? "Rendering..." : "Render preview"}
            </button>
          </div>
        </div>

        {renderError ? (
          <div className="rounded-xl border border-rose-300/18 bg-rose-300/[0.08] p-4 text-sm text-rose-50">
            {renderError}
          </div>
        ) : null}
      </SectionPanel>

      <JsonSection
        title="Template source"
        description="The raw prompt source and negative prompt payload."
        data={{
          template: template.template,
          neg_prompt: template.neg_prompt,
          parameters: template.parameters,
          loras: template.loras,
          notes: template.notes,
        }}
      />

      {renderMutation.data ? (
        <>
          <SectionPanel className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Rendered prompt</p>
              <h3 className="text-lg font-medium text-white">Output preview</h3>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 font-mono text-sm leading-relaxed text-slate-100">
              {renderMutation.data.rendered_prompt}
            </pre>
          </SectionPanel>

          <JsonSection
            title="Render payload"
            description="Negative prompt, parameters, LoRAs, and unresolved variables."
            data={{
              neg_prompt: renderMutation.data.neg_prompt,
              parameters: renderMutation.data.parameters,
              loras: renderMutation.data.loras,
              unresolved_variables: renderMutation.data.unresolved_variables,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
