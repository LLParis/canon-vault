import type { ReactNode } from "react";

import { SectionPanel } from "@/components/section-panel";
import { cn, formatJsonValue, humanizeKey } from "@/lib/utils";

function renderValue(value: unknown, depth = 0): ReactNode {
  if (value === null || value === undefined) {
    return <p className="text-sm text-slate-400/80">Not set.</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-slate-400/80">No entries.</p>;
    }

    const primitivesOnly = value.every(
      (item) => item === null || item === undefined || ["string", "number", "boolean"].includes(typeof item),
    );

    if (primitivesOnly) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={`${String(item)}-${index}`}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-slate-100"
            >
              {formatJsonValue(item)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
          >
            {renderValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined);

    if (entries.length === 0) {
      return <p className="text-sm text-slate-400/80">No structured data.</p>;
    }

    return (
      <div className={cn("grid gap-3", depth === 0 && "md:grid-cols-2")}>
        {entries.map(([key, item]) => (
          <div key={key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-slate-400/80">
              {humanizeKey(key)}
            </p>
            {renderValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={cn(
          "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em]",
          value
            ? "border-lime-300/20 bg-lime-300/12 text-lime-100"
            : "border-white/10 bg-white/[0.06] text-slate-300",
        )}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100/92">{String(value)}</p>;
}

export function JsonSection({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: unknown;
}) {
  return (
    <SectionPanel className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
        {description ? <p className="text-sm leading-6 text-slate-300/80">{description}</p> : null}
      </div>
      {renderValue(data)}
    </SectionPanel>
  );
}
