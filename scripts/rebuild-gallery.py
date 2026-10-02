"""Rebuild website gallery boards with individually restored PDF images.

Requires PyMuPDF. Run from the project root after restoring images listed in
images/pdf-manifest.json. The downloadable source PDF is never overwritten.
"""
import json
from pathlib import Path

import fitz


def main():
    manifest = json.loads(Path("images/pdf-manifest.json").read_text())
    document = fitz.open("public/portfolio-emma-expert-2026.pdf")
    texts = [page.get_text() for page in document]
    changed = 0
    for image in manifest:
        path = Path(image["restored"])
        if image["xref"] == 926:
            # Blank background tile: no visible content to reconstruct.
            continue
        if not path.exists():
            raise FileNotFoundError(f"Restoration missing: {path}")
        document[image["pages"][0] - 1].replace_image(image["xref"], filename=str(path))
        changed += 1
    assert [page.get_text() for page in document] == texts, "PDF text changed"
    for number in sorted({number for image in manifest for number in image["pages"]}):
        path = Path(f"src/assets/page-{number}.jpg")
        page = document[number - 1]
        scale = 3840 / page.rect.width
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        pixmap.save(str(path), jpg_quality=95)
        print(f"{path.name}: {pixmap.width} × {pixmap.height}")
    print(f"{changed} embedded images replaced; source PDF and board text preserved.")


if __name__ == "__main__":
    main()
