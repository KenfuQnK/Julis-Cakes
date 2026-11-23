"""Local Food Gallery server. Uses only the Python standard library."""
from __future__ import annotations

import datetime as dt
import json
import math
import mimetypes
import os
import re
import threading
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from pathlib import PurePosixPath
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
PHOTO_DIR = ROOT / "fotos"
DATA_FILE = ROOT / "comidas.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
LOCK = threading.RLock()
CROP_TOLERANCE = 0.0001


def normalized_path(value: str) -> str:
    return Path(value.replace("\\", "/")).as_posix()


def _exif_date(path: Path) -> dt.datetime | None:
    """Read DateTimeOriginal from JPEG TIFF EXIF without third-party packages."""
    try:
        data = path.read_bytes()[:2_000_000]
        pos = 2
        while pos + 4 < len(data) and data[pos] == 0xFF:
            marker = data[pos + 1]
            pos += 2
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            size = int.from_bytes(data[pos:pos + 2], "big")
            segment = data[pos + 2:pos + size]
            pos += size
            if marker != 0xE1 or not segment.startswith(b"Exif\0\0"):
                continue
            tiff = segment[6:]
            endian = "little" if tiff[:2] == b"II" else "big"
            if (endian == "little" and tiff[2:4] != b"*\0") or (endian == "big" and tiff[2:4] != b"\0*"):
                return None
            def u16(offset: int) -> int: return int.from_bytes(tiff[offset:offset + 2], endian)
            def u32(offset: int) -> int: return int.from_bytes(tiff[offset:offset + 4], endian)
            ifd = u32(4)
            exif_ifd = None
            for i in range(u16(ifd)):
                entry = ifd + 2 + i * 12
                if u16(entry) == 0x8769:
                    exif_ifd = u32(entry + 8)
            if exif_ifd is None: return None
            for i in range(u16(exif_ifd)):
                entry = exif_ifd + 2 + i * 12
                if u16(entry) == 0x9003:
                    offset = u32(entry + 8)
                    text = tiff[offset:offset + 20].split(b"\0", 1)[0].decode("ascii")
                    return dt.datetime.strptime(text, "%Y:%m:%d %H:%M:%S")
    except (OSError, ValueError, IndexError, UnicodeDecodeError, OverflowError):
        return None
    return None


def photo_datetime(path: Path) -> dt.datetime:
    match = re.search(r"(?<!\d)(\d{8})[_-]?(\d{6})(?!\d)", path.stem)
    if match:
        try: return dt.datetime.strptime("".join(match.groups()), "%Y%m%d%H%M%S")
        except ValueError: pass
    exif = _exif_date(path)
    if exif: return exif
    return dt.datetime.fromtimestamp(path.stat().st_mtime)


def validate(data: object) -> dict:
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(data.get("dishes"), list):
        raise ValueError("El JSON debe tener version 1 y una lista dishes.")
    ids: set[str] = set()
    files: set[str] = set()
    for dish in data["dishes"]:
        if not isinstance(dish, dict) or not isinstance(dish.get("id"), str) or not dish["id"]:
            raise ValueError("Cada plato debe tener un id válido.")
        if dish["id"] in ids: raise ValueError("Hay identificadores de plato duplicados.")
        ids.add(dish["id"])
        if not isinstance(dish.get("title"), str) or not dish["title"].strip() or not isinstance(dish.get("date"), str) or not isinstance(dish.get("photos"), list):
            raise ValueError("Cada plato necesita title y photos válidos.")
        try: dt.date.fromisoformat(dish["date"])
        except ValueError as error: raise ValueError("La fecha del plato debe usar formato AAAA-MM-DD.") from error
        dish_files = []
        for photo in dish["photos"]:
            if not isinstance(photo, dict) or not isinstance(photo.get("file"), str) or not isinstance(photo.get("hidden"), bool):
                raise ValueError("Fotografía inválida en el JSON.")
            file = normalized_path(photo["file"])
            if ".." in PurePosixPath(file).parts or not file or Path(file).is_absolute() or "\0" in file or Path(file).suffix.lower() not in IMAGE_EXTENSIONS: raise ValueError("Ruta de fotografía inválida.")
            if file in files: raise ValueError("Una fotografía está asignada a más de un plato.")
            if "crop" in photo:
                crop = photo["crop"]
                if not isinstance(crop, dict) or set(crop) != {"x", "y", "width", "height"} or any(type(crop[key]) not in (int, float) or not math.isfinite(crop[key]) for key in ("x", "y", "width", "height")):
                    raise ValueError("Encuadre de fotografía inválido.")
                for coordinate in ("x", "y"):
                    if -CROP_TOLERANCE <= crop[coordinate] < 0:
                        crop[coordinate] = 0
                for dimension in ("width", "height"):
                    if 1 < crop[dimension] <= 1 + CROP_TOLERANCE:
                        crop[dimension] = 1
                if crop["x"] < 0 or crop["y"] < 0 or not 0 < crop["width"] <= 1 or not 0 < crop["height"] <= 1 or crop["x"] + crop["width"] > 1 + CROP_TOLERANCE or crop["y"] + crop["height"] > 1 + CROP_TOLERANCE:
                    raise ValueError("Encuadre fuera de la fotografía.")
                crop["width"] = min(crop["width"], 1 - crop["x"])
                crop["height"] = min(crop["height"], 1 - crop["y"])
            files.add(file); photo["file"] = file; dish_files.append(file)
        if dish.get("cover") not in dish_files: dish["cover"] = next((p["file"] for p in dish["photos"] if not p["hidden"]), dish_files[0] if dish_files else None)
        dish.setdefault("manuallyOrganized", False)
        if not isinstance(dish["manuallyOrganized"], bool): raise ValueError("manuallyOrganized debe ser booleano.")
        dish.setdefault("favorite", False)
        if not isinstance(dish["favorite"], bool): raise ValueError("favorite debe ser booleano.")
    return data


def load_data() -> dict:
    if not DATA_FILE.exists(): return {"version": 1, "dishes": []}
    try: return validate(json.loads(DATA_FILE.read_text(encoding="utf-8")))
    except (json.JSONDecodeError, ValueError) as error:
        raise ValueError(f"comidas.json está dañado o no es válido: {error}") from error


def save_data(data: dict) -> None:
    validate(data)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    temp = DATA_FILE.with_suffix(".json.tmp")
    with temp.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.flush(); os.fsync(handle.fileno())
    os.replace(temp, DATA_FILE)


def scan(data: dict) -> tuple[dict, int]:
    """Add new images only; retain all prior grouping and ordering."""
    if not PHOTO_DIR.is_dir(): raise FileNotFoundError(f"No se encuentra la carpeta: {PHOTO_DIR}")
    known = {normalized_path(photo["file"]) for dish in data["dishes"] for photo in dish["photos"]}
    found = sorted((p for p in PHOTO_DIR.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS), key=lambda p: p.relative_to(PHOTO_DIR).as_posix().casefold())
    fresh: dict[str, list[tuple[str, dt.datetime]]] = {}
    for path in found:
        rel = normalized_path(path.relative_to(PHOTO_DIR).as_posix())
        if rel not in known:
            stamp = photo_datetime(path)
            fresh.setdefault(stamp.date().isoformat(), []).append((rel, stamp))
    added = 0
    for day, batch in sorted(fresh.items()):
        same_day = [d for d in data["dishes"] if d.get("date") == day]
        target = same_day[0] if len(same_day) == 1 and not same_day[0].get("manuallyOrganized", False) else None
        if target is None:
            target = {"id": f"dish_{uuid.uuid4().hex}", "date": day, "title": f"{dt.date.fromisoformat(day).strftime('%d/%m/%Y')} - Sin nombre", "cover": None, "manuallyOrganized": False, "photos": []}
            data["dishes"].append(target)
        for rel, stamp in batch:
            target["photos"].append({"file": rel, "date": stamp.isoformat(timespec="seconds"), "hidden": False}); added += 1
        if target.get("cover") is None: target["cover"] = target["photos"][0]["file"]
    return data, added


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, fmt, *args): print(f"[Food Gallery] {self.address_string()} {fmt % args}")
    def send_json(self, status: int, value: object):
        raw = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def body(self) -> dict:
        size = int(self.headers.get("Content-Length", "0"))
        if size > 5_000_000: raise ValueError("Solicitud demasiado grande.")
        return json.loads(self.rfile.read(size) or b"{}")
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/data":
            scan_error = None
            try:
                with LOCK:
                    data = load_data()
                    added = 0
                    try:
                        data, added = scan(data)
                        if added: save_data(data)
                        count = sum(1 for item in PHOTO_DIR.rglob("*") if item.is_file() and item.suffix.lower() in IMAGE_EXTENSIONS)
                    except OSError as error:
                        scan_error = f"No se pudo leer la carpeta de fotos: {error}"
                        count = 0
                    missing = [p["file"] for d in data["dishes"] for p in d["photos"] if not (PHOTO_DIR / p["file"]).is_file()]
                    self.send_json(200, {"data": data, "added": added, "missing": missing, "photoCount": count, "scanError": scan_error})
            except (ValueError, OSError) as error: self.send_json(400, {"error": str(error)})
            return
        if path.startswith("/photos/"):
            rel = normalized_path(unquote(path[len("/photos/"):]))
            target = (PHOTO_DIR / rel).resolve()
            if not target.is_relative_to(PHOTO_DIR.resolve()) or target.suffix.lower() not in IMAGE_EXTENSIONS or not target.is_file(): self.send_error(404); return
            return self.send_file(target)
        return super().do_GET()
    def send_file(self, target: Path):
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        try:
            stat = target.stat(); self.send_response(200); self.send_header("Content-Type", content_type); self.send_header("Content-Length", str(stat.st_size)); self.send_header("Cache-Control", "no-cache"); self.end_headers()
            with target.open("rb") as handle:
                while chunk := handle.read(128 * 1024): self.wfile.write(chunk)
        except OSError: self.send_error(404)
    def do_POST(self):
        path = urlparse(self.path).path
        try:
            with LOCK:
                if path == "/api/scan":
                    data, added = scan(load_data()); save_data(data); self.send_json(200, {"data": data, "added": added}); return
                if path == "/api/save":
                    data = validate(self.body()); save_data(data); self.send_json(200, {"data": data}); return
            self.send_error(404)
        except (ValueError, OSError, json.JSONDecodeError) as error: self.send_json(400, {"error": str(error)})

if __name__ == "__main__":
    PHOTO_DIR.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", int(os.environ.get("FOOD_GALLERY_PORT", "8995"))), Handler)
    print(f"Food Gallery: http://127.0.0.1:{server.server_port}")
    try: server.serve_forever()
    except KeyboardInterrupt: print("\nFood Gallery detenido.")
