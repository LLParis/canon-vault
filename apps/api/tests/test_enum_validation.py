"""Tests for API-boundary enum validation."""

from fastapi.testclient import TestClient


def _create_character(client: TestClient, universe_id: int, canon_id: str) -> dict:
    resp = client.post(
        "/api/v1/characters/",
        json={"name": canon_id, "canon_id": canon_id, "universe_id": universe_id},
    )
    assert resp.status_code == 201
    return resp.json()


def test_invalid_character_status_rejected(client: TestClient, universe_id: int):
    resp = client.post(
        "/api/v1/characters/",
        json={
            "name": "Invalid Status Character",
            "canon_id": "C_INVALID_STATUS",
            "universe_id": universe_id,
            "status": "banana",
        },
    )
    assert resp.status_code == 422


def test_invalid_relationship_type_rejected(client: TestClient, universe_id: int):
    source = _create_character(client, universe_id, "C_REL_SOURCE")
    target = _create_character(client, universe_id, "C_REL_TARGET")

    resp = client.post(
        "/api/v1/relationships/",
        json={
            "universe_id": universe_id,
            "source_character_id": source["id"],
            "target_character_id": target["id"],
            "relationship_type": "nemesis",
        },
    )
    assert resp.status_code == 422


def test_invalid_prompt_engine_rejected(client: TestClient, universe_id: int):
    resp = client.post(
        "/api/v1/prompt-templates/",
        json={
            "name": "Invalid Engine Template",
            "canon_id": "PT_INVALID_ENGINE",
            "universe_id": universe_id,
            "engine": "midjourney",
            "template": "{{character.name}}",
        },
    )
    assert resp.status_code == 422


def test_locked_prompt_template_status_rejected(client: TestClient, universe_id: int):
    resp = client.post(
        "/api/v1/prompt-templates/",
        json={
            "name": "Invalid Prompt Status",
            "canon_id": "PT_INVALID_STATUS",
            "universe_id": universe_id,
            "engine": "sdxl",
            "status": "locked",
            "template": "{{character.name}}",
        },
    )
    assert resp.status_code == 422
