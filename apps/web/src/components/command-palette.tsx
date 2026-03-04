"use client";

import { useQuery } from "@tanstack/react-query";
import { Command, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api/client";
import { NAV_ITEMS } from "@/lib/navigation";
import { useCanonStore } from "@/lib/store/canon-store";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  group: string;
};

export function CommandPalette() {
  const router = useRouter();
  const open = useCanonStore((state) => state.commandPaletteOpen);
  const setOpen = useCanonStore((state) => state.setCommandPaletteOpen);
  const selectedUniverseId = useCanonStore((state) => state.selectedUniverseId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { data: characters = [] } = useQuery({
    queryKey: ["command-palette-characters", selectedUniverseId],
    queryFn: () => api.characters.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });
  const { data: episodes = [] } = useQuery({
    queryKey: ["command-palette-episodes", selectedUniverseId],
    queryFn: () => api.episodes.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["command-palette-chapters", selectedUniverseId],
    queryFn: () => api.chapters.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["command-palette-locations", selectedUniverseId],
    queryFn: () => api.locations.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });
  const { data: factions = [] } = useQuery({
    queryKey: ["command-palette-factions", selectedUniverseId],
    queryFn: () => api.factions.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });
  const { data: promptTemplates = [] } = useQuery({
    queryKey: ["command-palette-prompt-templates", selectedUniverseId],
    queryFn: () => api.promptTemplates.list({ universe_id: selectedUniverseId }),
    enabled: open && selectedUniverseId !== null,
  });

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          setQuery("");
        }
        setOpen(!open);
      }

      if (event.key === "Escape") {
        setQuery("");
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const staticCommands: CommandItem[] = NAV_ITEMS.map((item) => ({
    id: item.href,
    label: item.label,
    description: item.description,
    href: item.href,
    group: "Navigate",
  }));

  const characterCommands: CommandItem[] = characters.map((character) => ({
    id: `character-${character.id}`,
    label: character.name,
    description: `${character.canon_id} · ${character.faction ?? "untyped"} · ${character.status}`,
    href: `/characters/${character.id}`,
    group: "Characters",
  }));
  const episodeCommands: CommandItem[] = episodes.map((episode) => ({
    id: `episode-${episode.id}`,
    label: episode.name,
    description: `${episode.canon_id} · season ${episode.season} · ${episode.status}`,
    href: `/episodes/${episode.id}`,
    group: "Episodes",
  }));
  const chapterCommands: CommandItem[] = chapters.map((chapter) => ({
    id: `chapter-${chapter.id}`,
    label: chapter.name,
    description: `${chapter.canon_id} · season ${chapter.season} · ${chapter.status}`,
    href: `/chapters/${chapter.id}`,
    group: "Chapters",
  }));
  const locationCommands: CommandItem[] = locations.map((location) => ({
    id: `location-${location.id}`,
    label: location.name,
    description: `${location.canon_id} · ${location.region ?? "unmapped"} · ${location.status}`,
    href: `/locations/${location.id}`,
    group: "Locations",
  }));
  const factionCommands: CommandItem[] = factions.map((faction) => ({
    id: `faction-${faction.id}`,
    label: faction.name,
    description: `${faction.canon_id} · ${faction.status}`,
    href: `/factions/${faction.id}`,
    group: "Factions",
  }));
  const promptTemplateCommands: CommandItem[] = promptTemplates.map((template) => ({
    id: `prompt-template-${template.id}`,
    label: template.name,
    description: `${template.canon_id} · ${template.engine} · ${template.status}`,
    href: `/prompt-templates/${template.id}`,
    group: "Prompt Forge",
  }));

  const allCommands = [
    ...staticCommands,
    ...characterCommands,
    ...episodeCommands,
    ...chapterCommands,
    ...locationCommands,
    ...factionCommands,
    ...promptTemplateCommands,
  ];
  const normalized = deferredQuery.trim().toLowerCase();
  const filteredCommands = allCommands
    .filter((item) => {
      if (!normalized) {
        return true;
      }

      return `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(normalized);
    })
    .slice(0, 12);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0e1420] p-3 shadow-2xl">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <Search className="h-4 w-4 text-sky-400/60" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a page, character, or workflow..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            esc
          </span>
        </div>

        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {filteredCommands.length ? (
            <div className="space-y-1">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => {
                    router.push(command.href);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{command.label}</p>
                    <p className="text-xs text-slate-500">{command.group}</p>
                  </div>
                  <p className="max-w-[240px] text-right text-xs text-slate-500">
                    {command.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-sky-300">
                <Command className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">No matches</p>
                <p className="text-sm text-slate-500">
                  Try a page name, a character name, or a canon ID.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
