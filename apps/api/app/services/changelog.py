"""Changelog service — enforces lock policy and records field-level diffs."""

from __future__ import annotations

import uuid
from typing import Any

from sqlmodel import Session, SQLModel

from app.models._base import LOCK_EXEMPT_FIELDS, CanonStatus, utcnow
from app.models.changelog import ChangeLog


def apply_update_with_changelog(
    session: Session,
    entity: SQLModel,
    entity_type: str,
    update_data: dict[str, Any],
    *,
    source: str = "api",
    changed_by: str | None = None,
) -> list[ChangeLog]:
    """Apply an update to an entity and create ChangeLog entries for actual changes.

    If the entity is locked, only notes/tags can bypass the changelog.
    All other fields on locked entities are recorded in the changelog.

    Returns the list of ChangeLog entries created.
    """
    is_locked = getattr(entity, "status", None) == CanonStatus.LOCKED.value
    change_set_id = str(uuid.uuid4())
    version_before = getattr(entity, "version", 1)
    entries: list[ChangeLog] = []
    has_canon_changes = False

    for field, new_value in update_data.items():
        old_value = getattr(entity, field, None)

        # Skip no-op changes
        if old_value == new_value:
            continue

        # Track whether any canon-critical field changed
        if field not in LOCK_EXEMPT_FIELDS:
            has_canon_changes = True

        # Create changelog entry for all changes on locked entities,
        # or for canon-critical changes on any entity
        if is_locked or field not in LOCK_EXEMPT_FIELDS:
            entry = ChangeLog(
                universe_id=getattr(entity, "universe_id"),
                entity_type=entity_type,
                entity_id=getattr(entity, "id"),
                entity_canon_id=getattr(entity, "canon_id"),
                entity_version_before=version_before,
                entity_version_after=version_before + 1 if has_canon_changes else version_before,
                change_set_id=change_set_id,
                field_changed=field,
                old_value=old_value,
                new_value=new_value,
                change_source=source,
                changed_by=changed_by,
            )
            entries.append(entry)

        # Apply the change
        setattr(entity, field, new_value)

    # Bump version only if canon-critical fields changed
    if has_canon_changes:
        entity.version = version_before + 1  # type: ignore[attr-defined]

    entity.updated_at = utcnow()  # type: ignore[attr-defined]

    # Fix version_after on all entries now that we know the final version
    final_version = getattr(entity, "version")
    for entry in entries:
        entry.entity_version_after = final_version

    session.add(entity)
    for entry in entries:
        session.add(entry)

    return entries


def check_lock_allows_update(entity: SQLModel, update_data: dict[str, Any]) -> list[str]:
    """Check if a locked entity allows the requested update fields.

    Returns list of forbidden fields (empty = all allowed).
    """
    if getattr(entity, "status", None) != CanonStatus.LOCKED.value:
        return []

    forbidden = [
        field for field in update_data if field not in LOCK_EXEMPT_FIELDS
    ]
    return forbidden
