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
      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-cyan-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-slate-300/80">{description}</p>
      </div>
    </SectionPanel>
  );
}
