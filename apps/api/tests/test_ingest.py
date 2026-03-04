"""Tests for YAML character ingest — idempotent + no-op + relationship creation."""

import io

import yaml
from fastapi.testclient import TestClient

SAMPLE_YAML = {
    "id": "C001",
    "name": "HeavenHellKid",
    "status": "locked",
    "tags": ["protagonist", "hybrid"],
    "identity": {
        "codename": "HeavenHellKid",
        "real_name": "[REDACTED]",
        "aliases": ["HHK", "Faultline"],
        "role": "Gen-2 primary protagonist",
    },
    "visual": {
        "age_range": "Late teen",
        "build": "Lean, wiry",
        "hair_color": "Split white/black",
        "eye_color": "One gold, one red",
    },
    "personality": {
        "surface_read": "Quiet, intense",
        "core_wound": "Fear of being a weapon",
    },
    "themes": ["Control vs indulgence"],
    "faction": "hybrid",
    "cast_tier": "main_cast",
    "prompt_description": "Young Japanese male, late teens.",
    "moveset": {
        "alignment_source": "Hybrid",
        "core_moves": [
            {"name": "Gravity Crush", "visual": "Gravity spike"},
        ],
    },
    "forms": [
        {"stage": 0, "name": "Baseline", "power_ratio": "90/10"},
    ],
    "canon_rules": [
        {"rule": "Both sides leave fingerprints", "severity": "absolute"},
    ],
    "open_hooks": ["Lock codename"],
    "relationships": [],
}


def _upload_yaml(client: TestClient, universe_id: int, yaml_dict: dict) -> dict:
    content = yaml.dump(yaml_dict, default_flow_style=False).encode()
    file = io.BytesIO(content)
    resp = client.post(
        f"/api/v1/ingest/character-yaml?universe_id={universe_id}",
        files={"file": ("test.yaml", file, "application/x-yaml")},
    )
    return resp.json(), resp.status_code


def test_ingest_creates_character(client: TestClient, universe_id: int):
    data, status = _upload_yaml(client, universe_id, SAMPLE_YAML)
    assert status == 200
    assert data["action"] == "created"
    assert data["canon_id"] == "C001"

    # Verify character exists
    resp = client.get(f"/api/v1/characters/{data['character_id']}")
    assert resp.status_code == 200
    char = resp.json()
    assert char["name"] == "HeavenHellKid"
    assert char["faction"] == "hybrid"
    assert char["identity"]["codename"] == "HeavenHellKid"


def test_ingest_idempotent_noop(client: TestClient, universe_id: int):
    """Re-uploading identical YAML should be a no-op."""
    _upload_yaml(client, universe_id, SAMPLE_YAML)
    data, status = _upload_yaml(client, universe_id, SAMPLE_YAML)
    assert status == 200
    assert data["action"] == "skipped"
    assert data["reason"] == "source_hash unchanged"


def test_ingest_updates_on_change(client: TestClient, universe_id: int):
    _upload_yaml(client, universe_id, SAMPLE_YAML)

    modified = {**SAMPLE_YAML, "name": "HHK Updated"}
    data, status = _upload_yaml(client, universe_id, modified)
    assert status == 200
    assert data["action"] == "updated"

    resp = client.get(f"/api/v1/characters/{data['character_id']}")
    assert resp.json()["name"] == "HHK Updated"


def test_ingest_creates_relationships(client: TestClient, universe_id: int):
    """Relationships should be created when both characters exist."""
    # First create the target character
    client.post("/api/v1/characters/", json={
        "name": "Hikari",
        "canon_id": "C004",
        "universe_id": universe_id,
    })

    yaml_with_rels = {
        **SAMPLE_YAML,
        "relationships": [
            {
                "target_id": "C004",
                "target_name": "Hikari",
                "relationship_type": "romantic",
                "role": "Partner",
                "dynamic": "Nuclear boy × dead angel",
                "tension": "Scar incident",
                "their_view": "Chose him despite darkness",
                "my_view": "Walking omen",
                "key_beats": ["Rooftop reunion"],
                "open_hooks": ["Final fate"],
            },
        ],
    }

    data, status = _upload_yaml(client, universe_id, yaml_with_rels)
    assert status == 200
    assert data["relationships_created"] == 1

    # Verify relationship exists
    resp = client.get(f"/api/v1/characters/{data['character_id']}/relationships")
    rels = resp.json()
    assert len(rels) == 1
    assert rels[0]["relationship_type"] == "romantic"


def test_ingest_skips_missing_target(client: TestClient, universe_id: int):
    """Relationships to non-existent targets should be silently skipped."""
    yaml_with_missing = {
        **SAMPLE_YAML,
        "relationships": [
            {
                "target_id": "C_NONEXISTENT",
                "target_name": "Nobody",
                "relationship_type": "ally",
            },
        ],
    }
    data, status = _upload_yaml(client, universe_id, yaml_with_missing)
    assert status == 200
    assert data["relationships_created"] == 0


def test_ingest_rejects_invalid_file(client: TestClient, universe_id: int):
    resp = client.post(
        f"/api/v1/ingest/character-yaml?universe_id={universe_id}",
        files={"file": ("test.txt", b"not yaml", "text/plain")},
    )
    assert resp.status_code == 400
