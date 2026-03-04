import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading canon systems..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] text-center">
      <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-2.5 text-sky-300">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
