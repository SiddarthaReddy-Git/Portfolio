"""Portfolio package exports."""

from .content_catalog import (
    ACHIEVEMENTS,
    CAREER_PHRASES,
    EDUCATION,
    PORTFOLIO_PROJECTS,
    PROFILE_FACTS,
    SKILL_GROUPS,
    build_content_cluster,
    build_profile_snapshot,
    generate_python_bias_report,
    project_count,
    skill_summary,
)
from .portfolio_services import (
    build_portfolio_overview,
    build_python_alignment_report,
    compute_stack_signal,
    generate_summary_bundle,
    prioritize_projects,
    skill_coverage,
)

__all__ = [
    "PROFILE_FACTS",
    "SKILL_GROUPS",
    "ACHIEVEMENTS",
    "PORTFOLIO_PROJECTS",
    "EDUCATION",
    "CAREER_PHRASES",
    "project_count",
    "skill_summary",
    "build_profile_snapshot",
    "build_content_cluster",
    "generate_python_bias_report",
    "build_portfolio_overview",
    "skill_coverage",
    "prioritize_projects",
    "build_python_alignment_report",
    "compute_stack_signal",
    "generate_summary_bundle",
]


if __name__ == "__main__":
    print("Portfolio package initialized.")
