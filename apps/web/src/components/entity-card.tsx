import type { ReactNode } from "react";

import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import type { CanonStatus, WorkflowStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type EntityCardProps = {
  href?: string;
  title: string;
  subtitle?: string | null;
  status?: CanonStatus | WorkflowStatus | string | null;
  accent?: "cyan" | "rose" | "lime" | "amber";
  meta?: Array<string | null | undefined>;
  tags?: unknown[] | null;
  footer?: ReactNode;
};

const ACCENT_STYLES: Record<NonNullable<EntityCardProps["accent"]>, string> = {
  cyan: "from-cyan-300/40 via-cyan-300/10 to-transparent",
  rose: "from-rose-300/35 via-rose-300/10 to-transparent",
  lime: "from-lime-300/35 via-lime-300/10 to-transparent",
  amber: "from-amber-300/35 via-amber-300/10 to-transparent",
};

function EntityCardBody({
  title,
  subtitle,
  status,
  accent = "cyan",
  meta,
  tags,
  footer,
}: Omit<EntityCardProps, "href">) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,36,0.98),rgba(8,13,24,0.92))] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:shadow-[0_20px_50px_rgba(9,15,26,0.45)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-90",
          ACCENT_STYLES[accent],
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
            {subtitle ? <p className="text-sm text-slate-300/78">{subtitle}</p> : null}
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>

        {meta?.length ? (
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400/90">
            {meta.filter(Boolean).map((item) => (
              <span key={item} className="rounded-full border border-white/8 px-2 py-1">
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={`${String(tag)}-${index}`}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-200/88"
              >
                {String(tag)}
              </span>
            ))}
          </div>
        ) : null}

        {footer ? <div className="border-t border-white/8 pt-4 text-sm text-slate-200/85">{footer}</div> : null}
      </div>
    </div>
  );
}

export function EntityCard(props: EntityCardProps) {
  if (props.href) {
    return (
      <Link href={props.href} className="block">
        <EntityCardBody {...props} />
      </Link>
    );
  }

  return <EntityCardBody {...props} />;
}
