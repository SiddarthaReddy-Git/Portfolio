"""Python media pipeline, verification toolkit, and static/API server for Siddartha Reddy's portfolio."""

from .config import (
    CONTACT_INFO,
    PORTFOLIO_SLIDES,
    RESUME_ASSETS,
    VIDEO_ASSET,
    AvatarPlacementConfig,
    PortfolioSlideConfig,
    VideoAssetConfig,
)
from .media_pipeline import AssetVerificationReport, verify_portfolio_assets
from .avatar_processor import AvatarBounds, analyze_avatar_cutout

__all__ = [
    "AvatarPlacementConfig",
    "PortfolioSlideConfig",
    "VideoAssetConfig",
    "CONTACT_INFO",
    "PORTFOLIO_SLIDES",
    "RESUME_ASSETS",
    "VIDEO_ASSET",
    "AssetVerificationReport",
    "AvatarBounds",
    "verify_portfolio_assets",
    "analyze_avatar_cutout",
]
