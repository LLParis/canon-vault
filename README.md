<div align="center">

<!-- Cyberpunk wave header -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,6,12,20&height=250&section=header&text=CANON%20VAULT&fontSize=90&fontAlignY=35&animation=fadeIn&fontColor=gradient&desc=⚡%20PROMPT%20FORGE%20×%20CANON%20OPERATING%20SYSTEM%20×%20WORLDBUILDING%20ENGINE%20⚡&descSize=22&descAlignY=58&descAlign=50"/>

<!-- Multi-line typing animation -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com/?font=JetBrains+Mono&weight=700&size=24&duration=2000&pause=500&color=00E5FF&center=true&vCenter=true&multiline=true&repeat=true&width=1000&height=120&lines=Single+source+of+truth+for+anime+%2F+IP+worldbuilding;Lock+State+%E2%80%A2+Changelog+Ledger+%E2%80%A2+YAML+Ingest+%E2%80%A2+Prompt+Forge;Built+for+the+Dominion+(Tear+Drops)+Universe" alt="Typing SVG" />
</a>

<br/>

<!-- Premium badges -->
<p>
  <a href="https://github.com/LLParis/canon-vault">
    <img src="https://custom-icon-badges.demolab.com/badge/-CANON_VAULT-00E5FF?style=for-the-badge&logo=repo&logoColor=00E5FF&labelColor=0b1220"/>
  </a>
  <img src="https://custom-icon-badges.demolab.com/badge/STATUS-🟢_OPERATIONAL-22C55E?style=for-the-badge&labelColor=0b1220"/>
  <img src="https://custom-icon-badges.demolab.com/badge/TESTS-42_PASSING-00E5FF?style=for-the-badge&labelColor=0b1220"/>
  <img src="https://custom-icon-badges.demolab.com/badge/RUFF-CLEAN-7C3AED?style=for-the-badge&labelColor=0b1220"/>
</p>

<p>

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Local--First-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</p>

</div>

---

<br/>

<div align="center">

## 🌌 MISSION VECTOR

</div>

```python
"""
Canon Vault — Canon Operating System v0.2
Lock the canon. Ship the prompts. Never drift.
"""

class CanonOperatingSystem:
    """Single source of truth for anime/IP worldbuilding"""

    def __init__(self):
        self.universe = "Dominion (Tear Drops)"
        self.architecture = "monorepo: api + web"
        self.philosophy = "api_is_truth"
        self.status = "operational"

    @property
    def capability_matrix(self) -> dict:
        """What the Canon Vault controls"""
        return {
            "entity_management": {
                "characters": ["v2_schema", "identity", "visual", "moveset", "forms"],
                "episodes": ["scripts", "scene_breakdown", "cast_links"],
                "chapters": ["arc_structure", "narrative_chain", "season_mapping"],
                "world": ["factions", "locations", "relationships", "power_systems"],
            },
            "governance": {
                "lock_state": ["draft", "review", "locked", "deprecated"],
                "changelog": ["every_mutation_tracked", "diff_snapshots", "audit_trail"],
                "versioning": ["per_field", "per_entity", "per_universe"],
                "guardrails": ["canon_rules", "consistency_checks", "drift_prevention"],
            },
            "prompt_forge": {
                "templates": ["sdxl", "veo", "runway", "custom_engines"],
                "rendering": ["variable_injection", "character_context", "scene_params"],
                "output": ["preview", "batch_export", "version_pinning"],
            },
            "ingest_pipeline": {
                "input": ["yaml_manifests", "drag_drop", "bulk_upload"],
                "processing": ["validate", "deduplicate", "upsert"],
                "source": ["HHK_Universe_canon_data", "manual_entry", "api_import"],
            },
        }

    def operating_principle(self) -> str:
        return "Characters are the nucleus. Lock state, changelog visibility, " \
               "and ingest readiness stay in the foreground at all times."

# Boot the canon
canon = CanonOperatingSystem()
assert canon.philosophy == "api_is_truth", "The API is the single source of truth"
```

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 🏗️ SYSTEM ARCHITECTURE

</div>

```ascii
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    ⚡ CANON VAULT v0.2 — SYSTEM TOPOLOGY ⚡                ║
║                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────┐     ║
║   │                        apps/web (Next.js 16)                    │     ║
║   │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │     ║
║   │  │  App Router   │  │  TanStack    │  │  Zustand Store        │ │     ║
║   │  │  15 pages     │  │  Query v5    │  │  (persisted)          │ │     ║
║   │  │  SSR + CSR    │  │  cache mgmt  │  │  universe / palette   │ │     ║
║   │  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │     ║
║   │         │                 │                       │             │     ║
║   │  ┌──────┴─────────────────┴───────────────────────┴───────────┐ │     ║
║   │  │  Components: SectionPanel · EntityCard · CommandPalette ⌘K │ │     ║
║   │  │  CharacterDossier (schema-driven) · ScriptViewer · JSON    │ │     ║
║   │  └────────────────────────┬───────────────────────────────────┘ │     ║
║   └───────────────────────────┼─────────────────────────────────────┘     ║
║                               │ REST /api/v1/*                            ║
║   ┌───────────────────────────┼─────────────────────────────────────┐     ║
║   │                    apps/api (FastAPI)                            │     ║
║   │  ┌────────────────────────┴───────────────────────────────────┐ │     ║
║   │  │  Routers: universes · characters · episodes · chapters     │ │     ║
║   │  │           relationships · factions · locations · ingest     │ │     ║
║   │  │           prompt_templates                                  │ │     ║
║   │  └────────────────────────┬───────────────────────────────────┘ │     ║
║   │  ┌────────────────────────┴───────────────────────────────────┐ │     ║
║   │  │  Services: changelog · ingest · script_reader              │ │     ║
║   │  │  Models: SQLModel + Pydantic v2 (10 entity types)          │ │     ║
║   │  └────────────────────────┬───────────────────────────────────┘ │     ║
║   │                           │                                     │     ║
║   │  ┌────────────────────────┴───────────────────────────────────┐ │     ║
║   │  │  SQLite (canon.db) — local-first, zero config              │ │     ║
║   │  │  42 tests passing · ruff clean · full CRUD + governance    │ │     ║
║   │  └───────────────────────────────────────────────────────────┘ │     ║
║   └─────────────────────────────────────────────────────────────────┘     ║
║                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────┐     ║
║   │  📁 Canon Source: D:\07_ANIME\01_PROJECTS\HHK_Universe          │     ║
║   │     YAML manifests → Ingest pipeline → Validate → Upsert → DB  │     ║
║   └─────────────────────────────────────────────────────────────────┘     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## ⚡ CANON PIPELINE

</div>

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#00E5FF','primaryTextColor':'#fff','primaryBorderColor':'#7C3AED','lineColor':'#22C55E','secondaryColor':'#0b1220','tertiaryColor':'#1f2937'}}}%%
flowchart LR
    A["📁 YAML Manifests<br/><small>HHK_Universe/</small>"] -->|ingest| B["⚡ FastAPI<br/><small>Validate + Upsert</small>"]
    B -->|SQLModel| C["🗄️ SQLite<br/><small>canon.db</small>"]
    C -->|REST API| D["🖥️ Next.js<br/><small>Operator UI</small>"]
    D -->|mutations| B
    B -->|audit| E["📋 Changelog<br/><small>Every mutation tracked</small>"]
    C -->|templates| F["🎨 Prompt Forge<br/><small>SDXL / Veo / Runway</small>"]

    style A fill:#0b1220,stroke:#00E5FF,stroke-width:2px,color:#fff
    style B fill:#0b1220,stroke:#22C55E,stroke-width:2px,color:#fff
    style C fill:#0b1220,stroke:#FFB800,stroke-width:2px,color:#fff
    style D fill:#0b1220,stroke:#00E5FF,stroke-width:2px,color:#fff
    style E fill:#0b1220,stroke:#7C3AED,stroke-width:2px,color:#fff
    style F fill:#0b1220,stroke:#FF6B6B,stroke-width:2px,color:#fff
```

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 💻 TECHNOLOGY STACK & TOOLCHAIN

</div>

<table>
<tr>
<td width="33%" valign="top">

<div align="center">

### ⚡ Backend — API Layer

![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

<img src="https://skillicons.dev/icons?i=python,fastapi,sqlite&perline=3" />

</div>

```yaml
framework: FastAPI 0.115+
orm: SQLModel (SQLAlchemy core)
database: SQLite (local-first)
validation: Pydantic v2
migrations: Alembic
server: Uvicorn
yaml_parsing: PyYAML + ruamel
fuzzy_search: RapidFuzz
```

</td>
<td width="33%" valign="top">

<div align="center">

### 🖥️ Frontend — Operator UI

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

<img src="https://skillicons.dev/icons?i=nextjs,ts,tailwind,react&perline=4" />

</div>

```yaml
framework: Next.js 16 (App Router)
language: TypeScript 5.x
styling: Tailwind CSS 4
state: Zustand (persisted)
data_fetching: TanStack Query v5
icons: Lucide React
types: openapi-typescript (generated)
design: Apple-level dark mode
```

</td>
<td width="33%" valign="top">

<div align="center">

### 🔧 Tooling & Quality

![Ruff](https://img.shields.io/badge/Ruff-D4AA00?style=for-the-badge&logo=ruff&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

<img src="https://skillicons.dev/icons?i=git,github,vscode&perline=3" />

</div>

```yaml
python_lint: Ruff (format + check)
python_test: Pytest (42 tests)
js_lint: ESLint + Prettier
type_gen: openapi-typescript
vcs: Git + GitHub
editor: VSCode
shell: Git Bash (Windows 11)
ci: Manual (Phase 6 target)
```

</td>
</tr>
</table>

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 📊 ENTITY MODEL & GOVERNANCE

</div>

<table>
<tr>
<td width="50%" valign="top">

<div align="center">

### 🗂️ Canon Entities

<img src="https://custom-icon-badges.demolab.com/badge/ENTITIES-10_TYPES-00E5FF?style=for-the-badge&labelColor=0b1220"/>

</div>

```yaml
characters:
  schema: v2 (richest entity)
  sections:
    - identity (name, codename, faction, tier)
    - visual (design notes, color palette)
    - personality (traits, quirks, voice)
    - moveset (abilities, canon_rules, themes)
    - forms (transformations, arc_phases, hooks)
  features:
    - schema-driven dossier tabs
    - per-field versioning
    - prompt_description for AI context

episodes:
  - name, season, episode_number
  - script linking (full text viewer)
  - scene breakdowns + cast links
  - status governance

chapters:
  - arc structure + season mapping
  - narrative chain ordering
  - episode grouping

world:
  - factions (ideology, leadership)
  - locations (region, coordinates)
  - relationships (character ↔ character)
  - relationship_type + dynamic text

prompt_templates:
  - engine: sdxl / veo / runway / custom
  - template body with variable slots
  - render preview + output export
```

</td>
<td width="50%" valign="top">

<div align="center">

### 🔒 Governance System

<img src="https://custom-icon-badges.demolab.com/badge/GOVERNANCE-FULL_AUDIT-7C3AED?style=for-the-badge&labelColor=0b1220"/>

</div>

```yaml
status_lifecycle:
  states: [draft, review, locked, deprecated]
  transitions:
    - draft → review (ready for inspection)
    - review → locked (canon-sealed)
    - locked → review (unlock for edits)
    - any → deprecated (soft delete)
  enforcement:
    - locked entities reject mutations
    - status changes logged to changelog

changelog_ledger:
  tracks: every mutation on every entity
  captures:
    - entity_type + entity_id
    - field changed + old/new values
    - timestamp + action type
    - diff snapshots for rollback context
  display:
    - timeline UI with color-coded diffs
    - additions (green) / removals (red)
    - filterable by entity and date

version_control:
  - per-entity version counter
  - increments on every update
  - locked_at timestamp for seal date
  - universe-scoped isolation

ingest_pipeline:
  input: YAML manifests (drag + drop)
  steps:
    - parse + validate against schema
    - deduplicate by canon_id
    - upsert (create or update)
    - log all changes to changelog
  source: HHK_Universe canon data
```

</td>
</tr>
</table>

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 🖥️ OPERATOR UI — FEATURE MAP

</div>

<table>
<tr>
<td width="33%" align="center">

### 🎛️ Control Surface
<br/>

Dashboard with live stats
<br/>
Universe footprint counts
<br/>
Spotlight: recent dossiers
<br/>
Quick-action launchers
<br/>
Reviewed / locked counters

</td>
<td width="33%" align="center">

### ⌘ Command Palette
<br/>

`Ctrl+K` global search
<br/>
All entities indexed
<br/>
Fuzzy match across names
<br/>
Jump to any page instantly
<br/>
Groups: Navigate · Entities

</td>
<td width="33%" align="center">

### 📋 Schema-Driven Dossier
<br/>

Config-driven tab system
<br/>
Add field = one config entry
<br/>
Zero new JSX required
<br/>
Recursive JSON renderer
<br/>
Relationships + Changelog tabs

</td>
</tr>
<tr>
<td width="33%" align="center">

### 📜 Script Viewer
<br/>

Full episode scripts
<br/>
Line-numbered display
<br/>
Source type + line count
<br/>
File path reference
<br/>
72vh scrollable viewport

</td>
<td width="33%" align="center">

### 🔍 Inspector Panel
<br/>

Slide-out side panel
<br/>
Quick entity preview
<br/>
Toggle with hotkey
<br/>
Non-blocking workflow
<br/>
Density settings

</td>
<td width="33%" align="center">

### 🌐 Multi-Universe
<br/>

Universe switcher sidebar
<br/>
Scoped data isolation
<br/>
Persisted selection
<br/>
Create new universes
<br/>
Per-universe entity counts

</td>
</tr>
</table>

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 📂 PROJECT STRUCTURE

</div>

```
canon-vault/
├── apps/
│   ├── api/                              # ⚡ FastAPI backend (single source of truth)
│   │   ├── app/
│   │   │   ├── models/                   # SQLModel entity definitions
│   │   │   │   ├── character.py          #   v2 schema — identity, visual, moveset, forms
│   │   │   │   ├── episode.py            #   episodes + script linking
│   │   │   │   ├── chapter.py            #   chapters + arc structure
│   │   │   │   ├── relationship.py       #   character ↔ character edges
│   │   │   │   ├── faction.py            #   faction entities
│   │   │   │   ├── location.py           #   world geography
│   │   │   │   ├── prompt_template.py    #   Prompt Forge templates
│   │   │   │   ├── changelog.py          #   mutation audit ledger
│   │   │   │   ├── universe.py           #   multi-universe support
│   │   │   │   └── _base.py              #   shared base model
│   │   │   ├── routers/                  # RESTful /api/v1/* endpoints (9 routers)
│   │   │   ├── services/                 # Business logic (ingest, changelog, scripts)
│   │   │   └── main.py                   # App entrypoint + CORS + lifespan
│   │   ├── tests/                        # 42 tests — CRUD, governance, ingest, scripts
│   │   ├── data/                         # SQLite DB (gitignored)
│   │   └── pyproject.toml                # Python project config
│   │
│   └── web/                              # 🖥️ Next.js frontend (operator UI)
│       └── src/
│           ├── app/                       # App Router — 15 pages
│           │   ├── page.tsx               #   Dashboard control surface
│           │   ├── characters/            #   Cast registry + dossier detail
│           │   ├── episodes/              #   Episode list + script viewer
│           │   ├── chapters/              #   Chapter + arc browser
│           │   ├── relationships/         #   Relationship lattice
│           │   ├── factions/              #   Faction registry
│           │   ├── locations/             #   World map browser
│           │   ├── prompt-templates/      #   Prompt Forge UI
│           │   └── ingest/               #   YAML drop → validate → upsert
│           ├── components/                # Shared UI (12 components)
│           │   ├── app-shell.tsx           #   Sidebar + header + inspector
│           │   ├── command-palette.tsx     #   ⌘K global search
│           │   ├── character-dossier.tsx   #   Schema-driven tabbed dossier
│           │   ├── section-panel.tsx       #   Master panel wrapper
│           │   ├── entity-card.tsx         #   Reusable entity card
│           │   ├── entity-hero.tsx         #   Detail page hero header
│           │   ├── script-viewer.tsx       #   Full episode script renderer
│           │   ├── json-section.tsx        #   Recursive JSON renderer
│           │   ├── changelog-timeline.tsx  #   Audit log timeline
│           │   ├── status-badge.tsx        #   Semantic status chips
│           │   ├── page-header.tsx         #   List page header
│           │   ├── empty-state.tsx         #   Empty/error placeholders
│           │   └── loading-state.tsx       #   Loading skeletons
│           └── lib/
│               ├── api/                   # API client + types
│               │   ├── client.ts          #   Fetch wrapper
│               │   ├── generated.ts       #   openapi-typescript output
│               │   └── types.ts           #   Re-exports + manual types
│               ├── dossier-schema.ts      #   Config-driven dossier tabs
│               ├── navigation.ts          #   Sidebar nav items
│               ├── utils.ts               #   Formatters + helpers
│               └── store/
│                   └── canon-store.ts     #   Zustand persisted store
│
├── CLAUDE.md                              # Project rules for Claude Code
└── README.md                              # You are here
```

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 🚀 QUICK START

</div>

### 1. Clone

```bash
git clone https://github.com/LLParis/canon-vault.git
cd canon-vault
```

### 2. Backend (API)

```bash
cd apps/api
python -m venv .venv
source .venv/Scripts/activate    # Windows (Git Bash)
# source .venv/bin/activate      # macOS / Linux
pip install -e ".[dev]"

# Boot the API
python -m uvicorn app.main:app --reload --port 8001
```

| Endpoint | URL |
|:---------|:----|
| 🟢 Health check | `http://localhost:8001/health` |
| 📖 API docs (Swagger) | `http://localhost:8001/docs` |
| 📋 OpenAPI spec | `http://localhost:8001/openapi.json` |

### 3. Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

| Endpoint | URL |
|:---------|:----|
| 🖥️ Dashboard | `http://localhost:3000` |

### 4. Verify

```bash
# Backend tests (42 passing)
cd apps/api && source .venv/Scripts/activate
pytest

# Lint check
ruff check . && ruff format --check .

# Frontend build
cd apps/web && npm run build
```

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

## 🗺️ ROADMAP & PHASE STATUS

</div>

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#00E5FF','primaryTextColor':'#fff','primaryBorderColor':'#7C3AED','lineColor':'#22C55E','secondaryColor':'#0b1220','tertiaryColor':'#1f2937'}}}%%
timeline
    title Canon Vault Development Timeline

    Phase 1 ✅ : Scaffold
              : Monorepo structure
              : API + Web bootstrapped
              : Build pipeline verified

    Phase 2 ✅ : Data Model + CRUD
              : 10 entity types
              : Full REST API
              : YAML ingest pipeline
              : 42 tests passing

    Phase 3 ✅ : Operator UI
              : 15 pages built
              : Apple-level design system
              : Schema-driven dossier
              : Command palette ⌘K

    Phase 4 🔵 : Consistency Checker
              : Cross-entity validation
              : Drift detection
              : Canon rule enforcement

    Phase 5 🔵 : Prompt Forge
              : Template rendering
              : Variable injection
              : Batch export packs

    Phase 6 🔵 : Tests + CI
              : Coverage targets
              : GitHub Actions
              : Pre-commit hooks
```

<br/>

<table>
<tr>
<td width="25%" align="center">

### ✅ PHASE 1
**Scaffold**
<br/><br/>
Monorepo boots
<br/>
API + Web ready
<br/>
Build verified
<br/>
Git initialized

</td>
<td width="25%" align="center">

### ✅ PHASE 2
**Data + CRUD**
<br/><br/>
10 entity types
<br/>
Full REST API
<br/>
YAML ingest
<br/>
42 tests passing

</td>
<td width="25%" align="center">

### ✅ PHASE 3
**Operator UI**
<br/><br/>
15 pages built
<br/>
Apple design system
<br/>
Schema dossier
<br/>
Command palette

</td>
<td width="25%" align="center">

### 🔵 PHASE 4-6
**Next Up**
<br/><br/>
Consistency checks
<br/>
Prompt Forge render
<br/>
Export packs
<br/>
CI pipeline

</td>
</tr>
</table>

<br/>

---

<br/>

<div align="center">

## ⚡ CORE PRINCIPLES

</div>

```ascii
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                ⚡ LOCK THE CANON. SHIP THE PROMPTS. ⚡                    ║
║                                                                           ║
║   "The API is the single source of truth. The frontend never touches     ║
║    the database. Every mutation is tracked. Drift is the enemy."         ║
║                                                                           ║
║   ┌─────────────────────────────────────────────────────────────┐       ║
║   │  ✓  API is the single source of truth — always              │       ║
║   │  ✓  Every mutation logged to the changelog ledger            │       ║
║   │  ✓  Lock state enforced — locked entities reject writes      │       ║
║   │  ✓  Schema-driven UI — add a field, zero new JSX             │       ║
║   │  ✓  Local-first — SQLite, no cloud dependency                │       ║
║   │                                                              │       ║
║   │  ✗  No second database in the frontend                      │       ║
║   │  ✗  No magic refactors or unnecessary abstractions           │       ║
║   │  ✗  No features beyond what's requested                      │       ║
║   │  ✗  No Docker unless explicitly asked                        │       ║
║   └─────────────────────────────────────────────────────────────┘       ║
║                                                                           ║
║   Characters remain the nucleus. Lock state, changelog visibility,       ║
║   and ingest readiness stay in the foreground at all times.              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

<br/>

---

<div align="center">

### 🎯 Universe: **Dominion (Tear Drops)**
### 🚀 Status: **Operational — Phases 1-3 Complete**
### 🌟 Next: **Consistency Checker + Prompt Forge Rendering**

<br/>

---

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,6,12,20&height=120&section=footer&animation=twinkling"/>

<br/>

**[⬆ Back to Top](#canon-vault)** • Built with 💜 by LLParis • Canon Vault v0.2

</div>
