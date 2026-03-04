"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Binary,
  CircleDotDashed,
  Command,
  DatabaseZap,
  PanelLeft,
  PanelRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { CommandPalette } from "@/components/command-palette";
import { SectionPanel } from "@/components/section-panel";
import { api } from "@/lib/api/client";
import { NAV_ITEMS, QUICK_ACTIONS, SYSTEM_STRIPS } from "@/lib/navigation";
import { useCanonStore } from "@/lib/store/canon-store";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const setSelectedUniverseId = useCanonStore((state) => state.setSelectedUniverseId);
  const setCommandPaletteOpen = useCanonStore((state) => state.setCommandPaletteOpen);
  const inspectorOpen = useCanonStore((state) => state.inspectorOpen);
  const setInspectorOpen = useCanonStore((state) => state.setInspectorOpen);
  const density = useCanonStore((state) => state.density);
  const toggleDensity = useCanonStore((state) => state.toggleDensity);

  const { data: universes = [], isLoading: universesLoading } = useQuery({
    queryKey: ["universes"],
    queryFn: api.universes.list,
  });

  useEffect(() => {
    if (!universes.length) {
      return;
    }

    if (selectedUniverseId === null) {
      setSelectedUniverseId(universes[0].id);
      return;
    }

    if (!universes.some((universe) => universe.id === selectedUniverseId)) {
      setSelectedUniverseId(universes[0].id);
    }
  }, [selectedUniverseId, setSelectedUniverseId, universes]);

  const selectedUniverse =
    universes.find((universe) => universe.id === selectedUniverseId) ?? universes[0] ?? null;
  const activeItem = NAV_ITEMS.find((item) => isActivePath(pathname, item.href)) ?? NAV_ITEMS[0];

  return (
    <div className="relative min-h-screen">
      <CommandPalette />

      <div
        className={cn(
          "relative min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]",
          inspectorOpen && "xl:grid-cols-[260px_minmax(0,1fr)_300px]",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#0c1220] px-4 py-5 shadow-lg transition-transform duration-300 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-sky-400/50">Canon OS</p>
              <h1 className="text-xl font-medium tracking-[-0.02em] text-white">
                Canon Vault
              </h1>
              <p className="text-sm text-slate-500">{activeItem.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg border border-white/[0.06] p-2 text-slate-400 transition hover:text-white lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-slate-500">Active universe</p>
            <label className="block">
              <select
                value={selectedUniverseId ?? ""}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setSelectedUniverseId(Number.isNaN(nextValue) ? null : nextValue);
                }}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/20"
                disabled={universesLoading || universes.length === 0}
              >
                {universes.length === 0 ? (
                  <option value="">No universes found</option>
                ) : (
                  universes.map((universe) => (
                    <option key={universe.id} value={universe.id} className="bg-slate-950">
                      {universe.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            {selectedUniverse ? (
              <p className="text-sm leading-relaxed text-slate-500">
                {selectedUniverse.description ?? "Local-first canon space."}
              </p>
            ) : null}
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition",
                    active
                      ? "border-sky-400/12 bg-sky-400/[0.05] text-white"
                      : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-lg border p-1.5 transition",
                      active
                        ? "border-sky-400/12 bg-sky-400/[0.06] text-sky-300"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-400 group-hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-slate-500">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <SectionPanel tone="subtle" className="mt-4 space-y-3 p-3">
            <p className="text-xs font-medium text-slate-500">Quick actions</p>
            <div className="space-y-1.5">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                >
                  {action.label}
                  <Sparkles className="h-3.5 w-3.5 text-sky-400/60" />
                </Link>
              ))}
            </div>
          </SectionPanel>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[var(--background)]/80 px-4 py-3 backdrop-blur-md sm:px-6 xl:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-slate-300 transition hover:text-white lg:hidden"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
                <h2 className="text-lg font-medium text-white">
                  {activeItem.label}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Command className="h-3.5 w-3.5 text-sky-400/60" />
                  Search
                  <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                    {"\u2318"}K
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleDensity}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Binary className="h-3.5 w-3.5 text-slate-400" />
                  {density === "comfortable" ? "Comfortable" : "Compact"}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorOpen(!inspectorOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <PanelRight className="h-3.5 w-3.5 text-slate-400" />
                  {inspectorOpen ? "Hide inspector" : "Inspector"}
                </button>
              </div>
            </div>
          </header>

          <main
            className={cn(
              "min-w-0 px-4 py-6 sm:px-6 xl:px-8",
              density === "comfortable" ? "space-y-6" : "space-y-4",
            )}
          >
            {children}
          </main>
        </div>

        {inspectorOpen ? (
          <aside className="hidden border-l border-white/[0.06] bg-[#0c1220] px-4 py-5 xl:block">
            <div className="sticky top-24 space-y-4">
              <SectionPanel tone="subtle" className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-sky-400/10 bg-sky-400/[0.04] p-2.5 text-sky-300">
                    <DatabaseZap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedUniverse?.name ?? "No universe selected"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Local API at {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Creator-first workspace. Characters are the nucleus; every other record radiates from them.
                </p>
              </SectionPanel>

              <SectionPanel tone="subtle" className="space-y-3 p-4">
                <p className="text-xs font-medium text-slate-500">Canon discipline</p>
                <div className="space-y-2">
                  {SYSTEM_STRIPS.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                    >
                      <CircleDotDashed className="mt-0.5 h-4 w-4 text-sky-400/50" />
                      <p className="text-sm leading-relaxed text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </SectionPanel>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
