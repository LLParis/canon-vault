import { GitCommitHorizontal, History } from "lucide-react";

import { SectionPanel } from "@/components/section-panel";
import type { ChangeLogEntry } from "@/lib/api/types";
import {
  cn,
  dateSortValue,
  formatDateTime,
  formatJsonValue,
  humanizeKey,
  isLikelyDateTimeString,
} from "@/lib/utils";

function valueTone(value: unknown) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isDateField(fieldChanged: string) {
  return /(?:^|[_./])(created_at|updated_at|locked_at|changed_at)$/.test(fieldChanged);
}

function renderChangeValue(fieldChanged: string, value: unknown) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  if ((isDateField(fieldChanged) || isLikelyDateTimeString(value)) && typeof value === "string") {
    return formatDateTime(value);
  }

  return formatJsonValue(value);
}

function groupEntries(entries: ChangeLogEntry[]) {
  const groups = new Map<string, ChangeLogEntry[]>();

  for (const entry of [...entries].sort((left, right) => dateSortValue(right.changed_at) - dateSortValue(left.changed_at))) {
    const groupKey = entry.change_set_id ?? `solo-${entry.id}`;
    const bucket = groups.get(groupKey) ?? [];
    bucket.push(entry);
    groups.set(groupKey, bucket);
  }

  return [...groups.entries()].map(([id, bucket]) => ({
    id,
    entries: bucket,
    changedAt: bucket[0]?.changed_at ?? "",
  }));
}

export function ChangelogTimeline({ entries }: { entries: ChangeLogEntry[] }) {
  const groups = groupEntries(entries);

  if (!groups.length) {
    return (
      <SectionPanel className="flex items-center gap-4">
        <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-2.5 text-sky-300">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">No change events yet</h3>
          <p className="text-sm text-slate-400">Canon diffs will appear here the first time a record moves.</p>
        </div>
      </SectionPanel>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <SectionPanel key={group.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-sky-300">
                <GitCommitHorizontal className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Change set {group.id.startsWith("solo-") ? "solo" : group.id.slice(0, 8)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(group.changedAt)}
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {group.entries[0]?.change_source ?? "api"}
            </p>
          </div>

          <div className="space-y-3">
            {group.entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{humanizeKey(entry.field_changed)}</p>
                  <p className="text-xs text-slate-500">
                    v{entry.entity_version_before} to v{entry.entity_version_after}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-rose-400/8 bg-rose-400/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-rose-300/60">Before</p>
                    <pre
                      className={cn(
                        "overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300",
                        valueTone(entry.old_value) ? "font-sans" : "font-mono text-xs",
                      )}
                    >
                      {renderChangeValue(entry.field_changed, entry.old_value)}
                    </pre>
                  </div>
                  <div className="rounded-lg border border-sky-400/8 bg-sky-400/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-sky-300/60">After</p>
                    <pre
                      className={cn(
                        "overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100",
                        valueTone(entry.new_value) ? "font-sans" : "font-mono text-xs",
                      )}
                    >
                      {renderChangeValue(entry.field_changed, entry.new_value)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
      ))}
    </div>
  );
}
