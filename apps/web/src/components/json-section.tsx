import type { ReactNode } from "react";

import { SectionPanel } from "@/components/section-panel";
import { cn, formatJsonValue, humanizeKey } from "@/lib/utils";

function renderValue(value: unknown, depth = 0): ReactNode {
  if (value === null || value === undefined) {
    return <p className="text-sm text-slate-500">Not set.</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-slate-500">No entries.</p>;
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
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-sm text-slate-200"
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
            className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
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
      return <p className="text-sm text-slate-500">No structured data.</p>;
    }

    return (
      <div className={cn("grid gap-3", depth === 0 && "md:grid-cols-2")}>
        {entries.map(([key, item]) => (
          <div key={key} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="mb-3 text-xs font-medium text-slate-500">
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
          "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
          value
            ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200"
            : "border-white/[0.06] bg-white/[0.03] text-slate-400",
        )}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{String(value)}</p>;
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
        <h3 className="text-base font-medium text-white">{title}</h3>
        {description ? <p className="text-sm leading-relaxed text-slate-400">{description}</p> : null}
      </div>
      {renderValue(data)}
    </SectionPanel>
  );
}
