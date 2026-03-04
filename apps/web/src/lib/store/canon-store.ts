"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Density = "comfortable" | "compact";

type CanonStore = {
  selectedUniverseId: number | null;
  commandPaletteOpen: boolean;
  inspectorOpen: boolean;
  density: Density;
  setSelectedUniverseId: (id: number | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  toggleDensity: () => void;
};

export const useCanonStore = create<CanonStore>()(
  persist(
    (set) => ({
      selectedUniverseId: null,
      commandPaletteOpen: false,
      inspectorOpen: true,
      density: "comfortable",
      setSelectedUniverseId: (selectedUniverseId) => set({ selectedUniverseId }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      toggleDensity: () =>
        set((state) => ({
          density: state.density === "comfortable" ? "compact" : "comfortable",
        })),
    }),
    {
      name: "canon-os-store",
      partialize: (state) => ({
        selectedUniverseId: state.selectedUniverseId,
        inspectorOpen: state.inspectorOpen,
        density: state.density,
      }),
    },
  ),
);
