"use client";

import type { EpisodeScript } from "@/lib/api/types";

import { SectionPanel } from "@/components/section-panel";

type ScriptViewerProps = {
  script: EpisodeScript | undefined;
  isLoading?: boolean;
};

export function ScriptViewer({ script, isLoading = false }: ScriptViewerProps) {
  if (isLoading) {
    return (
      <SectionPanel tone="hero" className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-sky-300/50">Primary text</p>
          <h3 className="text-xl font-medium tracking-[-0.02em] text-white">Loading script...</h3>
        </div>
        <div className="h-[420px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel tone="hero" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-sky-300/50">Primary text</p>
          <h3 className="text-xl font-medium tracking-[-0.02em] text-white">Full script</h3>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            This is the canonical reading surface for the episode when a script file exists.
          </p>
        </div>
        <div className="space-y-1 text-right text-xs text-slate-500">
          <p>{script?.source_type ? `Source: ${script.source_type.toUpperCase()}` : "Source unavailable"}</p>
          <p>{script?.line_count ? `${script.line_count} lines extracted` : "No extracted lines"}</p>
        </div>
      </div>

      {script?.path ? (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 font-mono text-xs leading-relaxed text-slate-500">
          {script.path}
        </div>
      ) : null}

      {script?.is_available && script.content ? (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#080d16]">
          <div className="max-h-[72vh] overflow-auto">
            <div className="grid min-w-full grid-cols-[72px_minmax(0,1fr)]">
              {script.content.split("\n").map((line, index) => (
                <div key={`${index}-${line.slice(0, 12)}`} className="contents">
                  <div className="border-r border-white/[0.05] px-3 py-1.5 text-right font-mono text-[11px] leading-7 text-slate-600">
                    {index + 1}
                  </div>
                  <pre className="overflow-x-auto px-4 py-1.5 font-mono text-[13px] leading-7 text-slate-200 whitespace-pre-wrap">
                    {line || " "}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center text-sm leading-relaxed text-slate-400">
          {script?.message ?? "No script body has been extracted for this episode yet."}
        </div>
      )}
    </SectionPanel>
  );
}
