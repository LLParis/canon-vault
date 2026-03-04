"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, WandSparkles } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";
import { formatCount } from "@/lib/utils";

export default function PromptTemplatesPage() {
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const [search, setSearch] = useState("");
  const [engine, setEngine] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["prompt-templates", selectedUniverseId],
    queryFn: () => api.promptTemplates.list({ universe_id: selectedUniverseId }),
    enabled: selectedUniverseId !== null,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={WandSparkles}
        title="Select a universe first"
        description="Prompt templates are universe-scoped production assets."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading prompt forge..." />;
  }

  const engines = [...new Set(templates.map((template) => template.engine))];
  const entityTypes = [...new Set(templates.map((template) => template.entity_type).filter(Boolean))];
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${template.name} ${template.canon_id} ${template.template} ${template.notes ?? ""}`
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
    const matchesEngine = engine === "all" || template.engine === engine;
    const matchesEntityType = entityType === "all" || template.entity_type === entityType;

    return matchesSearch && matchesEngine && matchesEntityType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Prompt forge"
        title="Prompt templates"
        description="Production prompts, render parameters, LoRA stacks, and unresolved-variable checks."
      />

      <SectionPanel className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-sky-200" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, canon ID, template text..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Engine</span>
            <select
              value={engine}
              onChange={(event) => setEngine(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All engines</option>
              {engines.map((value) => (
                <option key={value} value={value} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Entity type</span>
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all" className="bg-slate-950">All entity types</option>
              {entityTypes.map((value) => (
                <option key={value} value={value ?? ""} className="bg-slate-950">
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Visible templates</p>
            <p className="mt-3 text-2xl font-medium text-white">{formatCount(filteredTemplates.length)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">Engines loaded</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(new Set(filteredTemplates.map((item) => item.engine)).size)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-slate-500">With LoRAs</p>
            <p className="mt-3 text-2xl font-medium text-white">
              {formatCount(filteredTemplates.filter((item) => (item.loras?.length ?? 0) > 0).length)}
            </p>
          </div>
        </div>
      </SectionPanel>

      {filteredTemplates.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <EntityCard
              key={template.id}
              href={`/prompt-templates/${template.id}`}
              title={template.name}
              subtitle={template.entity_type ?? "Universal template"}
              status={template.status}
              accent="amber"
              meta={[template.canon_id, template.engine, template.entity_type]}
              tags={template.tags}
              footer={
                <p className="text-sm leading-relaxed text-slate-300">
                  {template.template}
                </p>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={WandSparkles}
          title="No prompt templates match the active filters"
          description="Broaden the filters or create a new production template."
        />
      )}
    </div>
  );
}
