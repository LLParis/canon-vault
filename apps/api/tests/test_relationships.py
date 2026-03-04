"""Tests for relationship CRUD."""

from fastapi.testclient import TestClient


def _create_characters(client: TestClient, universe_id: int) -> tuple[int, int]:
    """Create two characters and return their IDs."""
    c1 = client.post("/api/v1/characters/", json={
        "name": "Char A",
        "canon_id": "C_A",
        "universe_id": universe_id,
    })
    c2 = client.post("/api/v1/characters/", json={
        "name": "Char B",
        "canon_id": "C_B",
        "universe_id": universe_id,
    })
    return c1.json()["id"], c2.json()["id"]


def test_create_relationship(client: TestClient, universe_id: int):
    c1, c2 = _create_characters(client, universe_id)
    resp = client.post("/api/v1/relationships/", json={
        "universe_id": universe_id,
        "source_character_id": c1,
        "target_character_id": c2,
        "relationship_type": "rival",
        "role": "Sparring partner",
        "dynamic": "Competitive equals",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["relationship_type"] == "rival"
    assert data["role"] == "Sparring partner"


def test_list_relationships_by_character(client: TestClient, universe_id: int):
    c1, c2 = _create_characters(client, universe_id)
    client.post("/api/v1/relationships/", json={
        "universe_id": universe_id,
        "source_character_id": c1,
        "target_character_id": c2,
        "relationship_type": "ally",
    })
    # Filter by character_id should find relationships where char is source OR target
    resp = client.get(f"/api/v1/relationships/?character_id={c2}")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_character_relationships(client: TestClient, universe_id: int):
    c1, c2 = _create_characters(client, universe_id)
    client.post("/api/v1/relationships/", json={
        "universe_id": universe_id,
        "source_character_id": c1,
        "target_character_id": c2,
        "relationship_type": "enemy",
    })
    resp = client.get(f"/api/v1/characters/{c1}/relationships")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_update_relationship(client: TestClient, universe_id: int):
    c1, c2 = _create_characters(client, universe_id)
    resp = client.post("/api/v1/relationships/", json={
        "universe_id": universe_id,
        "source_character_id": c1,
        "target_character_id": c2,
        "relationship_type": "romantic",
    })
    rel_id = resp.json()["id"]
    resp = client.patch(f"/api/v1/relationships/{rel_id}", json={
        "dynamic": "Partners",
        "tension": "Past trauma",
    })
    assert resp.status_code == 200
    assert resp.json()["dynamic"] == "Partners"


def test_delete_relationship(client: TestClient, universe_id: int):
    c1, c2 = _create_characters(client, universe_id)
    resp = client.post("/api/v1/relationships/", json={
        "universe_id": universe_id,
        "source_character_id": c1,
        "target_character_id": c2,
        "relationship_type": "family",
    })
    rel_id = resp.json()["id"]
    resp = client.delete(f"/api/v1/relationships/{rel_id}")
    assert resp.status_code == 204
