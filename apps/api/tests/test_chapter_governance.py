"""Tests for chapter lock enforcement and changelog behavior."""

from fastapi.testclient import TestClient


def _create_chapter(client: TestClient, universe_id: int, **overrides) -> dict:
    data = {
        "name": "Chapter One",
        "canon_id": "CH_001",
        "universe_id": universe_id,
        "chapter_number": 1,
        "season": 1,
        **overrides,
    }
    resp = client.post("/api/v1/chapters/", json=data)
    assert resp.status_code == 201
    return resp.json()


def test_locked_chapter_prevents_delete(client: TestClient, universe_id: int):
    chapter = _create_chapter(client, universe_id)
    lock_resp = client.patch(f"/api/v1/chapters/{chapter['id']}", json={"status": "locked"})
    assert lock_resp.status_code == 200

    resp = client.delete(f"/api/v1/chapters/{chapter['id']}")
    assert resp.status_code == 403


def test_locked_chapter_canon_update_writes_changelog(client: TestClient, universe_id: int):
    chapter = _create_chapter(client, universe_id)
    client.patch(f"/api/v1/chapters/{chapter['id']}", json={"status": "locked"})

    resp = client.patch(
        f"/api/v1/chapters/{chapter['id']}",
        json={"premise": "The cast is forced into open war."},
    )
    assert resp.status_code == 200

    changelog_resp = client.get(f"/api/v1/chapters/{chapter['id']}/changelog")
    assert changelog_resp.status_code == 200
    premise_logs = [
        entry for entry in changelog_resp.json() if entry["field_changed"] == "premise"
    ]
    assert len(premise_logs) >= 1


def test_unlock_chapter(client: TestClient, universe_id: int):
    chapter = _create_chapter(client, universe_id)
    client.patch(f"/api/v1/chapters/{chapter['id']}", json={"status": "locked"})

    resp = client.post(f"/api/v1/chapters/{chapter['id']}/unlock")
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"
