import type { LucideIcon } from "lucide-react";

import { SectionPanel } from "@/components/section-panel";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <SectionPanel className="flex flex-col items-start gap-4 p-8">
      <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-2.5 text-sky-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-medium text-white">{title}</h3>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </SectionPanel>
  );
}
