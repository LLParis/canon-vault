"""Tests for changelog recording."""

from fastapi.testclient import TestClient


def _create_character(client: TestClient, universe_id: int) -> dict:
    resp = client.post("/api/v1/characters/", json={
        "name": "ChangelogTestChar",
        "canon_id": "C_CL",
        "universe_id": universe_id,
    })
    return resp.json()


def test_changelog_records_updates(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"name": "NewName"})

    resp = client.get(f"/api/v1/characters/{char['id']}/changelog")
    assert resp.status_code == 200
    logs = resp.json()
    name_logs = [entry for entry in logs if entry["field_changed"] == "name"]
    assert len(name_logs) == 1
    assert name_logs[0]["old_value"] == "ChangelogTestChar"
    assert name_logs[0]["new_value"] == "NewName"
    assert name_logs[0]["change_source"] == "api"


def test_changelog_version_bump(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    assert char["version"] == 1

    resp = client.patch(f"/api/v1/characters/{char['id']}", json={"codename": "Code1"})
    assert resp.json()["version"] == 2

    resp = client.patch(f"/api/v1/characters/{char['id']}", json={"codename": "Code2"})
    assert resp.json()["version"] == 3


def test_changelog_no_op_skips(client: TestClient, universe_id: int):
    """Setting the same value should not create a changelog entry."""
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"name": "ChangelogTestChar"})

    resp = client.get(f"/api/v1/characters/{char['id']}/changelog")
    logs = resp.json()
    assert len(logs) == 0


def test_changelog_change_set_groups(client: TestClient, universe_id: int):
    """Multiple fields changed at once share a change_set_id."""
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={
        "name": "Multi1",
        "codename": "Multi2",
    })

    resp = client.get(f"/api/v1/characters/{char['id']}/changelog")
    logs = resp.json()
    assert len(logs) == 2
    assert logs[0]["change_set_id"] == logs[1]["change_set_id"]


def test_unlock_creates_changelog(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"status": "locked"})
    client.post(f"/api/v1/characters/{char['id']}/unlock")

    resp = client.get(f"/api/v1/characters/{char['id']}/changelog")
    logs = resp.json()
    status_logs = [entry for entry in logs if entry["field_changed"] == "status"]
    # Should have both lock and unlock entries
    assert len(status_logs) >= 2
