"""Structured configuration and metadata models for Siddartha Reddy's portfolio."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Optional


ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
ASSETS_DIR = PUBLIC_DIR / "assets" / "aistudio"
FRAMES_DIR = PUBLIC_DIR / "assets" / "frames"
DIST_DIR = ROOT_DIR / "dist"


@dataclass(frozen=True)
class AvatarPlacementConfig:
    src: str
    alt: str
    bottom: str
    width: str
    left: Optional[str] = None
    right: Optional[str] = None
    soft_bottom_fade: bool = False

    def to_dict(self) -> dict:
        payload = {
            "src": self.src,
            "alt": self.alt,
            "bottom": self.bottom,
            "width": self.width,
        }
        if self.left is not None:
            payload["left"] = self.left
        if self.right is not None:
            payload["right"] = self.right
        if self.soft_bottom_fade:
            payload["softBottomFade"] = True
        return payload


@dataclass(frozen=True)
class PortfolioSlideConfig:
    id: str
    index: str
    nav_label: str
    title: str
    src: str
    alt: str
    aspect_ratio: str
    expected_width: int
    expected_height: int
    avatar: Optional[AvatarPlacementConfig] = None

    def to_dict(self) -> dict:
        payload = {
            "id": self.id,
            "index": self.index,
            "navLabel": self.nav_label,
            "title": self.title,
            "src": self.src,
            "alt": self.alt,
            "aspectRatio": self.aspect_ratio,
        }
        if self.avatar is not None:
            payload["avatar"] = self.avatar.to_dict()
        return payload


@dataclass(frozen=True)
class VideoAssetConfig:
    src: str
    poster: str
    width: int
    height: int
    duration_seconds: float
    fps: int
    total_frames: int

    def frame_path(self, frame_index: int) -> Path:
        return FRAMES_DIR / f"frame_{frame_index + 1:03d}.webp"

    def to_dict(self) -> dict:
        return {
            "src": self.src,
            "poster": self.poster,
            "width": self.width,
            "height": self.height,
            "durationSeconds": self.duration_seconds,
            "fps": self.fps,
            "totalFrames": self.total_frames,
        }


VIDEO_ASSET = VideoAssetConfig(
    src="/assets/aistudio/Siddartha_Reddy_Portfolio_Video_5d1e6a3a.mp4",
    poster="/assets/aistudio/Portfolio_1st_page_d898973d.jpeg",
    width=1280,
    height=720,
    duration_seconds=10.0,
    fps=24,
    total_frames=240,
)


PORTFOLIO_SLIDES: tuple[PortfolioSlideConfig, ...] = (
    PortfolioSlideConfig(
        id="hero-slide",
        index="01",
        nav_label="Hero",
        title="Introduction",
        src="/assets/aistudio/Portfolio_1st_page_d898973d.jpeg",
        alt=(
            "Siddartha Reddy — Introduction portfolio slide showcasing experience, "
            "skills in Python, Java, SQL, and Agentic AI, and contact location in "
            "Anantapur, Andhra Pradesh"
        ),
        aspect_ratio="1600 / 890",
        expected_width=1600,
        expected_height=890,
    ),
    PortfolioSlideConfig(
        id="about-slide",
        index="02",
        nav_label="About",
        title="About Me",
        src="/assets/aistudio/ABOUT_ME_2nd_page_d96600aa.png",
        alt=(
            "Siddartha Reddy — About Me portfolio slide detailing AI & Machine Learning "
            "focus, backend engineering, and core traits: Problem Solver, Creative "
            "Thinker, Continuous Learner"
        ),
        aspect_ratio="1688 / 932",
        expected_width=1688,
        expected_height=932,
        avatar=AvatarPlacementConfig(
            src="/assets/aistudio/image_20ae279a.png",
            alt="Siddartha Reddy avatar on About Me slide",
            left="46.5%",
            bottom="0%",
            width="27%",
        ),
    ),
    PortfolioSlideConfig(
        id="skills-slide",
        index="03",
        nav_label="Skills",
        title="Skills",
        src="/assets/aistudio/Skills_3rd_page_ff43bbea.png",
        alt=(
            "Siddartha Reddy — Skills portfolio slide covering Programming (Python, Java), "
            "Databases (MySQL, Supabase), Frameworks (Spring Boot, Django, Thymeleaf), "
            "and Tools (Git, GitHub, Maven)"
        ),
        aspect_ratio="1688 / 932",
        expected_width=1688,
        expected_height=932,
        avatar=AvatarPlacementConfig(
            src="/assets/aistudio/image_89e81abf.png",
            alt="Siddartha Reddy avatar on Skills slide",
            right="2.5%",
            bottom="0%",
            width="28%",
        ),
    ),
    PortfolioSlideConfig(
        id="projects-slide",
        index="04",
        nav_label="Projects",
        title="Projects",
        src="/assets/aistudio/Projects_4th_page_e7071996.png",
        alt=(
            "Siddartha Reddy — Projects portfolio slide featuring Jain-Transit, "
            "Climate Detector, and AI Trip Planner"
        ),
        aspect_ratio="1688 / 932",
        expected_width=1688,
        expected_height=932,
        avatar=AvatarPlacementConfig(
            src="/assets/aistudio/image_f730518a.png",
            alt="Siddartha Reddy avatar on Projects slide",
            right="4%",
            bottom="0%",
            width="31%",
        ),
    ),
    PortfolioSlideConfig(
        id="education-slide",
        index="05",
        nav_label="Education",
        title="Education",
        src="/assets/aistudio/Education_5th_page_de910b0f.jpeg",
        alt=(
            "Siddartha Reddy — Education portfolio slide detailing B.Tech in AI & ML at "
            "Jain University Bangalore, Sri Chaitanya Junior College, and Era "
            "International School"
        ),
        aspect_ratio="1600 / 881",
        expected_width=1600,
        expected_height=881,
        avatar=AvatarPlacementConfig(
            src="/assets/aistudio/image_2a07c30d.png",
            alt="Siddartha Reddy avatar on Education slide",
            right="2.5%",
            bottom="0%",
            width="45%",
        ),
    ),
    PortfolioSlideConfig(
        id="achievements-slide",
        index="06",
        nav_label="Achievements",
        title="Achievements",
        src="/assets/aistudio/Achievements_6th_page_855df7b9.png",
        alt=(
            "Siddartha Reddy — Achievements portfolio slide highlighting Java Internship "
            "at 1Stop.ai, AI & ML NSDC, Python with AI NSDC, and AI Tools Workshop"
        ),
        aspect_ratio="1688 / 932",
        expected_width=1688,
        expected_height=932,
        avatar=AvatarPlacementConfig(
            src="/assets/aistudio/image_a92b1bd8.png",
            alt="Siddartha Reddy avatar on Achievements slide",
            right="6%",
            bottom="9.5%",
            width="32%",
            soft_bottom_fade=True,
        ),
    ),
)


CONTACT_INFO = {
    "name": "Siddartha Reddy",
    "subtitle": "AI & ML · Backend Engineering · Agentic AI",
    "location": "Anantapur, Andhra Pradesh",
    "phone": "+91 7995341715",
    "email": "siddarthareddy380@gmail.com",
}


RESUME_ASSETS = {
    "imageSrc": "/assets/aistudio/WhatsApp_Image_2026-11-12_at_5.43.31_PM_e8bb6074.jpeg",
    "pdfSrc": "/assets/aistudio/Siddartha_Reddy_Resume._415cc9f8.pdf",
    "downloadFilename": "Siddartha_Reddy_Resume.pdf",
}


def build_portfolio_payload() -> dict:
    """Return the complete JSON-serializable portfolio manifest."""
    return {
        "video": VIDEO_ASSET.to_dict(),
        "slides": [slide.to_dict() for slide in PORTFOLIO_SLIDES],
        "contact": dict(CONTACT_INFO),
        "resume": dict(RESUME_ASSETS),
    }


def resolve_public_asset(web_path: str) -> Path:
    """Map a leading-slash public web asset path to its local filesystem path."""
    cleaned = web_path.lstrip("/")
    return PUBLIC_DIR / cleaned
