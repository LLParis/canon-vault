import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  GitBranchPlus,
  LayoutDashboard,
  MapPinned,
  Shield,
  UploadCloud,
  Users,
  WandSparkles,
  Workflow,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    description: "Universe pulse and system telemetry",
    icon: LayoutDashboard,
  },
  {
    href: "/characters",
    label: "Characters",
    description: "The nucleus of canon operations",
    icon: Users,
  },
  {
    href: "/relationships",
    label: "Relationships",
    description: "Interpersonal structure and tension",
    icon: GitBranchPlus,
  },
  {
    href: "/episodes",
    label: "Episodes",
    description: "Story delivery and scene architecture",
    icon: Workflow,
  },
  {
    href: "/chapters",
    label: "Chapters",
    description: "Season arcs and narrative clusters",
    icon: BookOpenText,
  },
  {
    href: "/locations",
    label: "Locations",
    description: "World geography and atmospheric anchors",
    icon: MapPinned,
  },
  {
    href: "/factions",
    label: "Factions",
    description: "Power blocs, methods, and territory",
    icon: Shield,
  },
  {
    href: "/prompt-templates",
    label: "Prompt Forge",
    description: "Template rendering and production hooks",
    icon: WandSparkles,
  },
  {
    href: "/ingest",
    label: "Ingest",
    description: "Bring structured canon into the vault",
    icon: UploadCloud,
  },
];

export const QUICK_ACTIONS = [
  { href: "/characters", label: "Open cast registry" },
  { href: "/ingest", label: "Ingest a YAML file" },
  { href: "/prompt-templates", label: "Render a prompt template" },
  { href: "/relationships", label: "Inspect relationship lattice" },
];

export const SYSTEM_STRIPS = [
  "API-first and local-only",
  "Lock state visible, changelog close",
  "Characters at the center of every workflow",
];
