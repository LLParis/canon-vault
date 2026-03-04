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
        <h3 className="text-lg font-semibold text-white">Relationship lattice</h3>
        <p className="text-sm leading-6 text-slate-300/80">{description}</p>
      </div>
      {relationships.length ? (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <div
              key={relationship.id}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-white">
                  {relationship.source_name} to {relationship.target_name}
                </p>
                <StatusBadge status={relationship.status} />
                <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300/82">
                  {relationship.relationship_type}
                </span>
              </div>
              {relationship.dynamic ? (
                <p className="mt-3 text-sm leading-6 text-slate-300/84">{relationship.dynamic}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-300/80">No relationship edges resolved for this character yet.</p>
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
      <SectionPanel tone="hero" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={character.status} />
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300/80">
                {character.canon_id}
              </span>
              {character.faction ? (
                <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100/90">
                  {character.faction}
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white">
                {character.name}
              </h1>
              <p className="text-base text-slate-200/80">
                {character.codename ? `${character.codename} • ` : null}
                {character.cast_tier ? `${character.cast_tier} • ` : null}
                v{character.version}
              </p>
            </div>
            {character.prompt_description ? (
              <p className="max-w-3xl text-sm leading-7 text-slate-200/84">
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
                "rounded-2xl px-4 py-3 text-sm font-medium transition",
                isLocked
                  ? "border border-rose-300/20 bg-rose-300/12 text-rose-100 hover:bg-rose-300/18"
                  : "border border-cyan-300/20 bg-cyan-300/12 text-cyan-50 hover:bg-cyan-300/18",
                lockPending && "cursor-wait opacity-70",
              )}
            >
              {lockPending ? "Syncing canon..." : isLocked ? "Unlock Canon" : "Lock Canon"}
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300/84">
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
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-100/90"
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
              "rounded-full border px-4 py-2 text-sm transition",
              activeTab === tab.id
                ? "border-cyan-300/30 bg-cyan-300/14 text-cyan-100"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/16 hover:text-white",
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
