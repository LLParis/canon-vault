"use client";

import { useState } from "react";

import { ChangelogTimeline } from "@/components/changelog-timeline";
import { JsonSection } from "@/components/json-section";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import type { ChangeLogEntry, Character, ResolvedRelationship } from "@/lib/api/types";
import { CHARACTER_TABS, type DossierTab } from "@/lib/dossier-schema";
import { cn, formatDateTime } from "@/lib/utils";

type CharacterDossierProps = {
  character: Character;
  relationships: ResolvedRelationship[];
  changelog: ChangeLogEntry[];
  onToggleLock: () => void;
  lockPending: boolean;
};

function resolveTabData(tab: DossierTab, character: Record<string, unknown>): unknown {
  if ("dataKey" in tab) {
    return character[tab.dataKey];
  }
  if ("dataKeys" in tab) {
    const merged: Record<string, unknown> = {};
    for (const key of tab.dataKeys) {
      merged[key] = character[key];
    }
    return merged;
  }
  return null;
}

function RelationshipsPanel({
  relationships,
  description,
}: {
  relationships: ResolvedRelationship[];
  description: string;
}) {
  return (
    <SectionPanel className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-white">Relationship lattice</h3>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
      {relationships.length ? (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <div
              key={relationship.id}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">
                  {relationship.source_name} to {relationship.target_name}
                </p>
                <StatusBadge status={relationship.status} />
                <span className="rounded-md border border-white/[0.06] px-2 py-0.5 text-xs text-slate-500">
                  {relationship.relationship_type}
                </span>
              </div>
              {relationship.dynamic ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{relationship.dynamic}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No relationship edges resolved for this character yet.</p>
      )}
    </SectionPanel>
  );
}

export function CharacterDossier({
  character,
  relationships,
  changelog,
  onToggleLock,
  lockPending,
}: CharacterDossierProps) {
  const [activeTab, setActiveTab] = useState(CHARACTER_TABS[0].id);
  const isLocked = character.status === "locked";
  const activeConfig = CHARACTER_TABS.find((tab) => tab.id === activeTab) ?? CHARACTER_TABS[0];

  return (
    <div className="space-y-6">
      <SectionPanel tone="hero" className="space-y-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={character.status} />
              <span className="rounded-md border border-white/[0.06] px-2 py-0.5 text-xs font-medium text-slate-400">
                {character.canon_id}
              </span>
              {character.faction ? (
                <span className="rounded-md border border-sky-400/10 bg-sky-400/[0.04] px-2 py-0.5 text-xs font-medium text-sky-300">
                  {character.faction}
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-medium tracking-[-0.02em] text-white">
                {character.name}
              </h1>
              <p className="text-base text-slate-400">
                {character.codename ? `${character.codename} · ` : null}
                {character.cast_tier ? `${character.cast_tier} · ` : null}
                v{character.version}
              </p>
            </div>
            {character.prompt_description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                {character.prompt_description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:min-w-[260px]">
            <button
              type="button"
              onClick={onToggleLock}
              disabled={lockPending}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-sm font-medium transition",
                isLocked
                  ? "border-rose-400/15 bg-rose-400/[0.06] text-rose-200 hover:bg-rose-400/10"
                  : "border-sky-400/15 bg-sky-400/[0.06] text-sky-200 hover:bg-sky-400/10",
                lockPending && "cursor-wait opacity-70",
              )}
            >
              {lockPending ? "Syncing canon..." : isLocked ? "Unlock Canon" : "Lock Canon"}
            </button>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-slate-400">
              <p>Created {formatDateTime(character.created_at)}</p>
              <p>Updated {formatDateTime(character.updated_at)}</p>
              <p>
                Locked {character.locked_at ? formatDateTime(character.locked_at) : "Not yet"}
              </p>
            </div>
          </div>
        </div>

        {character.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {character.tags.map((tag, index) => (
              <span
                key={`${String(tag)}-${index}`}
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-slate-300"
              >
                {String(tag)}
              </span>
            ))}
          </div>
        ) : null}
      </SectionPanel>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHARACTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg border px-3.5 py-1.5 text-sm transition",
              activeTab === tab.id
                ? "border-sky-400/15 bg-sky-400/[0.06] text-sky-200"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {"special" in activeConfig && activeConfig.special === "relationships" ? (
        <RelationshipsPanel relationships={relationships} description={activeConfig.description} />
      ) : "special" in activeConfig && activeConfig.special === "changelog" ? (
        <ChangelogTimeline entries={changelog} />
      ) : (
        <JsonSection
          title={activeConfig.label}
          description={activeConfig.description}
          data={resolveTabData(activeConfig, character as unknown as Record<string, unknown>)}
        />
      )}
    </div>
  );
}
