"use client";

import type { ReactNode } from "react";

import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import type { CanonStatus, WorkflowStatus } from "@/lib/api/types";
import { cn, formatDateTime } from "@/lib/utils";

type EntityHeroProps = {
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  status?: CanonStatus | WorkflowStatus | string | null;
  canonId?: string | null;
  chips?: Array<string | null | undefined>;
  tags?: unknown[] | null;
  version?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lockedAt?: string | null;
  lockable?: boolean;
  lockPending?: boolean;
  onToggleLock?: () => void;
  actions?: ReactNode;
};

export function EntityHero({
  title,
  subtitle,
  summary,
  status,
  canonId,
  chips,
  tags,
  version,
  createdAt,
  updatedAt,
  lockedAt,
  lockable = false,
  lockPending = false,
  onToggleLock,
  actions,
}: EntityHeroProps) {
  const isLocked = status === "locked";

  return (
    <SectionPanel tone="hero" className="space-y-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {status ? <StatusBadge status={status} /> : null}
            {canonId ? (
              <span className="rounded-md border border-white/[0.06] px-2 py-0.5 text-xs font-medium text-slate-400">
                {canonId}
              </span>
            ) : null}
            {chips?.filter(Boolean).map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-sky-400/10 bg-sky-400/[0.04] px-2 py-0.5 text-xs font-medium text-sky-300"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-[-0.02em] text-white">{title}</h1>
            {subtitle ? <p className="text-base text-slate-400">{subtitle}</p> : null}
          </div>

          {summary ? (
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">{summary}</p>
          ) : null}
        </div>

        <div className="flex min-w-[260px] flex-col gap-3">
          {lockable && onToggleLock ? (
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
          ) : null}

          {actions}

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-slate-400">
            {version !== null && version !== undefined ? <p>Version {version}</p> : null}
            {createdAt ? <p>Created {formatDateTime(createdAt)}</p> : null}
            {updatedAt ? <p>Updated {formatDateTime(updatedAt)}</p> : null}
            {lockedAt !== undefined ? (
              <p>Locked {lockedAt ? formatDateTime(lockedAt) : "Not yet"}</p>
            ) : null}
          </div>
        </div>
      </div>

      {tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
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
  );
}
