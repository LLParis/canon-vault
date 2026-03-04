export type DossierTab =
  | { id: string; label: string; description: string; dataKey: string }
  | { id: string; label: string; description: string; dataKeys: string[] }
  | { id: string; label: string; description: string; special: "relationships" | "changelog" };

export const CHARACTER_TABS: DossierTab[] = [
  {
    id: "identity",
    label: "Identity",
    description: "Codename, lineage, symbolic role, and thematic nucleus.",
    dataKey: "identity",
  },
  {
    id: "visual",
    label: "Visual",
    description: "Silhouette, aura language, and lock-critical visual rules.",
    dataKey: "visual",
  },
  {
    id: "personality",
    label: "Personality",
    description: "Surface read, fears, flaws, desires, and hidden fracture lines.",
    dataKeys: ["personality", "quirks", "voice"],
  },
  {
    id: "moveset",
    label: "Moveset",
    description: "Power rules, signature techniques, and future unlocks.",
    dataKeys: ["moveset", "canon_rules", "themes"],
  },
  {
    id: "forms",
    label: "Forms",
    description: "Stage progression, physical changes, and combat role drift.",
    dataKeys: ["forms", "arc_phases", "open_hooks", "assets"],
  },
  {
    id: "relationships",
    label: "Relationships",
    description: "The living social graph that surrounds the character.",
    special: "relationships",
  },
  {
    id: "changelog",
    label: "Changelog",
    description: "Anti-drift history. Every canon move leaves a trace.",
    special: "changelog",
  },
];
