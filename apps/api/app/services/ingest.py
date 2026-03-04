"""Ingest services for YAML uploads and source-folder bootstrap."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

import yaml
from sqlmodel import Session, select

from app.models._base import CanonStatus, utcnow
from app.models.chapter import Chapter
from app.models.character import (
    ArcPhase,
    AssetReference,
    CanonRuleItem,
    Character,
    CoreIdentity,
    FormStage,
    Moveset,
    Personality,
    Quirks,
    SectionVersions,
    VisualSilhouette,
    Voice,
)
from app.models.episode import Episode
from app.models.relationship import Relationship
from app.services.changelog import apply_update_with_changelog

DEFAULT_SOURCE_ROOT = Path(r"D:\07_ANIME\01_PROJECTS\HHK_Universe")
TEXT_IMPORT_VERSION = 2
EPISODE_IMPORT_VERSION = 2
CHARACTER_CODE_RE = re.compile(r"^(C\d{3})(?:[_\s-]+(.+))?$", re.IGNORECASE)
SEASON_DIR_RE = re.compile(r"^\d{2}_SEASON_(?P<season>\d+)$", re.IGNORECASE)
CHAPTER_DIR_RE = re.compile(
    r"^CH(?:APTER|ATPER)\s+(?P<number>\d+)(?:\s*[—-]\s*(?P<title>.+))?$",
    re.IGNORECASE,
)
EPISODE_DIR_RE = re.compile(r"^(?P<code>S\d+E\d+)(?:[_\s-]+(?P<title>.*))?$", re.IGNORECASE)
EPISODE_CODE_RE = re.compile(r"^S(?P<season>\d+)E(?P<number>\d+)$", re.IGNORECASE)
SECTION_RE = re.compile(
    r"-{20,}\s*\n(?P<header>(?:\d+\.\s+)?[A-Z][A-Z0-9 /&()'_-]+)\s*\n-{20,}\s*\n(?P<body>.*?)(?=\n-{20,}\s*\n(?:\d+\.\s+)?[A-Z][A-Z0-9 /&()'_-]+\s*\n-{20,}\s*\n|\Z)",
    re.DOTALL,
)


def compute_source_hash(data: dict[str, Any]) -> str:
    """Canonical hash: dict -> sorted JSON -> SHA256."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _hash_text_bundle(files: dict[str, str], assets: list[str]) -> str:
    canonical = json.dumps(
        {"files": files, "assets": sorted(assets)},
        sort_keys=True,
        separators=(",", ":"),
    )
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return f"text:v{TEXT_IMPORT_VERSION}:{digest}"


# -- YAML ingest ---------------------------------------------------------------

_SUB_MODEL_MAP: dict[str, type] = {
    "identity": CoreIdentity,
    "visual": VisualSilhouette,
    "personality": Personality,
    "quirks": Quirks,
    "voice": Voice,
    "moveset": Moveset,
    "section_versions": SectionVersions,
}

_LIST_SUB_MODEL_MAP: dict[str, type] = {
    "forms": FormStage,
    "arc_phases": ArcPhase,
    "canon_rules": CanonRuleItem,
    "assets": AssetReference,
}


def _validate_and_dump(field: str, value: Any) -> Any:
    if value is None:
        return None

    if field in _SUB_MODEL_MAP:
        model = _SUB_MODEL_MAP[field]
        return model.model_validate(value).model_dump()

    if field in _LIST_SUB_MODEL_MAP:
        model = _LIST_SUB_MODEL_MAP[field]
        return [model.model_validate(item).model_dump() for item in value]

    return value


def _extract_character_data(yaml_dict: dict[str, Any]) -> dict[str, Any]:
    data: dict[str, Any] = {}

    data["name"] = yaml_dict["name"]
    data["canon_id"] = yaml_dict["id"]
    data["status"] = yaml_dict.get("status", CanonStatus.DRAFT.value)
    data["tags"] = yaml_dict.get("tags")
    data["codename"] = yaml_dict.get("identity", {}).get("codename")
    data["faction"] = yaml_dict.get("faction")
    data["cast_tier"] = yaml_dict.get("cast_tier")
    data["prompt_description"] = yaml_dict.get("prompt_description")
    data["themes"] = yaml_dict.get("themes")
    data["open_hooks"] = yaml_dict.get("open_hooks")

    for field in list(_SUB_MODEL_MAP) + list(_LIST_SUB_MODEL_MAP):
        raw = yaml_dict.get(field)
        if raw is not None:
            data[field] = _validate_and_dump(field, raw)

    return data


def _extract_relationships(yaml_dict: dict[str, Any]) -> list[dict[str, Any]]:
    raw_rels = yaml_dict.get("relationships", [])
    results = []
    for rel in raw_rels:
        results.append(
            {
                "target_canon_id": rel["target_id"],
                "relationship_type": rel["relationship_type"],
                "role": rel.get("role"),
                "dynamic": rel.get("dynamic"),
                "tension": rel.get("tension"),
                "their_view": rel.get("their_view"),
                "my_view": rel.get("my_view"),
                "key_beats": rel.get("key_beats", []),
                "open_hooks": rel.get("open_hooks", []),
            }
        )
    return results


def ingest_character_yaml(
    session: Session,
    yaml_dict: dict[str, Any],
    universe_id: int,
) -> dict[str, Any]:
    """Ingest a single character YAML dict into the database."""
    source_hash = compute_source_hash(yaml_dict)
    canon_id = yaml_dict["id"]

    existing = session.exec(
        select(Character)
        .where(Character.universe_id == universe_id)
        .where(Character.canon_id == canon_id)
    ).first()

    if existing and existing.source_hash == source_hash:
        return {
            "action": "skipped",
            "reason": "source_hash unchanged",
            "canon_id": canon_id,
            "character_id": existing.id,
            "relationships_created": 0,
        }

    char_data = _extract_character_data(yaml_dict)
    char_data["universe_id"] = universe_id
    char_data["source_hash"] = source_hash

    if existing:
        apply_update_with_changelog(session, existing, "character", char_data, source="ingest")
        session.commit()
        session.refresh(existing)
        character = existing
        action = "updated"
    else:
        character = Character(**char_data)
        session.add(character)
        session.commit()
        session.refresh(character)
        action = "created"

    rel_defs = _extract_relationships(yaml_dict)
    rels_created = 0

    for rel_def in rel_defs:
        target_canon_id = rel_def.pop("target_canon_id")
        target = session.exec(
            select(Character)
            .where(Character.universe_id == universe_id)
            .where(Character.canon_id == target_canon_id)
        ).first()

        if not target:
            continue

        existing_rel = session.exec(
            select(Relationship)
            .where(Relationship.source_character_id == character.id)
            .where(Relationship.target_character_id == target.id)
            .where(Relationship.relationship_type == rel_def["relationship_type"])
        ).first()

        if existing_rel:
            for key, val in rel_def.items():
                setattr(existing_rel, key, val)
            existing_rel.updated_at = utcnow()
            session.add(existing_rel)
        else:
            new_rel = Relationship(
                universe_id=universe_id,
                source_character_id=character.id,
                target_character_id=target.id,
                **rel_def,
            )
            session.add(new_rel)
            rels_created += 1

    session.commit()

    return {
        "action": action,
        "canon_id": canon_id,
        "character_id": character.id,
        "relationships_created": rels_created,
    }


# -- Text bootstrap -----------------------------------------------------------

def _clean_inline(value: str) -> str:
    return (
        value.replace("**", "")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("–", "-")
        .strip(" -")
    )


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore").replace("\r\n", "\n")


def _read_nonempty_text(path: Path | None) -> str | None:
    if path is None or not path.exists():
        return None

    text = _read_text_file(path).strip()
    return text or None


def _extract_title(text: str) -> str | None:
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if set(stripped) <= {"=", "-"}:
            continue
        return _clean_inline(stripped)
    return None


def _extract_labeled_block(text: str, *labels: str) -> str | None:
    normalized = text.splitlines()
    for index, line in enumerate(normalized):
        stripped = line.strip()
        for label in labels:
            if not re.match(rf"^-?\s*{re.escape(label)}\s*:", stripped, re.IGNORECASE):
                continue

            _, _, remainder = stripped.partition(":")
            collected: list[str] = []
            if remainder.strip():
                collected.append(_clean_inline(remainder))

            pointer = index + 1
            while pointer < len(normalized):
                candidate = normalized[pointer].rstrip()
                candidate_stripped = candidate.strip()
                if not candidate_stripped:
                    if collected:
                        break
                    pointer += 1
                    continue
                if (
                    re.match(r"^[A-Za-z][A-Za-z0-9 /&()'_-]+\s*:", candidate_stripped)
                    and not candidate.startswith("  ")
                    and not candidate_stripped.startswith("-")
                ):
                    break
                collected.append(_clean_inline(candidate_stripped))
                pointer += 1

            result = " ".join(part for part in collected if part)
            return result or None
    return None


def _parse_sections(text: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    for match in SECTION_RE.finditer(text):
        header = re.sub(r"^\d+\.\s*", "", match.group("header").strip()).upper()
        body = match.group("body").strip()
        if not body:
            continue
        existing = sections.get(header)
        sections[header] = f"{existing}\n\n{body}".strip() if existing else body
    return sections


def _match_section(sections: dict[str, str], *keywords: str) -> str | None:
    chunks = [
        body
        for header, body in sections.items()
        if any(keyword in header for keyword in keywords)
    ]
    if not chunks:
        return None
    return "\n\n".join(chunks).strip()


def _humanize_title(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = _normalize_whitespace(value.replace("_", " "))
    if not normalized:
        return None
    if normalized.upper() == normalized:
        return normalized.title()
    return normalized


def _split_listish(value: str | None) -> list[str] | None:
    if not value:
        return None

    parts = [
        _normalize_whitespace(part)
        for part in re.split(r"\s*[,\n;]\s*", value)
        if _normalize_whitespace(part)
    ]
    return parts or None


def _infer_faction(alignment: str | None, all_text: str) -> str:
    corpus = (alignment or all_text).lower()
    if "heaven-only" in corpus or "0% hell" in corpus or "pure heaven" in corpus:
        return "heaven"
    if "hell-only" in corpus or "0% heaven" in corpus or "pure hell" in corpus:
        return "hell"
    has_heaven = "heaven" in corpus
    has_hell = "hell" in corpus
    if has_heaven and has_hell:
        return "hybrid"
    if has_heaven:
        return "heaven"
    if has_hell:
        return "hell"
    return "neutral"


def _infer_name(bundle_root: Path, preferred_text: str) -> str:
    title = _extract_title(preferred_text)
    if title:
        cleaned = re.sub(r"^C\d{3}[_ ]*", "", title)
        cleaned = re.sub(r"\s*-\s*(CANONCARD|DOSSIER).*$", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+\(v\d+\)$", "", cleaned, flags=re.IGNORECASE)
        cleaned = cleaned.replace("_", " ").strip()
        if cleaned:
            return cleaned

    match = CHARACTER_CODE_RE.match(bundle_root.name)
    if match and match.group(2):
        return match.group(2).replace("_", " ").strip()

    return bundle_root.name.replace("_", " ").strip()


def _build_text_character_payload(bundle_root: Path) -> dict[str, Any] | None:
    text_files = sorted(bundle_root.rglob("*.txt"))
    if not text_files:
        return None

    file_map = {
        str(path.relative_to(bundle_root)).replace("\\", "/"): _read_text_file(path)
        for path in text_files
    }
    all_text = "\n\n".join(file_map.values())

    preferred_name = next((name for name in file_map if "CANONCARD" in name.upper()), None)
    preferred_name = preferred_name or next(
        (name for name in file_map if "DOSSIER" in name.upper()),
        None,
    )
    preferred_text = file_map.get(preferred_name, all_text)

    canon_id = _extract_labeled_block(preferred_text, "Code") or bundle_root.name
    canon_id = canon_id.replace("  ", " ").strip()
    name = _infer_name(bundle_root, preferred_text)
    codename = (
        _extract_labeled_block(all_text, "Street name")
        or _extract_labeled_block(all_text, "Aliases")
        or _extract_labeled_block(all_text, "Codename")
    )
    role = _extract_labeled_block(all_text, "Role")
    alignment = (
        _extract_labeled_block(all_text, "Aether Alignment")
        or _extract_labeled_block(all_text, "Alignment")
        or _extract_labeled_block(all_text, "Aetherial mix")
    )
    logline = (
        _extract_labeled_block(all_text, "Core logline")
        or _extract_labeled_block(all_text, "One-line archetype")
        or _extract_labeled_block(all_text, "Essence")
    )
    theme_question = _extract_labeled_block(all_text, "Core theme question")

    sections: dict[str, str] = {}
    for text in file_map.values():
        sections.update(_parse_sections(text))

    identity_text = _match_section(sections, "CORE IDENTITY")
    visual_text = _match_section(sections, "VISUAL", "LOOK & VIBE", "VISUAL PROFILE")
    personality_text = _match_section(sections, "PERSONALITY", "VOICE")
    moveset_text = _match_section(
        sections,
        "MOVESET",
        "POWER MAP",
        "AETHER SIGNATURE",
        "AETHER & MOVE",
        "FORM LADDER",
    )
    relationship_text = _match_section(sections, "RELATIONSHIP")
    timeline_text = _match_section(sections, "TIMELINE")

    asset_files = [
        str(path.relative_to(bundle_root)).replace("\\", "/")
        for path in sorted(bundle_root.rglob("*"))
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    ]

    payload = {
        "name": name,
        "canon_id": canon_id,
        "codename": codename,
        "faction": _infer_faction(alignment, all_text),
        "cast_tier": "main_cast" if "00_MAIN_CAST" in str(bundle_root) else "supporting",
        "status": CanonStatus.REVIEW.value,
        "tags": ["bootstrap", "text-import"],
        "prompt_description": logline or role or theme_question or name,
        "themes": [theme_question] if theme_question else None,
        "identity": {
            "alignment": alignment,
            "role": role,
            "theme_question": theme_question,
            "summary": identity_text,
        }
        if any([alignment, role, theme_question, identity_text])
        else None,
        "visual": {"summary": visual_text} if visual_text else None,
        "personality": {"summary": personality_text} if personality_text else None,
        "moveset": {"summary": moveset_text} if moveset_text else None,
        "notes": "\n\n".join(
            part
            for part in [
                f"Bootstrapped from source folder: {bundle_root}",
                relationship_text,
                timeline_text,
            ]
            if part
        ),
        "assets": asset_files or None,
        "source_hash": _hash_text_bundle(file_map, asset_files),
    }
    return payload


def _season_roots(source_root: Path) -> list[Path]:
    return sorted(
        [path for path in source_root.rglob("*") if path.is_dir() and SEASON_DIR_RE.match(path.name)],
        key=lambda path: int(SEASON_DIR_RE.match(path.name).group("season")),  # type: ignore[union-attr]
    )


def _chapter_metadata(chapter_root: Path) -> tuple[int, str] | None:
    match = CHAPTER_DIR_RE.match(chapter_root.name)
    if not match:
        return None

    chapter_number = int(match.group("number"))
    chapter_title = _humanize_title(match.group("title")) or f"Chapter {chapter_number}"
    return chapter_number, chapter_title


def _episode_dir_roots(chapter_root: Path) -> list[Path]:
    episode_dirs = []
    for path in chapter_root.iterdir():
        if not path.is_dir():
            continue
        if EPISODE_DIR_RE.match(path.name):
            episode_dirs.append(path)

    return sorted(episode_dirs, key=lambda path: _episode_sort_key_from_name(path.name))


def _episode_sort_key_from_name(name: str) -> tuple[int, int, str]:
    match = EPISODE_DIR_RE.match(name)
    if not match:
        return 999, 999, name
    return _episode_sort_key(match.group("code"))


def _episode_sort_key(code: str) -> tuple[int, int, str]:
    match = EPISODE_CODE_RE.match(code)
    if not match:
        return 999, 999, code
    return int(match.group("season")), int(match.group("number")), code


def _select_matching_file(bundle_root: Path, patterns: list[str], *, pick_last: bool = False) -> Path | None:
    for pattern in patterns:
        matches = sorted(bundle_root.rglob(pattern))
        if matches:
            return matches[-1] if pick_last else matches[0]
    return None


def _hash_file_bundle(bundle_root: Path) -> str:
    manifest: dict[str, dict[str, Any]] = {}
    for path in sorted(candidate for candidate in bundle_root.rglob("*") if candidate.is_file()):
        relative = str(path.relative_to(bundle_root)).replace("\\", "/")
        payload = path.read_bytes()
        manifest[relative] = {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        }

    canonical = json.dumps(manifest, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return f"bundle:v{EPISODE_IMPORT_VERSION}:{digest}"


def _parse_label_map(text: str | None) -> dict[str, str]:
    if not text:
        return {}

    fields: dict[str, str] = {}
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or ":" not in stripped:
            continue
        key, _, value = stripped.partition(":")
        cleaned_value = _clean_inline(value)
        if cleaned_value:
            fields[_normalize_whitespace(key).lower()] = cleaned_value
    return fields


def _episode_status(meta_fields: dict[str, str], script_path: Path | None) -> CanonStatus:
    status_raw = meta_fields.get("canon status", "").lower()
    if "deprecated" in status_raw:
        return CanonStatus.DEPRECATED
    if "experiment" in status_raw:
        return CanonStatus.EXPERIMENT
    if "locked" in status_raw:
        return CanonStatus.LOCKED
    if "draft" in status_raw:
        return CanonStatus.DRAFT
    if "review" in status_raw:
        return CanonStatus.REVIEW
    if script_path is not None and script_path.suffix.lower() == ".docx":
        return CanonStatus.REVIEW
    return CanonStatus.DRAFT


def _join_nonempty(parts: list[str | None], *, separator: str = " ") -> str | None:
    cleaned = [_normalize_whitespace(part) for part in parts if part and _normalize_whitespace(part)]
    if not cleaned:
        return None
    return separator.join(cleaned)


def _build_chapter_payload(chapter_root: Path, season_number: int) -> dict[str, Any] | None:
    chapter_meta = _chapter_metadata(chapter_root)
    if chapter_meta is None:
        return None

    chapter_number, chapter_title = chapter_meta
    episode_codes = [
        EPISODE_DIR_RE.match(episode_root.name).group("code").upper()
        for episode_root in _episode_dir_roots(chapter_root)
        if EPISODE_DIR_RE.match(episode_root.name)
    ]
    if not episode_codes:
        return None

    episode_range = episode_codes[0]
    if len(episode_codes) > 1:
        episode_range = f"{episode_codes[0]}-{episode_codes[-1]}"

    source_hash = compute_source_hash(
        {
            "season": season_number,
            "chapter_number": chapter_number,
            "chapter_title": chapter_title,
            "episode_codes": episode_codes,
        }
    )

    return {
        "name": chapter_title,
        "canon_id": f"S{season_number}CH{chapter_number:02d}",
        "season": season_number,
        "chapter_number": chapter_number,
        "status": CanonStatus.REVIEW.value,
        "episode_range": episode_range,
        "premise": f"Bootstrapped from chapter folder: {chapter_title}",
        "tags": ["bootstrap", "source-import", f"season-{season_number}"],
        "notes": "\n".join(
            [
                f"Source folder: {chapter_root}",
                f"Episode packs: {', '.join(episode_codes)}",
            ]
        ),
        "source_hash": f"chapter:v1:{source_hash}",
    }


def ingest_chapter_directory(
    session: Session,
    chapter_root: Path,
    universe_id: int,
    season_number: int,
) -> dict[str, Any]:
    payload = _build_chapter_payload(chapter_root, season_number)
    if payload is None:
        return {"action": "skipped", "reason": "no episode packs", "canon_id": chapter_root.name}

    canon_id = payload["canon_id"]
    source_hash = payload["source_hash"]
    existing = session.exec(
        select(Chapter)
        .where(Chapter.universe_id == universe_id)
        .where(Chapter.canon_id == canon_id)
    ).first()

    if existing and existing.source_hash == source_hash:
        return {
            "action": "skipped",
            "reason": "chapter unchanged",
            "canon_id": canon_id,
            "chapter_id": existing.id,
        }

    payload["universe_id"] = universe_id
    if existing:
        apply_update_with_changelog(session, existing, "chapter", payload, source="ingest")
        session.commit()
        session.refresh(existing)
        return {"action": "updated", "canon_id": canon_id, "chapter_id": existing.id}

    chapter = Chapter(**payload)
    session.add(chapter)
    session.commit()
    session.refresh(chapter)
    return {"action": "created", "canon_id": canon_id, "chapter_id": chapter.id}


def _build_episode_payload(
    episode_root: Path,
    universe_id: int,
    season_number: int,
    chapter_id: int,
    chapter_number: int,
) -> dict[str, Any] | None:
    match = EPISODE_DIR_RE.match(episode_root.name)
    if not match:
        return None

    episode_code = match.group("code").upper()
    season_from_code, episode_number, _ = _episode_sort_key(episode_code)
    season_value = season_from_code if season_from_code != 999 else season_number

    meta_path = _select_matching_file(episode_root, [f"{episode_code}_META.txt", "*_META.txt"])
    beats_path = _select_matching_file(
        episode_root,
        [f"{episode_code}_BEATS*.txt", "*_BEATS*.txt"],
    )
    scenelist_path = _select_matching_file(
        episode_root,
        [f"{episode_code}_SCENELIST*.txt", "*_SCENELIST*.txt"],
    )
    script_path = _select_matching_file(
        episode_root,
        [f"{episode_code}_SCRIPT_CANON*.docx", "*Final Script*.docx", "*.docx"],
    ) or _select_matching_file(
        episode_root,
        [f"{episode_code}_Script_v*.txt", f"{episode_code}_SCRIPT_v*.txt", f"{episode_code}_Script*.txt"],
        pick_last=True,
    )
    continuity_path = _select_matching_file(
        episode_root,
        [f"{episode_code}_CONTINUITY_CHECK.txt", "*_CONTINUITY_CHECK.txt"],
    )
    settings_path = _select_matching_file(episode_root, [f"{episode_code}_Settings.txt", "*_Settings.txt"])
    decisions_path = _select_matching_file(episode_root, [f"{episode_code}_DECISIONS.txt", "*_DECISIONS.txt"])
    todo_path = _select_matching_file(episode_root, [f"{episode_code}_TODO.txt", "*_TODO.txt"])

    meta_text = _read_nonempty_text(meta_path)
    beats_text = _read_nonempty_text(beats_path)
    scenelist_text = _read_nonempty_text(scenelist_path)
    continuity_text = _read_nonempty_text(continuity_path)
    settings_text = _read_nonempty_text(settings_path)
    decisions_text = _read_nonempty_text(decisions_path)
    todo_text = _read_nonempty_text(todo_path)

    meta_fields = _parse_label_map(meta_text)
    episode_name = (
        _humanize_title(meta_fields.get("title"))
        or _humanize_title(match.group("title"))
        or episode_code
    )
    status = _episode_status(meta_fields, script_path)
    source_hash = _hash_file_bundle(episode_root)

    hook = meta_fields.get("hook")
    inciting = meta_fields.get("inciting")
    reveals = meta_fields.get("key reveals")
    follow_through = meta_fields.get("follow-through into next ep")
    continuity_anchors = _split_listish(meta_fields.get("continuity anchors"))
    featured_characters = _split_listish(meta_fields.get("core characters"))

    notes_blocks = [
        f"Source pack: {episode_root}",
        f"Locations: {meta_fields['locations']}" if meta_fields.get("locations") else None,
        f"Props: {meta_fields['props']}" if meta_fields.get("props") else None,
        f"Continuity check:\n{continuity_text}" if continuity_text else None,
        f"Settings:\n{settings_text}" if settings_text else None,
        f"Decisions:\n{decisions_text}" if decisions_text else None,
        f"Todo:\n{todo_text}" if todo_text else None,
    ]

    payload: dict[str, Any] = {
        "name": episode_name,
        "canon_id": episode_code,
        "universe_id": universe_id,
        "season": season_value,
        "number": episode_number if episode_number != 999 else 0,
        "chapter_id": chapter_id,
        "status": status.value,
        "script_locked": bool(script_path and script_path.suffix.lower() == ".docx"),
        "meta_text": meta_text,
        "beats_text": beats_text,
        "scenelist_text": scenelist_text,
        "script_path": str(script_path) if script_path else None,
        "logline": _join_nonempty([reveals, inciting, hook], separator=" | "),
        "synopsis": _join_nonempty([hook, inciting, reveals, follow_through]),
        "featured_characters": featured_characters,
        "threads_introduced": [inciting] if inciting else None,
        "threads_advanced": [follow_through] if follow_through else None,
        "continuity_anchors": continuity_anchors,
        "cliffhanger": meta_fields.get("tag") or follow_through,
        "cinema_crack_moment": hook,
        "animation_notes": settings_text,
        "tags": [
            "bootstrap",
            "source-import",
            f"season-{season_value}",
            f"chapter-{chapter_number}",
        ],
        "notes": "\n\n".join(block for block in notes_blocks if block),
        "source_hash": source_hash,
    }
    if status == CanonStatus.LOCKED:
        payload["locked_at"] = utcnow()
        payload["locked_by"] = "bootstrap"

    return payload


def ingest_episode_directory(
    session: Session,
    episode_root: Path,
    universe_id: int,
    season_number: int,
    chapter_id: int,
    chapter_number: int,
) -> dict[str, Any]:
    payload = _build_episode_payload(
        episode_root,
        universe_id,
        season_number,
        chapter_id,
        chapter_number,
    )
    if payload is None:
        return {"action": "skipped", "reason": "invalid episode directory", "canon_id": episode_root.name}

    canon_id = payload["canon_id"]
    source_hash = payload["source_hash"]
    existing = session.exec(
        select(Episode)
        .where(Episode.universe_id == universe_id)
        .where(Episode.canon_id == canon_id)
    ).first()

    if existing and existing.source_hash == source_hash:
        return {
            "action": "skipped",
            "reason": "episode pack unchanged",
            "canon_id": canon_id,
            "episode_id": existing.id,
        }

    if existing:
        apply_update_with_changelog(session, existing, "episode", payload, source="ingest")
        session.commit()
        session.refresh(existing)
        return {"action": "updated", "canon_id": canon_id, "episode_id": existing.id}

    episode = Episode(**payload)
    session.add(episode)
    session.commit()
    session.refresh(episode)
    return {"action": "created", "canon_id": canon_id, "episode_id": episode.id}


def bootstrap_season_directory(
    session: Session,
    season_root: Path,
    universe_id: int,
) -> dict[str, Any]:
    season_match = SEASON_DIR_RE.match(season_root.name)
    if not season_match:
        return {
            "season_root": str(season_root),
            "chapter_roots_processed": 0,
            "chapters_imported": 0,
            "chapters_skipped": 0,
            "episode_packs_processed": 0,
            "episodes_imported": 0,
            "episodes_skipped": 0,
            "errors": [f"{season_root}: invalid season directory"],
        }

    season_number = int(season_match.group("season"))
    summary = {
        "season_root": str(season_root),
        "chapter_roots_processed": 0,
        "chapters_imported": 0,
        "chapters_skipped": 0,
        "episode_packs_processed": 0,
        "episodes_imported": 0,
        "episodes_skipped": 0,
        "errors": [],
    }

    for chapter_root in sorted(season_root.iterdir(), key=lambda path: path.name):
        if not chapter_root.is_dir():
            continue

        chapter_meta = _chapter_metadata(chapter_root)
        if chapter_meta is None:
            continue

        chapter_number, _ = chapter_meta
        summary["chapter_roots_processed"] += 1
        try:
            chapter_result = ingest_chapter_directory(session, chapter_root, universe_id, season_number)
            if chapter_result["action"] == "skipped":
                summary["chapters_skipped"] += 1
            else:
                summary["chapters_imported"] += 1

            chapter_id = chapter_result.get("chapter_id")
            if chapter_id is None:
                continue

            for episode_root in _episode_dir_roots(chapter_root):
                summary["episode_packs_processed"] += 1
                episode_result = ingest_episode_directory(
                    session,
                    episode_root,
                    universe_id,
                    season_number,
                    chapter_id,
                    chapter_number,
                )
                if episode_result["action"] == "skipped":
                    summary["episodes_skipped"] += 1
                else:
                    summary["episodes_imported"] += 1
        except Exception as exc:  # noqa: BLE001
            summary["errors"].append(f"{chapter_root}: {exc}")

    return summary


def _text_bundle_roots(source_root: Path) -> list[Path]:
    roots: dict[str, Path] = {}
    for path in source_root.rglob("*"):
        if not path.is_dir():
            continue
        match = CHARACTER_CODE_RE.match(path.name)
        if not match:
            continue
        if not any(path.rglob("*.txt")):
            continue

        canon_prefix = match.group(1)
        current = roots.get(canon_prefix)
        if current is None or len(path.parts) < len(current.parts):
            roots[canon_prefix] = path

    return [roots[key] for key in sorted(roots)]


def ingest_character_text_bundle(
    session: Session,
    bundle_root: Path,
    universe_id: int,
) -> dict[str, Any]:
    payload = _build_text_character_payload(bundle_root)
    if payload is None:
        return {"action": "skipped", "reason": "no text files", "canon_id": bundle_root.name}

    canon_id = payload["canon_id"]
    source_hash = payload.pop("source_hash")

    existing = session.exec(
        select(Character)
        .where(Character.universe_id == universe_id)
        .where(Character.canon_id == canon_id)
    ).first()

    if existing and existing.source_hash == source_hash:
        return {
            "action": "skipped",
            "reason": "text bundle unchanged",
            "canon_id": canon_id,
            "character_id": existing.id,
        }

    if existing:
        is_text_bootstrap = isinstance(existing.source_hash, str) and existing.source_hash.startswith("text:")
        update_data: dict[str, Any] = {}
        for field, value in payload.items():
            if value in (None, "", [], {}):
                continue

            current = getattr(existing, field, None)
            if field == "tags":
                merged = sorted({*(current or []), *(value or [])})
                if merged != (current or []):
                    update_data[field] = merged
                continue

            if field == "assets":
                if is_text_bootstrap and current != value:
                    update_data[field] = value
                elif not current:
                    update_data[field] = value
                continue

            if is_text_bootstrap:
                if current != value:
                    update_data[field] = value
            elif current in (None, "", [], {}):
                update_data[field] = value

        if update_data:
            if is_text_bootstrap:
                update_data["source_hash"] = source_hash
            apply_update_with_changelog(session, existing, "character", update_data, source="ingest")
            session.commit()
            session.refresh(existing)
            return {
                "action": "updated",
                "reason": "enriched from text bundle",
                "canon_id": canon_id,
                "character_id": existing.id,
            }

        return {
            "action": "skipped",
            "reason": "existing character already richer",
            "canon_id": canon_id,
            "character_id": existing.id,
        }

    character = Character(
        universe_id=universe_id,
        source_hash=source_hash,
        **payload,
    )
    session.add(character)
    session.commit()
    session.refresh(character)
    return {
        "action": "created",
        "canon_id": canon_id,
        "character_id": character.id,
    }


def bootstrap_source_directory(
    session: Session,
    source_root: str | None,
    universe_id: int,
) -> dict[str, Any]:
    root = Path(source_root) if source_root else DEFAULT_SOURCE_ROOT
    if not root.exists():
        raise FileNotFoundError(f"Source root not found: {root}")

    summary: dict[str, Any] = {
        "source_root": str(root),
        "yaml_processed": 0,
        "yaml_imported": 0,
        "yaml_skipped": 0,
        "season_roots_processed": 0,
        "chapter_roots_processed": 0,
        "chapters_imported": 0,
        "chapters_skipped": 0,
        "episode_packs_processed": 0,
        "episodes_imported": 0,
        "episodes_skipped": 0,
        "text_bundles_processed": 0,
        "text_imported": 0,
        "text_skipped": 0,
        "errors": [],
    }

    for yaml_path in sorted(root.rglob("*.yaml")) + sorted(root.rglob("*.yml")):
        summary["yaml_processed"] += 1
        try:
            yaml_dict = yaml.safe_load(_read_text_file(yaml_path))
            if not isinstance(yaml_dict, dict):
                summary["errors"].append(f"{yaml_path}: YAML is not a mapping")
                continue
            if not {"id", "name"} <= set(yaml_dict.keys()):
                summary["errors"].append(f"{yaml_path}: missing required keys id/name")
                continue
            result = ingest_character_yaml(session, yaml_dict, universe_id)
            if result["action"] == "skipped":
                summary["yaml_skipped"] += 1
            else:
                summary["yaml_imported"] += 1
        except Exception as exc:  # noqa: BLE001
            summary["errors"].append(f"{yaml_path}: {exc}")

    for season_root in _season_roots(root):
        summary["season_roots_processed"] += 1
        try:
            season_summary = bootstrap_season_directory(session, season_root, universe_id)
            summary["chapter_roots_processed"] += season_summary["chapter_roots_processed"]
            summary["chapters_imported"] += season_summary["chapters_imported"]
            summary["chapters_skipped"] += season_summary["chapters_skipped"]
            summary["episode_packs_processed"] += season_summary["episode_packs_processed"]
            summary["episodes_imported"] += season_summary["episodes_imported"]
            summary["episodes_skipped"] += season_summary["episodes_skipped"]
            summary["errors"].extend(season_summary["errors"])
        except Exception as exc:  # noqa: BLE001
            summary["errors"].append(f"{season_root}: {exc}")

    for bundle_root in _text_bundle_roots(root):
        summary["text_bundles_processed"] += 1
        try:
            result = ingest_character_text_bundle(session, bundle_root, universe_id)
            if result["action"] == "skipped":
                summary["text_skipped"] += 1
            else:
                summary["text_imported"] += 1
        except Exception as exc:  # noqa: BLE001
            summary["errors"].append(f"{bundle_root}: {exc}")

    return summary
