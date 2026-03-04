"""Tests for character CRUD + lock enforcement."""

from fastapi.testclient import TestClient


def _create_character(client: TestClient, universe_id: int, **overrides) -> dict:
    data = {
        "name": "TestChar",
        "canon_id": "C_TEST",
        "universe_id": universe_id,
        "codename": "TestCode",
        "faction": "heaven",
        "cast_tier": "main_cast",
        **overrides,
    }
    resp = client.post("/api/v1/characters/", json=data)
    assert resp.status_code == 201
    return resp.json()


def test_create_character(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    assert char["name"] == "TestChar"
    assert char["canon_id"] == "C_TEST"
    assert char["status"] == "draft"
    assert char["version"] == 1


def test_get_character(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    resp = client.get(f"/api/v1/characters/{char['id']}")
    assert resp.status_code == 200
    assert resp.json()["canon_id"] == "C_TEST"


def test_list_characters_filter_universe(client: TestClient, universe_id: int):
    _create_character(client, universe_id)
    resp = client.get(f"/api/v1/characters/?universe_id={universe_id}")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_update_character(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    resp = client.patch(f"/api/v1/characters/{char['id']}", json={"name": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated"


def test_delete_character(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    resp = client.delete(f"/api/v1/characters/{char['id']}")
    assert resp.status_code == 204
    resp = client.get(f"/api/v1/characters/{char['id']}")
    assert resp.status_code == 404


def test_lock_prevents_delete(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    # Lock the character
    client.patch(f"/api/v1/characters/{char['id']}", json={"status": "locked"})
    resp = client.delete(f"/api/v1/characters/{char['id']}")
    assert resp.status_code == 403


def test_lock_allows_notes_tags(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"status": "locked"})
    resp = client.patch(
        f"/api/v1/characters/{char['id']}",
        json={"notes": "Updated while locked", "tags": ["new_tag"]},
    )
    assert resp.status_code == 200
    assert resp.json()["notes"] == "Updated while locked"


def test_lock_changelog_on_canon_field(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"status": "locked"})
    # Modifying a canon field on locked entity goes through changelog
    resp = client.patch(
        f"/api/v1/characters/{char['id']}",
        json={"codename": "NewCode"},
    )
    assert resp.status_code == 200
    assert resp.json()["codename"] == "NewCode"
    # Check changelog
    resp = client.get(f"/api/v1/characters/{char['id']}/changelog")
    assert resp.status_code == 200
    logs = resp.json()
    codename_logs = [entry for entry in logs if entry["field_changed"] == "codename"]
    assert len(codename_logs) >= 1


def test_unlock_character(client: TestClient, universe_id: int):
    char = _create_character(client, universe_id)
    client.patch(f"/api/v1/characters/{char['id']}", json={"status": "locked"})
    resp = client.post(f"/api/v1/characters/{char['id']}/unlock")
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"


def test_character_with_json_blobs(client: TestClient, universe_id: int):
    char = _create_character(
        client,
        universe_id,
        identity={
            "codename": "HHK",
            "real_name": "Redacted",
            "aliases": ["Faultline"],
        },
        personality={
            "surface_read": "Quiet and intense",
            "core_wound": "Fear of being a weapon",
        },
    )
    assert char["identity"]["codename"] == "HHK"
    assert char["personality"]["core_wound"] == "Fear of being a weapon"


def test_character_404(client: TestClient):
    resp = client.get("/api/v1/characters/9999")
    assert resp.status_code == 404
