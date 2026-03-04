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
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/74">Primary text</p>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">Loading script...</h3>
        </div>
        <div className="h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel tone="hero" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/74">Primary text</p>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">Full script</h3>
          <p className="max-w-3xl text-sm leading-6 text-slate-200/82">
            This is the canonical reading surface for the episode when a script file exists.
          </p>
        </div>
        <div className="space-y-1 text-right text-xs text-slate-300/72">
          <p>{script?.source_type ? `Source: ${script.source_type.toUpperCase()}` : "Source unavailable"}</p>
          <p>{script?.line_count ? `${script.line_count} lines extracted` : "No extracted lines"}</p>
        </div>
      </div>

      {script?.path ? (
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-slate-300/72">
          {script.path}
        </div>
      ) : null}

      {script?.is_available && script.content ? (
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#050913]/94 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="max-h-[72vh] overflow-auto">
            <div className="grid min-w-full grid-cols-[88px_minmax(0,1fr)]">
              {script.content.split("\n").map((line, index) => (
                <div key={`${index}-${line.slice(0, 12)}`} className="contents">
                  <div className="border-r border-white/6 px-4 py-1.5 text-right font-mono text-[11px] leading-7 text-slate-500/80">
                    {index + 1}
                  </div>
                  <pre className="overflow-x-auto px-5 py-1.5 font-mono text-[13px] leading-7 text-slate-100 whitespace-pre-wrap">
                    {line || " "}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center text-sm leading-7 text-slate-300/78">
          {script?.message ?? "No script body has been extracted for this episode yet."}
        </div>
      )}
    </SectionPanel>
  );
}
