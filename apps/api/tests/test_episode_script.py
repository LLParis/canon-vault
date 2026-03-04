from pathlib import Path
from zipfile import ZipFile


def _create_episode(client, universe_id: int, script_path: str | None = None) -> int:
    response = client.post(
        "/api/v1/episodes/",
        json={
            "name": "Script Episode",
            "canon_id": "S9E99",
            "universe_id": universe_id,
            "season": 9,
            "number": 99,
            "script_path": script_path,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _write_docx(path: Path, paragraphs: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    body = "".join(
        f"<w:p><w:r><w:t>{paragraph}</w:t></w:r></w:p>"
        for paragraph in paragraphs
    )
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{body}</w:body>"
        "</w:document>"
    )
    with ZipFile(path, "w") as archive:
        archive.writestr("word/document.xml", document)


def test_episode_script_reads_text_file(client, universe_id, tmp_path: Path):
    script_path = tmp_path / "episode-script.txt"
    script_path.write_text("INT. CAFE - NIGHT\nKenji sits alone.", encoding="utf-8")
    episode_id = _create_episode(client, universe_id, str(script_path))

    response = client.get(f"/api/v1/episodes/{episode_id}/script")

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_available"] is True
    assert payload["source_type"] == "text"
    assert "INT. CAFE - NIGHT" in payload["content"]
    assert payload["line_count"] == 2


def test_episode_script_reads_docx_file(client, universe_id, tmp_path: Path):
    script_path = tmp_path / "episode-script.docx"
    _write_docx(script_path, ["EXT. ROOFTOP - NIGHT", "Kiyomi watches the city below."])
    episode_id = _create_episode(client, universe_id, str(script_path))

    response = client.get(f"/api/v1/episodes/{episode_id}/script")

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_available"] is True
    assert payload["source_type"] == "docx"
    assert "EXT. ROOFTOP - NIGHT" in payload["content"]
    assert "Kiyomi watches the city below." in payload["content"]


def test_episode_script_reports_missing_file(client, universe_id, tmp_path: Path):
    missing_path = tmp_path / "missing-script.docx"
    episode_id = _create_episode(client, universe_id, str(missing_path))

    response = client.get(f"/api/v1/episodes/{episode_id}/script")

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_available"] is False
    assert payload["content"] is None
    assert "not found on disk" in payload["message"]
