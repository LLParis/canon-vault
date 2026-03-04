"""Shared test fixtures — in-memory SQLite database per test."""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Import all models so tables are registered
import app.models  # noqa: F401
from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="universe_id")
def universe_id_fixture(client: TestClient) -> int:
    """Create a test universe and return its ID."""
    resp = client.post("/api/v1/universes/", json={
        "name": "Test Universe",
        "slug": "test-universe",
    })
    assert resp.status_code == 201
    return resp.json()["id"]
