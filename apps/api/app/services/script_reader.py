from __future__ import annotations

from pathlib import Path
from xml.etree import ElementTree
from zipfile import BadZipFile, ZipFile

WORD_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def _read_txt_script(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _read_docx_script(path: Path) -> str:
    with ZipFile(path) as archive:
        document_xml = archive.read("word/document.xml")

    root = ElementTree.fromstring(document_xml)
    paragraphs: list[str] = []

    for paragraph in root.findall(".//w:p", WORD_NS):
        runs: list[str] = []
        for node in paragraph.iter():
            tag = node.tag.rsplit("}", 1)[-1]
            if tag == "t" and node.text:
                runs.append(node.text)
            elif tag == "tab":
                runs.append("\t")
            elif tag in {"br", "cr"}:
                runs.append("\n")

        line = "".join(runs).strip()
        if line:
            paragraphs.append(line)

    return "\n\n".join(paragraphs)


def read_script_file(script_path: str) -> tuple[str, str]:
    path = Path(script_path)
    suffix = path.suffix.lower()

    if suffix == ".docx":
        try:
            return _read_docx_script(path), "docx"
        except (BadZipFile, KeyError, ElementTree.ParseError) as exc:
            raise ValueError(f"Unable to parse DOCX script: {path.name}") from exc

    return _read_txt_script(path), "text"
