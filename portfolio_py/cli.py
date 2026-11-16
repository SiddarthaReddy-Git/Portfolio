"""Command-line interface for portfolio asset verification, frame extraction, avatar analysis, and serving."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional

from .avatar_processor import analyze_all_avatars
from .config import build_portfolio_payload
from .media_pipeline import extract_video_frames, verify_portfolio_assets
from .server import serve_portfolio


def _cmd_verify(as_json: bool) -> int:
    report = verify_portfolio_assets()
    if as_json:
        print(json.dumps(report.to_dict(), indent=2))
    else:
        print(f"Portfolio verification: {'PASS' if report.passed else 'FAIL'}")
        if report.video_info:
            vi = report.video_info
            print(
                f"  Video: {vi.width}x{vi.height}, {vi.duration_seconds:.2f}s, "
                f"{vi.fps} fps, codec={vi.codec_name}, frames={vi.frame_count}"
            )
        print(f"  Extracted WebP frames: {report.extracted_frames_count}")
        print(f"  Original slides verified: {report.slides_verified}/6")
        print(f"  Avatar cutouts configured: {report.avatars_verified}")
        print(f"  Resume image ready: {report.resume_image_ok}")
        print(f"  Resume PDF ready: {report.resume_pdf_ok}")
        if report.errors:
            for err in report.errors:
                print(f"  ERROR: {err}", file=sys.stderr)
    return 0 if report.passed else 1


def _cmd_extract_frames(quality: int, overwrite: bool) -> int:
    count = extract_video_frames(quality=quality, overwrite=overwrite)
    print(f"Ready: {count} WebP frames in public/assets/frames/")
    return 0


def _cmd_analyze_avatars(as_json: bool) -> int:
    bounds_list = analyze_all_avatars()
    if as_json:
        print(json.dumps([item.to_dict() for item in bounds_list], indent=2))
    else:
        for b in bounds_list:
            print(
                f"{b.slide_title} ({b.slide_id}): "
                f"src={b.source_width}x{b.source_height}, "
                f"crop=({b.min_x},{b.min_y})..({b.max_x},{b.max_y}) "
                f"[{b.cropped_width}x{b.cropped_height}], "
                f"fg={b.foreground_ratio * 100:.1f}%"
            )
    return 0


def _cmd_export_manifest(output_path: Optional[str]) -> int:
    payload = json.dumps(build_portfolio_payload(), indent=2)
    if output_path:
        target = Path(output_path)
        target.write_text(payload + "\n", encoding="utf-8")
        print(f"Wrote portfolio manifest to {target}")
    else:
        print(payload)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="portfolio-py",
        description="Python media pipeline, avatar analyzer, and HTTP server for Siddartha Reddy's portfolio.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    verify_p = sub.add_parser("verify", help="Verify video, frames, slides, avatars, and resume files.")
    verify_p.add_argument("--json", action="store_true", help="Emit JSON output.")

    frames_p = sub.add_parser("extract-frames", help="Extract 24fps WebP scrub frames from portfolio video.")
    frames_p.add_argument("--quality", type=int, default=82, help="WebP quality (0-100).")
    frames_p.add_argument("--overwrite", action="store_true", help="Re-extract even if frames exist.")

    avatars_p = sub.add_parser("analyze-avatars", help="Compute flood-fill bounding boxes for slide avatars.")
    avatars_p.add_argument("--json", action="store_true", help="Emit JSON output.")

    manifest_p = sub.add_parser("manifest", help="Print or write JSON manifest for portfolio sections.")
    manifest_p.add_argument("-o", "--output", default=None, help="Optional output JSON file path.")

    serve_p = sub.add_parser("serve", help="Run the Python HTTP server for dist/ + /api/portfolio.")
    serve_p.add_argument("--host", default="0.0.0.0", help="Bind host.")
    serve_p.add_argument("--port", type=int, default=8080, help="Listen port.")

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "verify":
        return _cmd_verify(as_json=args.json)
    if args.command == "extract-frames":
        return _cmd_extract_frames(quality=args.quality, overwrite=args.overwrite)
    if args.command == "analyze-avatars":
        return _cmd_analyze_avatars(as_json=args.json)
    if args.command == "manifest":
        return _cmd_export_manifest(output_path=args.output)
    if args.command == "serve":
        serve_portfolio(host=args.host, port=args.port)
        return 0

    parser.print_help()
    return 2
