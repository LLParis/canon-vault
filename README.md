# Canon Vault + Prompt Forge

Single source of truth for anime/IP worldbuilding — built for the **Dominion (Tear Drops)** universe.

## Repo Layout

```
canon-vault/
  apps/
    api/        # FastAPI + SQLModel + SQLite
    web/        # Next.js App Router + TypeScript
  CLAUDE.md     # Project rules for Claude Code
```

## Setup

### Backend (API)

```bash
cd apps/api
python -m venv .venv

# Windows (Git Bash)
source .venv/Scripts/activate

# macOS/Linux
source .venv/bin/activate

pip install -e ".[dev]"
```

### Frontend (Web)

```bash
cd apps/web
npm install
```

## Run

### API Server

```bash
cd apps/api
source .venv/Scripts/activate
python -m uvicorn app.main:app --reload --port 8001
```

- Health check: http://localhost:8001/health
- API docs: http://localhost:8001/docs

### Web App

```bash
cd apps/web
npm run dev
```

- Dashboard: http://localhost:3000

## Test

```bash
# Backend
cd apps/api
source .venv/Scripts/activate
pytest

# Lint
ruff check .
ruff format --check .
```

## Current State

- Backend: FastAPI + SQLModel + SQLite with universes, characters, relationships, chapters, episodes, factions, locations, prompt templates, and YAML ingest
- Frontend: Next.js app shell is present, but the real operator UI is still Phase 3 work
- API is the single source of truth; the web app should only talk to the API
- SQLite stays local at `apps/api/data/canon.db`
- Canon reference data lives at `D:\07_ANIME\01_PROJECTS\HHK_Universe`

## Phases

- [x] Phase 1 — Scaffold (repo boots cleanly)
- [x] Phase 2 — Data model + CRUD + ingest
- [ ] Phase 3 — Usable frontend UI
- [ ] Phase 4 — Consistency checker
- [ ] Phase 5 — Export packs
- [ ] Phase 6 — Tests + guardrails
