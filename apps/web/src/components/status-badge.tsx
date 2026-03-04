import type { CanonStatus, WorkflowStatus } from "@/lib/api/types";
import { cn, formatStatusLabel } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "border-white/10 bg-white/[0.06] text-slate-100",
  review: "border-amber-300/20 bg-amber-300/12 text-amber-100",
  locked: "border-rose-300/25 bg-rose-400/12 text-rose-100",
  experiment: "border-cyan-300/25 bg-cyan-300/12 text-cyan-100",
  deprecated: "border-slate-400/20 bg-slate-500/12 text-slate-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: CanonStatus | WorkflowStatus | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em]",
        STATUS_STYLES[status] ?? STATUS_STYLES.draft,
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
