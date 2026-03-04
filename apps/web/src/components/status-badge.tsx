import type { CanonStatus, WorkflowStatus } from "@/lib/api/types";
import { cn, formatStatusLabel } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "border-white/[0.08] bg-white/[0.04] text-slate-300",
  review: "border-amber-400/15 bg-amber-400/[0.06] text-amber-200",
  locked: "border-rose-400/15 bg-rose-400/[0.06] text-rose-200",
  experiment: "border-sky-400/15 bg-sky-400/[0.06] text-sky-200",
  deprecated: "border-slate-400/10 bg-slate-400/[0.04] text-slate-400",
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
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize tracking-normal",
        STATUS_STYLES[status] ?? STATUS_STYLES.draft,
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
