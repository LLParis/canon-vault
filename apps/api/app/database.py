import os
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_FILENAME = os.getenv("CANON_VAULT_DB_FILENAME", "canon_v2.db")
DATABASE_URL = f"sqlite:///{DB_DIR / DB_FILENAME}"

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():  # noqa: ANN201
    with Session(engine) as session:
        yield session
