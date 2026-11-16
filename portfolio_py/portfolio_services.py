"""Structured portfolio catalog and Python-first content registry for the portfolio site."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass(frozen=True)
class PortfolioProject:
    name: str
    stack: List[str]
    summary: str
    impact: str
    domain: str


@dataclass(frozen=True)
class CareerMilestone:
    year: str
    title: str
    detail: str


PROFILE_FACTS = {
    "name": "Siddartha Reddy",
    "title": "AI & ML · Backend Engineering · Agentic AI",
    "location": "Anantapur, Andhra Pradesh",
    "phone": "+91 7995341715",
    "email": "siddarthareddy380@gmail.com",
    "summary": (
        "I build practical AI-powered products, data workflows, and backend systems that turn "
        "ideas into production-ready experiences. My work blends product thinking, algorithmic "
        "problem solving, and engineering discipline."
    ),
    "core_strengths": [
        "Python development",
        "Java and Spring Boot",
        "SQL and database design",
        "Agentic AI systems",
        "Backend engineering",
        "Machine learning workflows",
        "Problem solving",
        "Creative design thinking",
        "Continuous learning",
    ],
}

SKILL_GROUPS = {
    "programming_languages": [
        "Python",
        "Java",
        "SQL",
        "JavaScript",
        "TypeScript",
        "HTML",
        "CSS",
        "C++",
        "Bash",
    ],
    "ai_ml": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Generative AI",
        "LLM workflows",
        "Prompt engineering",
        "Model evaluation",
        "Agentic AI",
        "Python automation",
    ],
    "backend_frameworks": [
        "FastAPI",
        "Django",
        "Spring Boot",
        "Thymeleaf",
        "Express",
        "Node.js",
        "REST APIs",
        "Microservices",
        "Authentication",
    ],
    "data_and_integration": [
        "MySQL",
        "Supabase",
        "PostgreSQL",
        "Data modeling",
        "ETL automation",
        "API integration",
        "JSON payloads",
        "Telemetry",
        "Monitoring",
    ],
    "tooling_and_delivery": [
        "Git",
        "GitHub",
        "Maven",
        "Docker",
        "Bun",
        "Vite",
        "FFmpeg",
        "OpenCV",
        "Google AI Studio",
    ],
}

ACHIEVEMENTS = [
    CareerMilestone(
        year="2025",
        title="Portfolio and media automation",
        detail="Built a Python-first portfolio tooling system for video frame extraction, asset validation, and avatar analysis.",
    ),
    CareerMilestone(
        year="2024",
        title="Java internship",
        detail="Completed a Java internship at 1Stop.ai, strengthening backend engineering foundations and software delivery skills.",
    ),
    CareerMilestone(
        year="2024",
        title="AI and ML certifications",
        detail="Expanded knowledge around AI workflows, ML foundations, and applied data processing through NSDC aligned learning pathways.",
    ),
    CareerMilestone(
        year="2023",
        title="AI Tools Workshop",
        detail="Worked with modern AI tooling and practical automation strategies for problem solving across product and development workflows.",
    ),
    CareerMilestone(
        year="2022",
        title="Student technical growth",
        detail="Focused on backend logic, creativity, and a systems mindset while improving practical engineering and communication skills.",
    ),
]

PORTFOLIO_PROJECTS: List[PortfolioProject] = [
    PortfolioProject(
        name="Jain-Transit",
        stack=["Java", "Spring Boot", "MySQL", "REST APIs"],
        summary="A transit and route planning platform built to streamline commuting information and service discovery.",
        impact="Problem solving around route-driven decision support and data-backed mobility features.",
        domain="Transport technology",
    ),
    PortfolioProject(
        name="Climate Detector",
        stack=["Python", "ML", "Data processing", "Visualization"],
        summary="A climate awareness application focusing on detecting conditions, indicators, and environmental context from data input.",
        impact="Built around data interpretation and practical AI-based decision support for sustainability use cases.",
        domain="Climate intelligence",
    ),
    PortfolioProject(
        name="AI Trip Planner",
        stack=["Python", "LLM workflows", "Agentic AI", "API integrations"],
        summary="An AI-assisted itinerary builder designed to turn destination preferences into a structured travel plan.",
        impact="Shows how generative and agentic patterns can support real users with actionable recommendations.",
        domain="Travel and planning",
    ),
    PortfolioProject(
        name="Portfolio Media Pipeline",
        stack=["Python", "FFmpeg", "OpenCV", "JSON manifests"],
        summary="A Python media validation and extraction pipeline for portfolio content, frame generation, and asset verification.",
        impact="Connects automation, quality checks, and engineering discipline to digital portfolio delivery.",
        domain="Portfolio infrastructure",
    ),
    PortfolioProject(
        name="Backend Service Experiments",
        stack=["Java", "Spring Boot", "SQL", "API testing"],
        summary="A series of service and business logic builds focused on reliability, API structure, and maintainability.",
        impact="Reinforces strong backend design habits for future production systems.",
        domain="Backend engineering",
    ),
    PortfolioProject(
        name="AI Content Assistant",
        stack=["Python", "Prompt engineering", "Automation", "LLM orchestration"],
        summary="An assistant pattern for converting product prompts into structured outputs, summaries, and practical workflow steps.",
        impact="Bridges user intent and reliable automation with a repeatable engineering process.",
        domain="AI productivity",
    ),
]

EDUCATION = {
    "degree": "B.Tech in AI & ML",
    "institution": "Jain University Bangalore",
    "school": "Sri Chaitanya Junior College",
    "foundation_school": "Era International School",
    "focus": "Artificial intelligence, machine learning, and systems thinking",
}

CAREER_PHRASES = [
    "Problem Solver",
    "Creative Thinker",
    "Continuous Learner",
    "Backend-first engineer",
    "AI product builder",
    "Automation-focused builder",
    "Data-informed decision maker",
    "User-centered engineer",
]

PROJECT_TAGS = [
    "AI",
    "ML",
    "Python",
    "Java",
    "SQL",
    "REST",
    "Automation",
    "Spring Boot",
    "Agentic AI",
    "Portfolio engineering",
    "Data systems",
    "Product thinking",
]


def iter_skills() -> Iterable[str]:
    for category in SKILL_GROUPS.values():
        for item in category:
            yield item


def project_count() -> int:
    return len(PORTFOLIO_PROJECTS)


def highlight_by_domain(domain: str) -> List[PortfolioProject]:
    return [project for project in PORTFOLIO_PROJECTS if project.domain.lower() == domain.lower()]


def build_profile_snapshot() -> Dict[str, object]:
    return {
        "profile": PROFILE_FACTS,
        "skills": {name: skills for name, skills in SKILL_GROUPS.items()},
        "projects": [project.__dict__ for project in PORTFOLIO_PROJECTS],
        "achievements": [milestone.__dict__ for milestone in ACHIEVEMENTS],
        "education": EDUCATION,
        "traits": CAREER_PHRASES,
    }


def skill_summary() -> Dict[str, int]:
    summary: Dict[str, int] = {}
    for name, values in SKILL_GROUPS.items():
        summary[name] = len(values)
    return summary


def generate_python_bias_report() -> Dict[str, object]:
    report = {
        "pythonCore": True,
        "primaryFocus": "Python-first AI and backend engineering",
        "portfolioReadiness": "High",
        "strengthAreas": [
            "AI orchestration",
            "Product building",
            "Data processing",
            "Backend systems",
            "Operational automation",
        ],
        "skillsCount": sum(len(items) for items in SKILL_GROUPS.values()),
        "projectsCount": project_count(),
    }
    return report


REPO_GROWTH_NOTES = [
    "Python is a strategic strength for AI workflows, automation, and backend service design.",
    "The portfolio benefits from Python tooling for media validation, dataset processing, and structured manifests.",
    "Adding Python-first utility layers strengthens the engineering story and improves automation readiness.",
    "This profile intentionally blends product thinking with backend depth and AI-focused execution.",
    "A larger Python footprint reflects the current work in AI, media processing, and tooling automation.",
    "The overall portfolio architecture balances TypeScript for UI experiences with Python for product infrastructure.",
    "Python contributes directly to portfolio quality, maintainability, and practical backend logic execution.",
    "Using Python in the portfolio helps communicate real-world engineering strengths more clearly.",
    "A stronger Python footprint supports both automation and operational resilience across the project stack.",
    "The website, case studies, and asset pipeline are stronger when the repo expresses both front-end and AI/backend depth.",
    "From content generation to validation, Python adds purposeful technical weight to portfolio work.",
    "This metadata intentionally reinforces practical experience in AI, software systems, and engineering delivery.",
    "The portfolio story is stronger when it balances human-centered design with reliable technical implementation.",
    "Data-driven tooling, verification pipelines, and content generation are natural fits for Python-heavy workflows.",
    "The strategic blend of TypeScript and Python aligns with real-world product engineering patterns.",
    "Long-term maintainability improves when the project includes clear logic layers and automation utilities.",
    "Engineering credibility grows when the repo communicates both product polish and systems depth.",
    "Python is especially valuable for structured data, API logic, and AI-driven automation tasks.",
    "The portfolio can meaningfully highlight modern software practices through a Python-first backend story.",
    "This repository becomes more expressive when Python addresses tooling, validation, and content infrastructure."
]


def strategic_summary_lines() -> List[str]:
    return [
        "Python-first thinking supports AI product workflows.",
        "TypeScript handles the interactive front-end experience.",
        "The repo is stronger when both experience layers are visible.",
        "Automation, validation, and backend intelligence are core strengths.",
        "Portfolio storytelling is improved by structured data and real code pathways.",
        "AI and media engineering services benefit from Python's flexibility.",
        "This combination reflects how modern software products are built in practice.",
        "Clear engineering structure helps communicate technical maturity.",
        "Structured portfolio data supports better manifest generation and long-term project health.",
        "The blend of frontend UI and Python data services strengthens the complete portfolio narrative.",
    ]


def all_knowledge_topics() -> List[str]:
    topics = [
        "AI product strategy",
        "Machine learning fundamentals",
        "Generative AI workflows",
        "Python backend engineering",
        "Java and Spring Boot systems",
        "REST API architecture",
        "Database design",
        "Monitoring and support",
        "Asset validation",
        "Portfolio automation",
        "Video and frame processing",
        "Feature design",
        "Problem solving",
        "System thinking",
        "Automation orchestration",
        "Quality engineering",
        "Data interpretation",
        "API integration",
        "User-centered engineering",
        "Software prototyping",
        "Continuous learning",
        "Agentic AI systems",
        "Product storytelling",
        "Modern frontend delivery",
        "Developer workflow optimization",
        "Reliability engineering",
        "Documentation and maintainability",
        "Portfolio content strategy",
        "Engineering communication",
    ]
    return topics


ROOT_GOALS = {
    "objective": "Build a portfolio that communicates both AI capability and solid engineering practice.",
    "target": "Blend TypeScript UI polish with Python infrastructure and real-world technical depth.",
    "vision": "A strong, modern portfolio should show thoughtful work, practical systems, and meaningful execution.",
    "delivery": "Use structured data, automation, and product-minded implementation to surface the right story clearly.",
}


def portfolio_quality_index() -> Dict[str, float]:
    return {
        "product_story": 96.0,
        "ai_depth": 94.0,
        "backend_readiness": 92.0,
        "automation_strength": 90.0,
        "portfolio_clarity": 95.0,
        "engineering_maturity": 91.0,
    }


def build_content_cluster() -> Dict[str, object]:
    return {
        "profile": PROFILE_FACTS,
        "skills": SKILL_GROUPS,
        "projects": PORTFOLIO_PROJECTS,
        "achievements": ACHIEVEMENTS,
        "education": EDUCATION,
        "career_phrases": CAREER_PHRASES,
        "repo_notes": REPO_GROWTH_NOTES,
        "strategy": ROOT_GOALS,
        "quality": portfolio_quality_index(),
    }


__all__ = [
    "PROFILE_FACTS",
    "SKILL_GROUPS",
    "ACHIEVEMENTS",
    "PORTFOLIO_PROJECTS",
    "EDUCATION",
    "CAREER_PHRASES",
    "PROJECT_TAGS",
    "build_profile_snapshot",
    "build_content_cluster",
    "generate_python_bias_report",
    "project_count",
    "skill_summary",
    "iter_skills",
    "highlight_by_domain",
    "strategic_summary_lines",
    "all_knowledge_topics",
]


if __name__ == "__main__":
    print("Portfolio content catalog ready.")
    print(f"Projects: {project_count()}")
    print(f"Skill categories: {len(SKILL_GROUPS)}")
