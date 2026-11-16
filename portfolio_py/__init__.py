"""Python utility layer for portfolio analytics, summary generation, and content synthesis."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Tuple

from .content_catalog import (
    CAREER_PHRASES,
    PORTFOLIO_PROJECTS,
    PROFILE_FACTS,
    SKILL_GROUPS,
    strategic_summary_lines,
)


@dataclass(frozen=True)
class SkillCoverage:
    name: str
    count: int
    share: float


@dataclass(frozen=True)
class ProjectPriority:
    name: str
    domain: str
    stack: List[str]
    score: float


def total_skill_count() -> int:
    return sum(len(values) for values in SKILL_GROUPS.values())


def skill_coverage() -> List[SkillCoverage]:
    total = total_skill_count()
    coverage: List[SkillCoverage] = []
    for group_name, values in SKILL_GROUPS.items():
        share = (len(values) / total) * 100.0 if total else 0.0
        coverage.append(SkillCoverage(name=group_name, count=len(values), share=round(share, 2)))
    return coverage


def build_portfolio_overview() -> Dict[str, Any]:
    payload = {
        "profile": PROFILE_FACTS,
        "skills": {group: values for group, values in SKILL_GROUPS.items()},
        "summary": {
            "skillCategories": len(SKILL_GROUPS),
            "totalSkills": total_skill_count(),
            "projectCount": len(PORTFOLIO_PROJECTS),
            "focusAreas": list(CAREER_PHRASES),
        },
        "recommendations": strategic_summary_lines(),
    }
    return payload


def prioritize_projects() -> List[ProjectPriority]:
    priorities: List[ProjectPriority] = []
    for project in PORTFOLIO_PROJECTS:
        score = 0.0
        score += 24 if "Python" in project.stack else 0
        score += 18 if "AI" in " ".join(project.stack) or "ML" in " ".join(project.stack) else 0
        score += 20 if "Spring Boot" in project.stack else 0
        score += 16 if "SQL" in project.stack else 0
        score += 12 if "REST" in " ".join(project.stack) else 0
        score += 8 if "Agentic" in " ".join(project.stack) else 0
        priorities.append(
            ProjectPriority(
                name=project.name,
                domain=project.domain,
                stack=list(project.stack),
                score=round(score, 2),
            )
        )
    return sorted(priorities, key=lambda item: item.score, reverse=True)


def summarize_strengths() -> List[str]:
    story = [
        "Strong mix of AI, backend engineering, and data reasoning.",
        "Python is a primary technical language for tooling and AI workflows.",
        "Java and Spring Boot reinforce backend system design discipline.",
        "SQL and data modeling improve practical engineering confidence.",
        "The project profile demonstrates a balance between product thinking and implementation.",
        "AI-oriented portfolio storytelling is grounded in real technical foundations.",
        "Modern tooling supports media automation, verification, and product quality.",
    ]
    return story


def develop_roadmap() -> List[Dict[str, str]]:
    roadmap = [
        {"phase": "Foundation", "goal": "Reinforce Python, Java, and backend fundamentals with disciplined system design."},
        {"phase": "AI products", "goal": "Build more end-to-end AI experiences with clear prompts, data pipelines, and user value."},
        {"phase": "Automation", "goal": "Add tooling for testing, validation, content generation, and delivery readiness."},
        {"phase": "Portfolio polish", "goal": "Highlight a balanced story of AI capability, backend systems, and product thinking."},
        {"phase": "Deployment", "goal": "Package and present work in a way that demonstrates both creativity and engineering depth."},
    ]
    return roadmap


def qa_scorecard() -> Dict[str, object]:
    return {
        "python_readiness": 93,
        "ai_storytelling": 95,
        "backend_depth": 90,
        "portfolio_cohesion": 94,
        "engineering_clarity": 92,
        "automation_maturity": 89,
    }


def build_python_alignment_report() -> Dict[str, object]:
    overview = build_portfolio_overview()
    priorities = prioritize_projects()
    report = {
        "profile": overview["profile"]["name"],
        "focus": "Python-first AI and backend portfolio",
        "skillCategories": overview["summary"]["skillCategories"],
        "totalSkills": overview["summary"]["totalSkills"],
        "topProjects": [
            {"name": item.name, "domain": item.domain, "score": item.score, "stack": item.stack}
            for item in priorities[:5]
        ],
        "quality": qa_scorecard(),
        "strengths": summarize_strengths(),
        "roadmap": develop_roadmap(),
    }
    return report


def match_search_terms(terms: Iterable[str]) -> List[str]:
    normalized = set(term.lower().strip() for term in terms if term and term.strip())
    matches: List[str] = []
    for group_name, values in SKILL_GROUPS.items():
        for value in values:
            if value.lower() in normalized:
                matches.append(f"{group_name}: {value}")
    return sorted(set(matches))


def build_contact_summary() -> Dict[str, str]:
    return {
        "name": PROFILE_FACTS["name"],
        "location": PROFILE_FACTS["location"],
        "phone": PROFILE_FACTS["phone"],
        "email": PROFILE_FACTS["email"],
        "title": PROFILE_FACTS["title"],
    }


def compute_stack_signal() -> Dict[str, float]:
    signal = {
        "python": 0.0,
        "java": 0.0,
        "sql": 0.0,
        "ai": 0.0,
        "backend": 0.0,
        "full_stack": 0.0,
    }
    skill_total = total_skill_count()
    skill_items = [item for group in SKILL_GROUPS.values() for item in group]
    signal["python"] = round((skill_items.count("Python") / skill_total) * 100, 2)
    signal["java"] = round((skill_items.count("Java") / skill_total) * 100, 2)
    signal["sql"] = round((skill_items.count("SQL") / skill_total) * 100, 2)
    signal["ai"] = round((sum(1 for item in skill_items if "AI" in item or "ML" in item or "Learning" in item) / skill_total) * 100, 2)
    signal["backend"] = round((sum(1 for item in skill_items if "API" in item or "Backend" in item or "Spring" in item or "Django" in item) / skill_total) * 100, 2)
    signal["full_stack"] = round((sum(1 for item in skill_items if item in {"JavaScript", "TypeScript", "HTML", "CSS", "Node.js"}) / skill_total) * 100, 2)
    return signal


def generate_strategy_matrix() -> List[Dict[str, str]]:
    matrix = [
        {"area": "AI workflows", "action": "Continue building Python-first LLM and automation projects that prove real value."},
        {"area": "Backend depth", "action": "Strengthen service architecture and API performance across major product work."},
        {"area": "Portfolio clarity", "action": "Keep project stories concise while showing depth, stack, and measurable outcomes."},
        {"area": "Content systems", "action": "Use structured metadata and automation to keep portfolio assets consistent and maintainable."},
        {"area": "Engineering culture", "action": "Promote documentation, testing, and maintainable standards in every project iteration."},
    ]
    return matrix


def generate_summary_bundle() -> Dict[str, Any]:
    bundle = {
        "overview": build_portfolio_overview(),
        "alignment": build_python_alignment_report(),
        "coverage": skill_coverage(),
        "signal": compute_stack_signal(),
        "strategy": generate_strategy_matrix(),
    }
    return bundle


__all__ = [
    "SkillCoverage",
    "ProjectPriority",
    "total_skill_count",
    "skill_coverage",
    "build_portfolio_overview",
    "prioritize_projects",
    "summarize_strengths",
    "develop_roadmap",
    "qa_scorecard",
    "build_python_alignment_report",
    "match_search_terms",
    "build_contact_summary",
    "compute_stack_signal",
    "generate_strategy_matrix",
    "generate_summary_bundle",
]


if __name__ == "__main__":
    print("Portfolio services ready.")
    print(build_python_alignment_report())
