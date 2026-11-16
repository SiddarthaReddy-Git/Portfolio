"""Video frame extraction and asset integrity verification pipeline powered by FFmpeg/FFprobe."""

from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple

from .config import (
    FRAMES_DIR,
    PORTFOLIO_SLIDES,
    RESUME_ASSETS,
    VIDEO_ASSET,
    resolve_public_asset,
)


@dataclass
class MediaProbeInfo:
    width: int
    height: int
    duration_seconds: float
    fps: float
    codec_name: str
    frame_count: int


@dataclass
class AssetVerificationReport:
    video_ok: bool
    video_info: Optional[MediaProbeInfo]
    extracted_frames_count: int
    slides_verified: int
    avatars_verified: int
    resume_image_ok: bool
    resume_pdf_ok: bool
    errors: List[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return (
            self.video_ok
            and self.extracted_frames_count >= VIDEO_ASSET.total_frames
            and self.slides_verified == len(PORTFOLIO_SLIDES)
            and self.resume_image_ok
            and self.resume_pdf_ok
            and len(self.errors) == 0
        )

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "videoOk": self.video_ok,
            "videoInfo": (
                {
                    "width": self.video_info.width,
                    "height": self.video_info.height,
                    "durationSeconds": self.video_info.duration_seconds,
                    "fps": self.video_info.fps,
                    "codecName": self.video_info.codec_name,
                    "frameCount": self.video_info.frame_count,
                }
                if self.video_info
                else None
            ),
            "extractedFramesCount": self.extracted_frames_count,
            "slidesVerified": self.slides_verified,
            "avatarsVerified": self.avatars_verified,
            "resumeImageOk": self.resume_image_ok,
            "resumePdfOk": self.resume_pdf_ok,
            "errors": self.errors,
        }


def _require_binary(name: str) -> str:
    binary = shutil.which(name)
    if not binary:
        raise FileNotFoundError(f"Required media binary '{name}' was not found in PATH.")
    return binary


def probe_media_stream(media_path: Path) -> MediaProbeInfo:
    """Inspect video or image stream dimensions and timing using ffprobe."""
    ffprobe = _require_binary("ffprobe")
    cmd = [
        ffprobe,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,r_frame_rate,nb_frames,duration,codec_name",
        "-of",
        "json",
        str(media_path),
    ]
    raw = subprocess.check_output(cmd, text=True)
    parsed = json.loads(raw)
    streams = parsed.get("streams") or []
    if not streams:
        raise ValueError(f"No video stream found in {media_path}")

    stream = streams[0]
    fps_raw = stream.get("r_frame_rate", "24/1")
    num, _, den = fps_raw.partition("/")
    fps = float(num) / float(den or 1)
    nb_frames_raw = stream.get("nb_frames")
    frame_count = int(nb_frames_raw) if nb_frames_raw and nb_frames_raw.isdigit() else 0

    return MediaProbeInfo(
        width=int(stream["width"]),
        height=int(stream["height"]),
        duration_seconds=float(stream.get("duration") or 0.0),
        fps=round(fps, 3),
        codec_name=str(stream.get("codec_name") or "unknown"),
        frame_count=frame_count,
    )


def probe_image_dimensions(image_path: Path) -> Tuple[int, int]:
    """Return (width, height) for a static image file via ffprobe."""
    info = probe_media_stream(image_path)
    return info.width, info.height


def extract_video_frames(
    quality: int = 82,
    overwrite: bool = False,
) -> int:
    """Extract WebP frames from the supplied MP4 video for zero-latency scroll scrubbing."""
    ffmpeg = _require_binary("ffmpeg")
    video_path = resolve_public_asset(VIDEO_ASSET.src)
    if not video_path.exists():
        raise FileNotFoundError(f"Source portfolio video missing: {video_path}")

    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    existing_frames = sorted(FRAMES_DIR.glob("frame_*.webp"))
    if len(existing_frames) >= VIDEO_ASSET.total_frames and not overwrite:
        return len(existing_frames)

    output_pattern = str(FRAMES_DIR / "frame_%03d.webp")
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video_path),
        "-vf",
        f"fps={VIDEO_ASSET.fps}",
        "-c:v",
        "libwebp",
        "-q:v",
        str(quality),
        "-preset",
        "default",
        output_pattern,
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    return len(list(FRAMES_DIR.glob("frame_*.webp")))


def verify_portfolio_assets() -> AssetVerificationReport:
    """Verify the supplied video, extracted scrub frames, slides, avatars, and resume files."""
    errors: List[str] = []
    video_info: Optional[MediaProbeInfo] = None
    video_ok = False

    video_path = resolve_public_asset(VIDEO_ASSET.src)
    if not video_path.exists():
        errors.append(f"Missing video file: {video_path}")
    else:
        try:
            video_info = probe_media_stream(video_path)
            if video_info.width != VIDEO_ASSET.width or video_info.height != VIDEO_ASSET.height:
                errors.append(
                    f"Unexpected video resolution {video_info.width}x{video_info.height}, "
                    f"expected {VIDEO_ASSET.width}x{VIDEO_ASSET.height}"
                )
            else:
                video_ok = True
        except Exception as exc:
            errors.append(f"Video probe failed: {exc}")

    extracted_frames = sorted(FRAMES_DIR.glob("frame_*.webp")) if FRAMES_DIR.exists() else []
    if len(extracted_frames) < VIDEO_ASSET.total_frames:
        errors.append(
            f"Found {len(extracted_frames)} extracted video frames, expected {VIDEO_ASSET.total_frames}"
        )

    slides_verified = 0
    avatars_verified = 0
    for slide in PORTFOLIO_SLIDES:
        slide_path = resolve_public_asset(slide.src)
        if not slide_path.exists():
            errors.append(f"Missing slide image ({slide.title}): {slide_path}")
        else:
            try:
                w, h = probe_image_dimensions(slide_path)
                if w != slide.expected_width or h != slide.expected_height:
                    errors.append(
                        f"Slide '{slide.title}' dimensions {w}x{h} != "
                        f"expected {slide.expected_width}x{slide.expected_height}"
                    )
                else:
                    slides_verified += 1
            except Exception as exc:
                errors.append(f"Failed probing slide '{slide.title}': {exc}")

        if slide.avatar is not None:
            avatar_path = resolve_public_asset(slide.avatar.src)
            if not avatar_path.exists():
                errors.append(f"Missing avatar image ({slide.title}): {avatar_path}")
            else:
                avatars_verified += 1

    resume_img_path = resolve_public_asset(RESUME_ASSETS["imageSrc"])
    resume_pdf_path = resolve_public_asset(RESUME_ASSETS["pdfSrc"])
    resume_image_ok = resume_img_path.exists() and resume_img_path.stat().st_size > 0
    resume_pdf_ok = resume_pdf_path.exists() and resume_pdf_path.read_bytes().startswith(b"%PDF")

    if not resume_image_ok:
        errors.append(f"Missing or empty resume image: {resume_img_path}")
    if not resume_pdf_ok:
        errors.append(f"Missing or invalid resume PDF: {resume_pdf_path}")

    return AssetVerificationReport(
        video_ok=video_ok,
        video_info=video_info,
        extracted_frames_count=len(extracted_frames),
        slides_verified=slides_verified,
        avatars_verified=avatars_verified,
        resume_image_ok=resume_image_ok,
        resume_pdf_ok=resume_pdf_ok,
        errors=errors,
    )
