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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(88,224,255,0.12),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(255,118,106,0.13),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(194,255,116,0.08),transparent_32%)]" />
      <CommandPalette />

      <div
        className={cn(
          "relative min-h-screen lg:grid lg:grid-cols-[290px_minmax(0,1fr)]",
          inspectorOpen && "xl:grid-cols-[290px_minmax(0,1fr)_320px]",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/74 backdrop-blur-sm transition lg:hidden",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(8,15,26,0.98),rgba(5,10,18,0.96))] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-transform duration-300 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/72">
                Canon OS
              </p>
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.05em] text-white">
                  Canon Vault
                </h1>
                <p className="text-sm text-slate-300/72">{activeItem.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400/74">
              Active universe
            </p>
            <label className="block">
              <select
                value={selectedUniverseId ?? ""}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setSelectedUniverseId(Number.isNaN(nextValue) ? null : nextValue);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
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
              <p className="text-sm leading-6 text-slate-300/76">
                {selectedUniverse.description ?? "Local-first canon space."}
              </p>
            ) : null}
          </div>

          <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-start gap-3 rounded-[24px] border px-4 py-3 transition",
                    active
                      ? "border-cyan-300/20 bg-cyan-300/[0.08] text-white"
                      : "border-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.03] hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 rounded-2xl border p-2 transition",
                      active
                        ? "border-cyan-300/18 bg-cyan-300/12 text-cyan-100"
                        : "border-white/8 bg-white/[0.02] text-slate-300 group-hover:border-white/10 group-hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 space-y-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs leading-5 text-slate-400/78">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <SectionPanel tone="subtle" className="mt-5 space-y-3 p-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400/74">Quick actions</p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-200/84 transition hover:border-cyan-300/16 hover:text-white"
                >
                  {action.label}
                  <Sparkles className="h-4 w-4 text-cyan-100/80" />
                </Link>
              ))}
            </div>
          </SectionPanel>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/56 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-200 transition hover:border-white/20 hover:text-white lg:hidden"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400/76">Control surface</p>
                  <h2 className="text-xl font-semibold tracking-[-0.04em] text-white">
                    {activeItem.label}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/18 hover:text-white"
                >
                  <Command className="h-4 w-4 text-cyan-100" />
                  Search or jump
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    Cmd/Ctrl+K
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleDensity}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:border-white/18 hover:text-white"
                >
                  <Binary className="h-4 w-4 text-amber-100" />
                  {density === "comfortable" ? "Comfortable density" : "Compact density"}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorOpen(!inspectorOpen)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:border-white/18 hover:text-white"
                >
                  <PanelRight className="h-4 w-4 text-cyan-100" />
                  {inspectorOpen ? "Hide inspector" : "Show inspector"}
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
          <aside className="hidden border-l border-white/10 bg-[linear-gradient(180deg,rgba(9,14,24,0.92),rgba(6,10,18,0.94))] px-5 py-6 xl:block">
            <div className="sticky top-24 space-y-4">
              <SectionPanel tone="subtle" className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/12 p-3 text-cyan-100">
                    <DatabaseZap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedUniverse?.name ?? "No universe selected"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400/76">
                      Local API at {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300/82">
                  Creator-first workspace. Characters are the nucleus; every other record radiates from them.
                </p>
              </SectionPanel>

              <SectionPanel tone="subtle" className="space-y-3 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400/76">
                  Canon discipline
                </p>
                <div className="space-y-2">
                  {SYSTEM_STRIPS.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                    >
                      <CircleDotDashed className="mt-0.5 h-4 w-4 text-cyan-100/80" />
                      <p className="text-sm leading-6 text-slate-200/84">{item}</p>
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
