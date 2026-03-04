import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SectionPanelProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "hero" | "subtle";
};

export function SectionPanel({
  className,
  tone = "default",
  ...props
}: SectionPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-sm",
        tone === "hero" && "border-sky-400/10 bg-sky-400/[0.03]",
        tone === "subtle" && "border-white/[0.04] bg-white/[0.02]",
        className,
      )}
      {...props}
    />
  );
}
