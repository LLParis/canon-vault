import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading canon systems..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] text-center">
      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
      <p className="text-sm text-slate-300/80">{label}</p>
    </div>
  );
}
