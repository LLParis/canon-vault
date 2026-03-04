from pathlib import Path

from sqlmodel import select

from app.models.chapter import Chapter
from app.models.episode import Episode
from app.services.ingest import bootstrap_source_directory


def _write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _write_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def test_source_bootstrap_imports_chapters_and_episodes(session, universe_id, tmp_path: Path):
    episode_root = (
        tmp_path
        / "04_SEASON_1"
        / "CHAPTER 1 — TEST ARC"
        / "S1E01_Test_Opening"
    )
    _write_text(
        episode_root / "00_ADMIN" / "S1E01_META.txt",
        "\n".join(
            [
                "Episode: S1E01",
                "Title: Pilot Dawn",
                "Canon status: LOCKED v2.0",
                "Core characters: KENJI YUKIMURA, KIYOMI HAYASHI",
                "Key reveals: Kenji is marked for death.",
                "Locations: Rooftop, alley, cafe",
                "Continuity anchors: Kenji is Shiro's brother; Kiyomi has already selected him",
                "Follow-through into next ep: Kiyomi escalates the trap",
                "Hook: Blood in the apartment before the first conversation",
                "Inciting: Kiyomi approaches him at the cafe",
                "Tag: Kiyomi watching the building",
            ]
        ),
    )
    _write_text(
        episode_root / "01_WRITING" / "BEATS" / "S1E01_BEATS_v001.txt",
        "Beat 1: Cold open.\nBeat 2: The approach.",
    )
    _write_text(
        episode_root / "01_WRITING" / "BEATS" / "S1E01_SCENELIST_v001.txt",
        "Scene 1: Blood room.\nScene 2: Cafe lure.",
    )
    _write_text(
        episode_root / "00_ADMIN" / "S1E01_CONTINUITY_CHECK.txt",
        "Continuity okay.",
    )
    _write_text(
        episode_root / "03_VISUAL" / "S1E01_Settings.txt",
        "Wet neon. Cold air. Sharp reflections.",
    )
    _write_bytes(
        episode_root / "01_WRITING" / "SCRIPT" / "S1E01_SCRIPT_CANON_v2.docx",
        b"canon-docx-placeholder",
    )

    summary = bootstrap_source_directory(session, str(tmp_path), universe_id)

    assert summary["season_roots_processed"] == 1
    assert summary["chapters_imported"] == 1
    assert summary["episodes_imported"] == 1
    assert summary["errors"] == []

    chapter = session.exec(select(Chapter)).one()
    episode = session.exec(select(Episode)).one()

    assert chapter.canon_id == "S1CH01"
    assert chapter.name == "Test Arc"
    assert chapter.episode_range == "S1E01"

    assert episode.canon_id == "S1E01"
    assert episode.name == "Pilot Dawn"
    assert episode.chapter_id == chapter.id
    assert episode.status == "locked"
    assert episode.script_locked is True
    assert episode.featured_characters == ["KENJI YUKIMURA", "KIYOMI HAYASHI"]
    assert episode.continuity_anchors == [
        "Kenji is Shiro's brother",
        "Kiyomi has already selected him",
    ]
    assert "Blood in the apartment" in (episode.synopsis or "")
    assert episode.meta_text is not None
    assert episode.beats_text == "Beat 1: Cold open.\nBeat 2: The approach."
    assert episode.scenelist_text == "Scene 1: Blood room.\nScene 2: Cafe lure."
    assert episode.script_path is not None
    assert episode.script_path.endswith("S1E01_SCRIPT_CANON_v2.docx")

    second_summary = bootstrap_source_directory(session, str(tmp_path), universe_id)

    assert second_summary["chapters_skipped"] == 1
    assert second_summary["episodes_skipped"] == 1
