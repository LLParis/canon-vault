"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatabaseZap, FileUp, FolderTree, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { api, ApiError } from "@/lib/api/client";
import { useCanonStore } from "@/lib/store/canon-store";

const DEFAULT_SOURCE_ROOT = "D:\\07_ANIME\\01_PROJECTS\\HHK_Universe";

export default function IngestPage() {
  const queryClient = useQueryClient();
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceRoot, setSourceRoot] = useState(DEFAULT_SOURCE_ROOT);

  const invalidateCanon = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["characters"] }),
      queryClient.invalidateQueries({ queryKey: ["relationships"] }),
      queryClient.invalidateQueries({ queryKey: ["episodes"] }),
      queryClient.invalidateQueries({ queryKey: ["chapters"] }),
      queryClient.invalidateQueries({ queryKey: ["locations"] }),
      queryClient.invalidateQueries({ queryKey: ["factions"] }),
      queryClient.invalidateQueries({ queryKey: ["prompt-templates"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };

  const fileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (selectedUniverseId === null) {
        throw new Error("Universe not selected");
      }

      return api.ingest.characterYaml(file, selectedUniverseId);
    },
    onSuccess: invalidateCanon,
  });

  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      if (selectedUniverseId === null) {
        throw new Error("Universe not selected");
      }

      return api.ingest.bootstrapSource(selectedUniverseId, sourceRoot);
    },
    onSuccess: invalidateCanon,
  });

  if (selectedUniverseId === null) {
    return (
      <EmptyState
        icon={UploadCloud}
        title="Select a universe before ingest"
        description="Ingest writes directly into the active universe scope. Pick the target universe from the left rail first."
      />
    );
  }

  const fileErrorMessage =
    fileMutation.error instanceof ApiError
      ? JSON.stringify(fileMutation.error.detail)
      : fileMutation.error instanceof Error
        ? fileMutation.error.message
        : null;

  const bootstrapErrorMessage =
    bootstrapMutation.error instanceof ApiError
      ? JSON.stringify(bootstrapMutation.error.detail)
      : bootstrapMutation.error instanceof Error
        ? bootstrapMutation.error.message
        : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Steering wheel"
        title="Ingest"
        description="Use the source-folder bootstrap for real operation. File upload remains available for one-off structured YAML imports."
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionPanel tone="hero" className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-medium text-sky-300">Primary workflow</p>
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-white">
              Bootstrap from source canon folder.
            </h2>
             <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
               The system scans the canon root, imports every valid YAML file, bootstraps chapters and episode packs from the Season folders, then enriches character dossiers from the text bundles so the app is not empty by default.
             </p>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Source root</span>
            <input
              value={sourceRoot}
              onChange={(event) => setSourceRoot(event.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder={DEFAULT_SOURCE_ROOT}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={bootstrapMutation.isPending}
              onClick={() => bootstrapMutation.mutate()}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-sm font-medium text-sky-200 disabled:cursor-wait disabled:opacity-70"
            >
              <FolderTree className="h-4 w-4" />
              {bootstrapMutation.isPending ? "Scanning source..." : "Scan and import source canon"}
            </button>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100">
              <DatabaseZap className="h-4 w-4 text-sky-200" />
              Universe #{selectedUniverseId}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Step 1</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Valid YAML files are imported idempotently.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Step 2</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Season folders become chapters and episodes with source paths, meta text, and lock state.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Step 3</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Character text bundles fill the dossier layer and the UI invalidates instantly.</p>
              </div>
            </div>
          </div>
        </SectionPanel>

        <div className="space-y-4">
          <SectionPanel className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Bootstrap result</p>
              <h3 className="text-lg font-medium text-white">Last source scan</h3>
            </div>
            {bootstrapMutation.data ? (
              <div className="space-y-4 text-sm text-slate-100">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p><span className="text-slate-500">Source root:</span> {bootstrapMutation.data.source_root}</p>
                  <p><span className="text-slate-500">YAML processed:</span> {bootstrapMutation.data.yaml_processed}</p>
                  <p><span className="text-slate-500">YAML imported:</span> {bootstrapMutation.data.yaml_imported}</p>
                  <p><span className="text-slate-500">YAML skipped:</span> {bootstrapMutation.data.yaml_skipped}</p>
                  <p><span className="text-slate-500">Season roots processed:</span> {bootstrapMutation.data.season_roots_processed}</p>
                  <p><span className="text-slate-500">Chapter folders processed:</span> {bootstrapMutation.data.chapter_roots_processed}</p>
                  <p><span className="text-slate-500">Chapters imported:</span> {bootstrapMutation.data.chapters_imported}</p>
                  <p><span className="text-slate-500">Chapters skipped:</span> {bootstrapMutation.data.chapters_skipped}</p>
                  <p><span className="text-slate-500">Episode packs processed:</span> {bootstrapMutation.data.episode_packs_processed}</p>
                  <p><span className="text-slate-500">Episodes imported:</span> {bootstrapMutation.data.episodes_imported}</p>
                  <p><span className="text-slate-500">Episodes skipped:</span> {bootstrapMutation.data.episodes_skipped}</p>
                  <p><span className="text-slate-500">Text bundles processed:</span> {bootstrapMutation.data.text_bundles_processed}</p>
                  <p><span className="text-slate-500">Text imported:</span> {bootstrapMutation.data.text_imported}</p>
                  <p><span className="text-slate-500">Text skipped:</span> {bootstrapMutation.data.text_skipped}</p>
                </div>
                {bootstrapMutation.data.errors.length ? (
                  <div className="rounded-xl border border-amber-300/18 bg-amber-300/[0.08] p-4 text-amber-50">
                    <p className="mb-2 font-medium">Skipped or failed paths</p>
                    <div className="space-y-2">
                      {bootstrapMutation.data.errors.slice(0, 8).map((error) => (
                        <p key={error} className="break-words text-sm leading-relaxed">{error}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-300">
                No source scan has run in this session yet.
              </p>
            )}
            {bootstrapErrorMessage ? (
              <div className="rounded-xl border border-rose-300/18 bg-rose-300/[0.08] p-4 text-sm text-rose-50">
                {bootstrapErrorMessage}
              </div>
            ) : null}
          </SectionPanel>

          <SectionPanel className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Fallback</p>
              <h3 className="text-lg font-medium text-white">Single YAML upload</h3>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 text-center transition ${
                dragActive
                  ? "border-sky-400/50 bg-sky-400/[0.08]"
                  : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.04] hover:text-white"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                const file = event.dataTransfer.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            >
              <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.06] p-4 text-sky-200">
                <FileUp className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-white">
                  {selectedFile ? selectedFile.name : "Drag a .yaml file here or click to browse"}
                </p>
                <p className="text-sm text-slate-300">
                  This is the backup path, not the main operator flow.
                </p>
              </div>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".yaml,.yml"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!selectedFile || fileMutation.isPending}
                onClick={() => {
                  if (selectedFile) {
                    fileMutation.mutate(selectedFile);
                  }
                }}
                className="rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-sm font-medium text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fileMutation.isPending ? "Ingesting..." : "Run single-file ingest"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  fileMutation.reset();
                }}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-100"
              >
                Clear selection
              </button>
            </div>

            {fileMutation.data ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-100">
                <p><span className="text-slate-500">Action:</span> {fileMutation.data.action}</p>
                <p><span className="text-slate-500">Canon ID:</span> {fileMutation.data.canon_id}</p>
                <p><span className="text-slate-500">Character ID:</span> {fileMutation.data.character_id}</p>
                <p><span className="text-slate-500">Relationships created:</span> {fileMutation.data.relationships_created}</p>
                {fileMutation.data.reason ? (
                  <p><span className="text-slate-500">Reason:</span> {fileMutation.data.reason}</p>
                ) : null}
              </div>
            ) : null}
            {fileErrorMessage ? (
              <div className="rounded-xl border border-rose-300/18 bg-rose-300/[0.08] p-4 text-sm text-rose-50">
                {fileErrorMessage}
              </div>
            ) : null}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}
