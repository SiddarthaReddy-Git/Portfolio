"""Pure-Python RGBA flood-fill analyzer for avatar cutout bounding boxes and slide placement."""

from __future__ import annotations

import shutil
import subprocess
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import List

from .config import PORTFOLIO_SLIDES, resolve_public_asset
from .media_pipeline import probe_image_dimensions


@dataclass(frozen=True)
class AvatarBounds:
    slide_id: str
    slide_title: str
    avatar_src: str
    source_width: int
    source_height: int
    min_x: int
    min_y: int
    max_x: int
    max_y: int
    foreground_pixels: int

    @property
    def cropped_width(self) -> int:
        return self.max_x - self.min_x + 1

    @property
    def cropped_height(self) -> int:
        return self.max_y - self.min_y + 1

    @property
    def foreground_ratio(self) -> float:
        total = max(1, self.source_width * self.source_height)
        return round(self.foreground_pixels / total, 4)

    def to_dict(self) -> dict:
        return {
            "slideId": self.slide_id,
            "slideTitle": self.slide_title,
            "avatarSrc": self.avatar_src,
            "sourceDimensions": [self.source_width, self.source_height],
            "boundingBox": {
                "minX": self.min_x,
                "minY": self.min_y,
                "maxX": self.max_x,
                "maxY": self.max_y,
                "width": self.cropped_width,
                "height": self.cropped_height,
            },
            "foregroundPixels": self.foreground_pixels,
            "foregroundRatio": self.foreground_ratio,
        }


def _is_lavender_background(r: int, g: int, b: int) -> bool:
    """Match pale lavender/lilac backdrop pixels while rejecting skin, hair, and teal shirt."""
    return r >= 174 and g >= 164 and b >= 194 and (b - r) >= -3 and (b - g) >= 4


def _decode_rgba(image_path: Path) -> bytes:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise FileNotFoundError("ffmpeg is required to decode RGBA pixel buffers.")
    cmd = [
        ffmpeg,
        "-v",
        "error",
        "-i",
        str(image_path),
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgba",
        "-",
    ]
    return subprocess.check_output(cmd)


def analyze_avatar_cutout(slide_id: str, slide_title: str, avatar_src: str) -> AvatarBounds:
    """Compute exterior-flood-filled silhouette bounds for an uploaded avatar image."""
    image_path = resolve_public_asset(avatar_src)
    if not image_path.exists():
        raise FileNotFoundError(f"Avatar image not found: {image_path}")

    width, height = probe_image_dimensions(image_path)
    raw = _decode_rgba(image_path)
    total = width * height
    if len(raw) < total * 4:
        raise ValueError(f"Unexpected RGBA buffer size for {image_path}")

    visited = bytearray(total)
    bg_mask = bytearray(total)
    queue: deque[int] = deque()

    def seed(x: int, y: int) -> None:
        pos = y * width + x
        if not visited[pos]:
            visited[pos] = 1
            queue.append(pos)

    for x in range(width):
        seed(x, 0)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    left_corner_end = int(width * 0.22)
    right_corner_start = int(width * 0.78)
    for x in range(left_corner_end):
        seed(x, height - 1)
    for x in range(right_corner_start, width):
        seed(x, height - 1)

    while queue:
        pos = queue.popleft()
        offset = pos * 4
        if not _is_lavender_background(raw[offset], raw[offset + 1], raw[offset + 2]):
            continue
        bg_mask[pos] = 1

        x = pos % width
        y = (pos - x) // width

        if x + 1 < width:
            seed(x + 1, y)
        if x - 1 >= 0:
            seed(x - 1, y)
        if y + 1 < height:
            seed(x, y + 1)
        if y - 1 >= 0:
            seed(x, y - 1)

    min_x, min_y = width, height
    max_x, max_y = 0, 0
    fg_pixels = 0

    for y in range(height):
        row_base = y * width
        for x in range(width):
            if not bg_mask[row_base + x]:
                fg_pixels += 1
                if x < min_x:
                    min_x = x
                if y < min_y:
                    min_y = y
                if x > max_x:
                    max_x = x
                if y > max_y:
                    max_y = y

    if fg_pixels == 0:
        min_x, min_y, max_x, max_y = 0, 0, width - 1, height - 1

    return AvatarBounds(
        slide_id=slide_id,
        slide_title=slide_title,
        avatar_src=avatar_src,
        source_width=width,
        source_height=height,
        min_x=min_x,
        min_y=min_y,
        max_x=max_x,
        max_y=max_y,
        foreground_pixels=fg_pixels,
    )


def analyze_all_avatars() -> List[AvatarBounds]:
    """Analyze every configured slide avatar image and return bounding-box metrics."""
    results: List[AvatarBounds] = []
    for slide in PORTFOLIO_SLIDES:
        if slide.avatar is None:
            continue
        results.append(analyze_avatar_cutout(slide.id, slide.title, slide.avatar.src))
    return results
