#!/usr/bin/env python3
"""
Buduje jednoplikową wersję strony: index-standalone.html

Wkleja zawartość folderu img/ bezpośrednio do HTML jako data URI (base64),
dzięki czemu plik działa samodzielnie — bez folderu ze zdjęciami.
Przydatne do wysłania klientowi jednym załącznikiem.

Użycie:  python3 build-standalone.py
"""
import base64
import io
import pathlib
import re

HERE = pathlib.Path(__file__).parent
SRC = HERE / "index.html"
DST = HERE / "index-standalone.html"

# Zdjęcia są wklejane wielokrotnie (to samo zdjęcie bywa w kilku sekcjach),
# więc na potrzeby wersji do wysyłki zmniejszamy je — plik robi się kilka razy lżejszy.
MAX_PX = 1200
QUALITY = 75

html = SRC.read_text(encoding="utf-8")
cache = {}


def to_data_uri(rel_path: str) -> str:
    if rel_path not in cache:
        raw = (HERE / rel_path).read_bytes()
        try:
            from PIL import Image

            im = Image.open(io.BytesIO(raw)).convert("RGB")
            if max(im.size) > MAX_PX:
                r = MAX_PX / max(im.size)
                im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            if buf.tell() < len(raw):  # bierzemy mniejszy wariant
                raw = buf.getvalue()
        except ImportError:
            pass  # bez Pillow wklejamy oryginał
        cache[rel_path] = "data:image/jpeg;base64," + base64.b64encode(raw).decode()
    return cache[rel_path]


# Podmienia każde odwołanie do img/*.jpg — zarówno w src="", jak i w url('') w CSS
def replace(match):
    return match.group(0).replace(match.group(1), to_data_uri(match.group(1)))


html = re.sub(r"(img/[A-Za-z0-9._-]+\.jpg)", replace, html)

DST.write_text(html, encoding="utf-8")

print(f"Zapisano: {DST.name}")
print(f"  osadzonych zdjec: {len(cache)}")
print(f"  rozmiar: {DST.stat().st_size / 1024 / 1024:.2f} MB")
if re.search(r"[\"'(]img/", html):
    print("  UWAGA: zostaly nieosadzone odwolania do img/")
