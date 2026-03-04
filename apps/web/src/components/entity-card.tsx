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

function EntityCardBody({
  title,
  subtitle,
  status,
  meta,
  tags,
  footer,
}: Omit<EntityCardProps, "href">) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.05]">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-medium tracking-[-0.01em] text-white">{title}</h3>
            {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>

        {meta?.length ? (
          <div className="flex flex-wrap gap-2">
            {meta.filter(Boolean).map((item) => (
              <span
                key={item}
                className={cn(
                  "rounded-md border border-white/[0.06] px-2 py-0.5 text-xs text-slate-500",
                )}
              >
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
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-slate-300"
              >
                {String(tag)}
              </span>
            ))}
          </div>
        ) : null}

        {footer ? (
          <div className="border-t border-white/[0.05] pt-3 text-sm text-slate-300">{footer}</div>
        ) : null}
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
