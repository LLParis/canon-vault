# Canon Vault — Project Rules for Claude Code

## Architecture

- **Monorepo**: `apps/api` (FastAPI + SQLModel + SQLite) and `apps/web` (Next.js App Router + TypeScript)
- **API is the single source of truth** — the frontend NEVER talks directly to the database
- **No second database** — the web app calls the API; it does not have its own DB or ORM
- Canon reference data lives at `D:\07_ANIME\01_PROJECTS\HHK_Universe`

## Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Backend   | Python 3.11+, FastAPI, SQLModel, SQLite, Alembic |
| Frontend  | Next.js 14+ (App Router), TypeScript, Server Actions |
| Lint/Fmt  | ruff + mypy (Python), eslint + prettier (JS/TS) |
| Tests     | pytest (backend), vitest or jest (frontend) |

## Conventions

- **Python**: snake_case, type hints everywhere, ruff format
- **TypeScript**: camelCase for variables, PascalCase for components/types
- **API routes**: RESTful `/api/v1/{entity}` pattern
- **Models**: SQLModel classes in `apps/api/app/models/`
- **No magic refactors** — don't reorganize files or rename things unless explicitly asked
- **No extra abstractions** — keep it simple, no unnecessary indirection

## Workflow Rules

1. Run tests after every change: `pytest` for backend
2. Keep imports sorted (ruff handles this)
3. Every API endpoint must have a Pydantic response model
4. Use `status` field (draft/review/locked/deprecated) on all canon entities
5. SQLite DB file goes in `apps/api/data/canon.db` (gitignored)

## Entity Types (v1)

- Character, Faction, Location, Organization
- TimelineEvent, Arc, Episode
- Rule (canon guardrails with severity: absolute/strong/soft)
- Relationship (Character ↔ Character)
- PromptTemplate (for SDXL / Veo / Runway prompt packs)

## What NOT to Do

- Don't introduce a second database or ORM in the frontend
- Don't add Docker unless asked
- Don't refactor working code for style preferences
- Don't add features beyond what's requested
- Don't commit .env files, DB files, or node_modules
