"""Threaded Python HTTP server with byte-range MP4 streaming and portfolio JSON endpoints."""

from __future__ import annotations

import json
import mimetypes
import re
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import unquote, urlparse

from .config import DIST_DIR, PUBLIC_DIR, RESUME_ASSETS, build_portfolio_payload, resolve_public_asset
from .media_pipeline import verify_portfolio_assets


RANGE_HEADER_RE = re.compile(r"bytes=(\d*)-(\d*)")

EXTRA_MIME_TYPES = {
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
}


def guess_content_type(file_path: Path) -> str:
    ext = file_path.suffix.lower()
    if ext in EXTRA_MIME_TYPES:
        return EXTRA_MIME_TYPES[ext]
    guessed, _ = mimetypes.guess_type(str(file_path))
    return guessed or "application/octet-stream"


def parse_byte_range(header_value: str, file_size: int) -> Optional[Tuple[int, int]]:
    match = RANGE_HEADER_RE.fullmatch(header_value.strip())
    if not match or file_size <= 0:
        return None
    start_str, end_str = match.groups()
    if not start_str and not end_str:
        return None

    if start_str:
        start = int(start_str)
        end = int(end_str) if end_str else file_size - 1
    else:
        suffix_length = int(end_str)
        start = max(0, file_size - suffix_length)
        end = file_size - 1

    if start > end or start >= file_size:
        return None
    return start, min(end, file_size - 1)


class PortfolioRequestHandler(BaseHTTPRequestHandler):
    """Serves built SPA files, media assets with byte-range support, and portfolio JSON APIs."""

    server_version = "PortfolioPythonServer/1.0"

    def log_message(self, format: str, *args) -> None:
        return

    def _send_json(self, status: HTTPStatus, payload: dict) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _resolve_static_file(self, url_path: str) -> Optional[Path]:
        rel = unquote(url_path).lstrip("/")
        roots = [DIST_DIR, PUBLIC_DIR]
        for root in roots:
            if not root.exists():
                continue
            candidate = (root / rel).resolve()
            try:
                candidate.relative_to(root.resolve())
            except ValueError:
                continue
            if candidate.is_file():
                return candidate
        return None

    def _stream_file(self, file_path: Path, force_download_name: Optional[str] = None) -> None:
        file_size = file_path.stat().st_size
        content_type = guess_content_type(file_path)
        range_header = self.headers.get("Range")

        if range_header:
            byte_range = parse_byte_range(range_header, file_size)
            if byte_range is None:
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{file_size}")
                self.end_headers()
                return

            start, end = byte_range
            chunk_len = end - start + 1
            self.send_response(HTTPStatus.PARTIAL_CONTENT)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(chunk_len))
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()

            with file_path.open("rb") as fh:
                fh.seek(start)
                remaining = chunk_len
                while remaining > 0:
                    chunk = fh.read(min(65536, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        if force_download_name:
            self.send_header(
                "Content-Disposition",
                f'attachment; filename="{force_download_name}"',
            )
        self.end_headers()

        with file_path.open("rb") as fh:
            while True:
                chunk = fh.read(65536)
                if not chunk:
                    break
                self.wfile.write(chunk)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            if path == "/api/health":
                report = verify_portfolio_assets()
                self._send_json(
                    HTTPStatus.OK if report.passed else HTTPStatus.SERVICE_UNAVAILABLE,
                    report.to_dict(),
                )
                return

            if path == "/api/portfolio":
                self._send_json(HTTPStatus.OK, build_portfolio_payload())
                return

            if path == "/api/resume/download":
                pdf_path = resolve_public_asset(RESUME_ASSETS["pdfSrc"])
                if not pdf_path.is_file():
                    self._send_json(HTTPStatus.NOT_FOUND, {"error": "Resume PDF not found"})
                    return
                self._stream_file(pdf_path, force_download_name=RESUME_ASSETS["downloadFilename"])
                return

            target_path = path if path != "/" else "/index.html"
            resolved = self._resolve_static_file(target_path)
            if resolved is None and not Path(path).suffix:
                resolved = self._resolve_static_file("/index.html")

            if resolved is None:
                self._send_json(HTTPStatus.NOT_FOUND, {"error": f"Not found: {path}"})
                return

            self._stream_file(resolved)
        except (BrokenPipeError, ConnectionResetError):
            return


def serve_portfolio(host: str = "0.0.0.0", port: int = 8080) -> None:
    """Start the threaded Python HTTP server until interrupted."""
    server = ThreadingHTTPServer((host, port), PortfolioRequestHandler)
    print(f"Python portfolio server listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Python portfolio server.")
    finally:
        server.server_close()
