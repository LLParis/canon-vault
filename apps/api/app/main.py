import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models.chapter import Chapter
from app.models.character import Character
from app.models.episode import Episode
from app.models.universe import Universe
from app.routers import (
    chapters,
    characters,
    episodes,
    factions,
    ingest,
    locations,
    prompt_templates,
    relationships,
    universes,
)
from app.services.ingest import DEFAULT_SOURCE_ROOT, bootstrap_source_directory

logger = logging.getLogger(__name__)


def seed_default_universe() -> None:
    with Session(engine) as session:
        existing_universe = session.exec(select(Universe.id).limit(1)).first()
        if existing_universe is not None:
            return

        session.add(
            Universe(
                name="Dominion",
                slug="dominion",
                description="The Dominion (Tear Drops) universe",
            )
        )
        session.commit()


def auto_bootstrap_default_source() -> None:
    with Session(engine) as session:
        universe = session.exec(select(Universe).where(Universe.slug == "dominion")).first()
        if universe is None:
            return

        has_characters = session.exec(
            select(Character.id).where(Character.universe_id == universe.id).limit(1)
        ).first()
        has_chapters = session.exec(
            select(Chapter.id).where(Chapter.universe_id == universe.id).limit(1)
        ).first()
        has_episodes = session.exec(
            select(Episode.id).where(Episode.universe_id == universe.id).limit(1)
        ).first()
        if has_characters is not None and has_chapters is not None and has_episodes is not None:
            return

        if not DEFAULT_SOURCE_ROOT.exists():
            return

        try:
            summary = bootstrap_source_directory(session, str(DEFAULT_SOURCE_ROOT), universe.id)
            logger.info(
                "Automatic source bootstrap finished: %s chapters, %s episodes, %s characters imported",
                summary["chapters_imported"],
                summary["episodes_imported"],
                summary["text_imported"] + summary["yaml_imported"],
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Automatic source bootstrap failed: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_default_universe()
    auto_bootstrap_default_source()
    yield


app = FastAPI(
    title="Canon Vault API",
    description="Single source of truth for anime/IP worldbuilding — Dominion Universe",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(universes.router)
app.include_router(characters.router)
app.include_router(relationships.router)
app.include_router(episodes.router)
app.include_router(chapters.router)
app.include_router(locations.router)
app.include_router(factions.router)
app.include_router(prompt_templates.router)
app.include_router(ingest.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "canon-vault-api"}
