"""Ingest router for YAML uploads and source bootstrap."""

from __future__ import annotations

from typing import Any

import yaml
from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile
from sqlmodel import Session, SQLModel

from app.database import get_session
from app.services.ingest import bootstrap_source_directory, ingest_character_yaml

router = APIRouter(prefix="/api/v1/ingest", tags=["ingest"])


class BootstrapSourceRequest(SQLModel):
    source_root: str | None = None


@router.post("/character-yaml")
async def ingest_character_yaml_endpoint(
    *,
    session: Session = Depends(get_session),
    file: UploadFile,
    universe_id: int,
) -> dict[str, Any]:
    """Upload a character YAML file and ingest it into the database."""
    if not file.filename or not file.filename.endswith((".yaml", ".yml")):
        raise HTTPException(status_code=400, detail="File must be .yaml or .yml")

    content = await file.read()
    try:
        yaml_dict = yaml.safe_load(content)
    except yaml.YAMLError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {exc}")

    if not isinstance(yaml_dict, dict):
        raise HTTPException(status_code=400, detail="YAML must be a mapping (dict)")

    required = {"id", "name"}
    missing = required - set(yaml_dict.keys())
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required YAML keys: {missing}")

    return ingest_character_yaml(session, yaml_dict, universe_id)


@router.post("/bootstrap-source")
def bootstrap_source_endpoint(
    *,
    session: Session = Depends(get_session),
    universe_id: int,
    request: BootstrapSourceRequest | None = Body(default=None),
) -> dict[str, Any]:
    try:
        return bootstrap_source_directory(
            session,
            request.source_root if request else None,
            universe_id,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
