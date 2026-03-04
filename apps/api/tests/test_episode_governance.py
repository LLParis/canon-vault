"""Tests for episode lock enforcement and changelog behavior."""

from fastapi.testclient import TestClient


def _create_episode(client: TestClient, universe_id: int, **overrides) -> dict:
    data = {
        "name": "Episode One",
        "canon_id": "S1E01",
        "universe_id": universe_id,
        "number": 1,
        "season": 1,
        **overrides,
    }
    resp = client.post("/api/v1/episodes/", json=data)
    assert resp.status_code == 201
    return resp.json()


def test_locked_episode_prevents_delete(client: TestClient, universe_id: int):
    episode = _create_episode(client, universe_id)
    lock_resp = client.patch(f"/api/v1/episodes/{episode['id']}", json={"status": "locked"})
    assert lock_resp.status_code == 200

    resp = client.delete(f"/api/v1/episodes/{episode['id']}")
    assert resp.status_code == 403


def test_locked_episode_canon_update_writes_changelog(client: TestClient, universe_id: int):
    episode = _create_episode(client, universe_id)
    client.patch(f"/api/v1/episodes/{episode['id']}", json={"status": "locked"})

    resp = client.patch(
        f"/api/v1/episodes/{episode['id']}",
        json={"logline": "A doomed alliance buys one more night."},
    )
    assert resp.status_code == 200

    changelog_resp = client.get(f"/api/v1/episodes/{episode['id']}/changelog")
    assert changelog_resp.status_code == 200
    logline_logs = [
        entry for entry in changelog_resp.json() if entry["field_changed"] == "logline"
    ]
    assert len(logline_logs) >= 1


def test_unlock_episode(client: TestClient, universe_id: int):
    episode = _create_episode(client, universe_id)
    client.patch(f"/api/v1/episodes/{episode['id']}", json={"status": "locked"})

    resp = client.post(f"/api/v1/episodes/{episode['id']}/unlock")
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"
