"use client";

import { useQuery } from "@tanstack/react-query";
import { Command, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api/client";
import { NAV_ITEMS } from "@/lib/navigation";
import { useCanonStore } from "@/lib/store/canon-store";
import { cn } from "@/lib/utils";

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
    description: `${character.canon_id} • ${character.faction ?? "untyped"} • ${character.status}`,
    href: `/characters/${character.id}`,
    group: "Characters",
  }));
  const episodeCommands: CommandItem[] = episodes.map((episode) => ({
    id: `episode-${episode.id}`,
    label: episode.name,
    description: `${episode.canon_id} • season ${episode.season} • ${episode.status}`,
    href: `/episodes/${episode.id}`,
    group: "Episodes",
  }));
  const chapterCommands: CommandItem[] = chapters.map((chapter) => ({
    id: `chapter-${chapter.id}`,
    label: chapter.name,
    description: `${chapter.canon_id} • season ${chapter.season} • ${chapter.status}`,
    href: `/chapters/${chapter.id}`,
    group: "Chapters",
  }));
  const locationCommands: CommandItem[] = locations.map((location) => ({
    id: `location-${location.id}`,
    label: location.name,
    description: `${location.canon_id} • ${location.region ?? "unmapped"} • ${location.status}`,
    href: `/locations/${location.id}`,
    group: "Locations",
  }));
  const factionCommands: CommandItem[] = factions.map((faction) => ({
    id: `faction-${faction.id}`,
    label: faction.name,
    description: `${faction.canon_id} • ${faction.status}`,
    href: `/factions/${faction.id}`,
    group: "Factions",
  }));
  const promptTemplateCommands: CommandItem[] = promptTemplates.map((template) => ({
    id: `prompt-template-${template.id}`,
    label: template.name,
    description: `${template.canon_id} • ${template.engine} • ${template.status}`,
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
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/72 px-4 pt-[12vh] backdrop-blur-xl">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,21,37,0.98),rgba(7,12,21,0.96))] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <Search className="h-4 w-4 text-cyan-100/90" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a page, character, or workflow..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400">
            esc
          </span>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {filteredCommands.length ? (
            <div className="space-y-2">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => {
                    router.push(command.href);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[24px] border border-transparent px-4 py-3 text-left transition",
                    "hover:border-cyan-300/18 hover:bg-cyan-300/[0.07]",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{command.label}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400/80">
                      {command.group}
                    </p>
                  </div>
                  <p className="max-w-[280px] text-right text-sm text-slate-300/75">
                    {command.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-cyan-100">
                <Command className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">No matches</p>
                <p className="text-sm text-slate-300/78">
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
