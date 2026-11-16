"""Unit tests for the Python portfolio media pipeline, avatar analyzer, and HTTP server helpers."""

from __future__ import annotations

import unittest

from portfolio_py.avatar_processor import analyze_all_avatars
from portfolio_py.config import PORTFOLIO_SLIDES, VIDEO_ASSET, build_portfolio_payload
from portfolio_py.media_pipeline import verify_portfolio_assets
from portfolio_py.server import guess_content_type, parse_byte_range
from pathlib import Path


class PortfolioPythonTests(unittest.TestCase):
    def test_verify_portfolio_assets_passes(self) -> None:
        report = verify_portfolio_assets()
        self.assertTrue(report.passed, msg=f"Verification errors: {report.errors}")
        self.assertTrue(report.video_ok)
        self.assertEqual(report.slides_verified, len(PORTFOLIO_SLIDES))
        self.assertEqual(report.avatars_verified, 5)
        self.assertGreaterEqual(report.extracted_frames_count, VIDEO_ASSET.total_frames)
        self.assertTrue(report.resume_image_ok)
        self.assertTrue(report.resume_pdf_ok)

    def test_analyze_all_avatars_bounding_boxes(self) -> None:
        bounds = analyze_all_avatars()
        self.assertEqual(len(bounds), 5)
        for item in bounds:
            self.assertGreater(item.foreground_pixels, 1000)
            self.assertGreater(item.cropped_width, 50)
            self.assertGreater(item.cropped_height, 50)
            self.assertLess(item.max_x, item.source_width)
            self.assertLess(item.max_y, item.source_height)

    def test_portfolio_payload_structure(self) -> None:
        payload = build_portfolio_payload()
        self.assertIn("video", payload)
        self.assertIn("slides", payload)
        self.assertIn("contact", payload)
        self.assertIn("resume", payload)
        self.assertEqual(len(payload["slides"]), 6)
        self.assertEqual(payload["video"]["totalFrames"], 240)

    def test_http_range_parsing_and_mime_types(self) -> None:
        self.assertEqual(parse_byte_range("bytes=0-1023", 5000), (0, 1023))
        self.assertEqual(parse_byte_range("bytes=100-", 5000), (100, 4999))
        self.assertEqual(parse_byte_range("bytes=-500", 5000), (4500, 4999))
        self.assertIsNone(parse_byte_range("bytes=9999-10000", 5000))
        self.assertEqual(guess_content_type(Path("clip.mp4")), "video/mp4")
        self.assertEqual(guess_content_type(Path("frame_001.webp")), "image/webp")
        self.assertEqual(guess_content_type(Path("resume.pdf")), "application/pdf")


if __name__ == "__main__":
    unittest.main()
