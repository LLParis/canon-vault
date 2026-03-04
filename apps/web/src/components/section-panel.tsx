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
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,24,42,0.92),rgba(7,13,24,0.88))] p-5 shadow-[0_20px_60px_rgba(1,5,13,0.45)] backdrop-blur-xl",
        tone === "hero" &&
          "border-cyan-300/20 bg-[linear-gradient(135deg,rgba(18,40,67,0.95),rgba(8,15,28,0.88))]",
        tone === "subtle" &&
          "border-white/8 bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(6,11,22,0.78))]",
        className,
      )}
      {...props}
    />
  );
}
