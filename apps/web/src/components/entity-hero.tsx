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
          <div className="flex flex-wrap items-center gap-3">
            {status ? <StatusBadge status={status} /> : null}
            {canonId ? (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300/82">
                {canonId}
              </span>
            ) : null}
            {chips?.filter(Boolean).map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100/92"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white">{title}</h1>
            {subtitle ? <p className="text-base text-slate-200/82">{subtitle}</p> : null}
          </div>

          {summary ? (
            <p className="max-w-3xl text-sm leading-7 text-slate-200/84">{summary}</p>
          ) : null}
        </div>

        <div className="flex min-w-[260px] flex-col gap-3">
          {lockable && onToggleLock ? (
            <button
              type="button"
              onClick={onToggleLock}
              disabled={lockPending}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                isLocked
                  ? "border-rose-300/20 bg-rose-300/12 text-rose-100 hover:bg-rose-300/18"
                  : "border-cyan-300/20 bg-cyan-300/12 text-cyan-50 hover:bg-cyan-300/18",
                lockPending && "cursor-wait opacity-70",
              )}
            >
              {lockPending ? "Syncing canon..." : isLocked ? "Unlock Canon" : "Lock Canon"}
            </button>
          ) : null}

          {actions}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300/84">
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
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-100/90"
            >
              {String(tag)}
            </span>
          ))}
        </div>
      ) : null}
    </SectionPanel>
  );
}
