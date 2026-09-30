"""
Dynamic Resume-Driven Question Generator for PREPRIA AI Career Platform (Phase 6).

Combines:
- Parsed resume evidence (skills, projects, experience, education, certifications, keywords)
- Target job role context & relevance
- Previous interview session history & identified weak topics
- Current interview session number
- Phase 4 adaptive questioning logic
- Strict zero-fabrication auditing (never claims candidate used X unless X exists in resume)
- Exact/near-duplicate question filtering
"""

import re
import random
import uuid
from typing import List, Dict, Any, Optional, Set

# Import existing role question database & helper functions to preserve existing behavior
from app.services.question_generator import COMMON_HR_QUESTIONS, ROLE_QUESTIONS, generate_questions_for_role

# Role topic relevance maps
ROLE_RELEVANCE_MAPS = {
    "Frontend Developer": {
        "primary_skills": ["react", "javascript", "typescript", "html", "css", "vue", "angular", "ui/ux", "frontend"],
        "core_topics": ["React Architecture", "JavaScript Core", "State Management", "Frontend Optimization", "Web Security", "UI Engineering"]
    },
    "Backend Developer": {
        "primary_skills": ["python", "fastapi", "django", "flask", "node", "node.js", "express", "java", "spring boot", "sql", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "apis", "redis"],
        "core_topics": ["API Design", "Database Architecture", "SQL Indexing", "System Scalability", "Caching Strategies", "Distributed Systems"]
    },
    "Full Stack Developer": {
        "primary_skills": ["react", "javascript", "typescript", "python", "fastapi", "node", "node.js", "sql", "postgresql", "mysql", "mongodb", "html", "css", "git", "docker"],
        "core_topics": ["Web Fundamentals", "HTTP Protocols", "Database Architecture", "React Architecture", "Frontend Optimization", "System Scalability"]
    },
    "Python Engineer": {
        "primary_skills": ["python", "fastapi", "django", "flask", "asyncio", "sql", "postgresql", "docker", "git"],
        "core_topics": ["Python Core", "AsyncIO", "Metaclasses", "Memory Management", "API Design", "Database Performance & Indexing"]
    },
    "Data Scientist": {
        "primary_skills": ["python", "machine learning", "data science", "nlp", "sql", "artificial intelligence", "pandas", "numpy"],
        "core_topics": ["Machine Learning Fundamentals", "Model Validation", "Optimization Algorithms", "Data Preprocessing", "Model Generalization"]
    },
    "AI Engineer": {
        "primary_skills": ["python", "artificial intelligence", "machine learning", "nlp", "deep learning", "transformers", "pytorch", "tensorflow"],
        "core_topics": ["AI Fundamentals", "Neural Network Architectures", "Transformer Models", "Model Debugging", "AsyncIO"]
    },
    "Data Analyst": {
        "primary_skills": ["sql", "excel", "pivot", "vlookup", "analysis", "data science", "python"],
        "core_topics": ["SQL Fundamentals", "Data Cleaning", "SQL Advanced", "Analysis"]
    },
    "HR Executive": {
        "primary_skills": ["management", "leadership", "communication", "recruiting", "customer service"],
        "core_topics": ["Recruiting Lifecycle", "Talent Analytics", "Performance Management", "Communication & Alignment"]
    },
    "Marketing Executive": {
        "primary_skills": ["marketing", "seo", "analysis", "communication", "sales"],
        "core_topics": ["SEO Strategies", "Conversion Rate Optimization", "Campaign Post-Mortem"]
    },
    "UI/UX Designer": {
        "primary_skills": ["ui/ux", "design", "html", "css", "figma", "wireframing"],
        "core_topics": ["Design Theory", "Wireframing & Prototyping", "Stakeholder Management"]
    },
    "Civil Engineer": {
        "primary_skills": ["engineering", "construction", "management"],
        "core_topics": ["Structural Foundations", "Material Mechanics", "Site Safety Compliance"]
    }
}


def normalize_resume_evidence(raw_resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Constructs a normalized, structured resume evidence model from a raw resume profile.
    Preserves exact evidence type, value, and source ("resume").
    Collects a set of all claimed items (skills, tech, project names, companies, roles)
    for strict anti-fabrication checking.
    """
    if not isinstance(raw_resume_data, dict):
        raw_resume_data = {}

    skills_list = []
    claimed_items = set()

    # 1. Normalize Skills
    raw_skills = raw_resume_data.get("skills") or []
    if isinstance(raw_skills, list):
        for s in raw_skills:
            if isinstance(s, str) and s.strip():
                clean_s = s.strip()
                skills_list.append({
                    "type": "skill",
                    "value": clean_s,
                    "source": "resume"
                })
                claimed_items.add(clean_s.lower())

    # Technical vs Soft skills breakdown
    raw_tech = raw_resume_data.get("technicalSkills") or []
    if isinstance(raw_tech, list):
        for t in raw_tech:
            if isinstance(t, str) and t.strip():
                clean_t = t.strip()
                claimed_items.add(clean_t.lower())
                if not any(s["value"].lower() == clean_t.lower() for s in skills_list):
                    skills_list.append({
                        "type": "skill",
                        "value": clean_t,
                        "source": "resume"
                    })

    # 2. Normalize Projects
    projects_list = []
    raw_projects = raw_resume_data.get("projects") or []

    if isinstance(raw_projects, list):
        for p in raw_projects:
            if isinstance(p, dict):
                p_name = p.get("name") or p.get("title") or "Unnamed Project"
                techs = p.get("technologies") or p.get("techStack") or []
                if isinstance(techs, str):
                    techs = [t.strip() for t in techs.split(",") if t.strip()]
                desc = p.get("description") or ""
                proj_obj = {
                    "type": "project",
                    "name": p_name.strip(),
                    "technologies": [t.strip() for t in techs if isinstance(t, str)],
                    "description": desc.strip(),
                    "source": "resume"
                }
                projects_list.append(proj_obj)
                claimed_items.add(p_name.strip().lower())
                for t in proj_obj["technologies"]:
                    claimed_items.add(t.lower())
            elif isinstance(p, str) and p.strip():
                proj_name = p.strip()
                projects_list.append({
                    "type": "project",
                    "name": proj_name,
                    "technologies": [],
                    "description": "",
                    "source": "resume"
                })
                claimed_items.add(proj_name.lower())

    # 3. Normalize Experience
    experience_list = []
    raw_exp = raw_resume_data.get("experience") or []

    if isinstance(raw_exp, list):
        for e in raw_exp:
            if isinstance(e, dict):
                title = e.get("title") or e.get("role") or "Role"
                company = e.get("company") or e.get("organization") or "Organization"
                resp = e.get("responsibilities") or e.get("description") or []
                if isinstance(resp, str):
                    resp = [resp]
                techs = e.get("technologies") or []
                if isinstance(techs, str):
                    techs = [t.strip() for t in techs.split(",") if t.strip()]

                exp_obj = {
                    "type": "experience",
                    "title": title.strip(),
                    "company": company.strip(),
                    "responsibilities": [r.strip() for r in resp if isinstance(r, str)],
                    "technologies": [t.strip() for t in techs if isinstance(t, str)],
                    "source": "resume"
                }
                experience_list.append(exp_obj)
                claimed_items.add(title.strip().lower())
                claimed_items.add(company.strip().lower())
                for t in exp_obj["technologies"]:
                    claimed_items.add(t.lower())
            elif isinstance(e, str) and e.strip() and e.lower() != "not found":
                experience_list.append({
                    "type": "experience",
                    "title": e.strip(),
                    "company": "Company",
                    "responsibilities": [],
                    "technologies": [],
                    "source": "resume"
                })
                claimed_items.add(e.strip().lower())

    elif isinstance(raw_exp, str) and raw_exp.strip() and raw_exp.lower() != "not found":
        experience_list.append({
            "type": "experience",
            "title": raw_exp.strip(),
            "company": "Company",
            "responsibilities": [],
            "technologies": [],
            "source": "resume"
        })
        claimed_items.add(raw_exp.strip().lower())

    # 4. Normalize Education
    education_list = []
    raw_edu = raw_resume_data.get("education") or []
    if isinstance(raw_edu, list):
        for edu in raw_edu:
            if isinstance(edu, dict):
                degree = edu.get("degree") or "Degree"
                field = edu.get("field") or edu.get("major") or ""
                education_list.append({
                    "type": "education",
                    "degree": degree.strip(),
                    "field": field.strip(),
                    "source": "resume"
                })
                claimed_items.add(degree.strip().lower())
                if field:
                    claimed_items.add(field.strip().lower())
            elif isinstance(edu, str) and edu.strip() and edu.lower() != "not found":
                education_list.append({
                    "type": "education",
                    "degree": edu.strip(),
                    "field": "",
                    "source": "resume"
                })
                claimed_items.add(edu.strip().lower())
    elif isinstance(raw_edu, str) and raw_edu.strip() and raw_edu.lower() != "not found":
        education_list.append({
            "type": "education",
            "degree": raw_edu.strip(),
            "field": "",
            "source": "resume"
        })
        claimed_items.add(raw_edu.strip().lower())

    # 5. Certifications
    certifications_list = []
    raw_certs = raw_resume_data.get("certifications") or raw_resume_data.get("certificates") or []
    if isinstance(raw_certs, list):
        for c in raw_certs:
            if isinstance(c, dict):
                c_name = c.get("name") or c.get("title") or "Certification"
                certifications_list.append({
                    "type": "certification",
                    "name": c_name.strip(),
                    "source": "resume"
                })
                claimed_items.add(c_name.strip().lower())
            elif isinstance(c, str) and c.strip():
                certifications_list.append({
                    "type": "certification",
                    "name": c.strip(),
                    "source": "resume"
                })
                claimed_items.add(c.strip().lower())
    elif isinstance(raw_certs, str) and raw_certs.strip():
        certifications_list.append({
            "type": "certification",
            "name": raw_certs.strip(),
            "source": "resume"
        })
        claimed_items.add(raw_certs.strip().lower())

    # 6. Keywords
    raw_keywords = raw_resume_data.get("keywords") or []
    keywords_list = []
    if isinstance(raw_keywords, list):
        for kw in raw_keywords:
            if isinstance(kw, str) and kw.strip():
                keywords_list.append(kw.strip())
                claimed_items.add(kw.strip().lower())

    return {
        "skills": skills_list,
        "projects": projects_list,
        "experience": experience_list,
        "education": education_list,
        "certifications": certifications_list,
        "keywords": keywords_list,
        "claimed_items": claimed_items,
        "has_resume": bool(skills_list or projects_list or experience_list or education_list or certifications_list)
    }


def is_claimed_in_resume(term: str, evidence: Dict[str, Any]) -> bool:
    """
    Checks if a term/technology/skill is explicitly claimed in the candidate's resume evidence.
    """
    if not term or not isinstance(term, str):
        return False
    term_lower = term.strip().lower()
    claimed = evidence.get("claimed_items", set())
    if term_lower in claimed:
        return True
    return any(term_lower in c for c in claimed if len(c) > 2)


def normalize_question_text(text: str) -> str:
    """Normalizes question string for deduplication."""
    if not text:
        return ""
    clean = re.sub(r'[^\w\s]', '', text.lower())
    return " ".join(clean.split())


def is_duplicate_question(new_question: str, asked_questions: Set[str]) -> bool:
    """
    Compares normalized new question against set of previously asked normalized questions.
    """
    norm_new = normalize_question_text(new_question)
    if not norm_new:
        return True
    if norm_new in asked_questions:
        return True
    # Word jaccard similarity check for near duplicates
    words_new = set(norm_new.split())
    for asked in asked_questions:
        words_asked = set(asked.split())
        intersection = len(words_new & words_asked)
        union = len(words_new | words_asked)
        if union > 0 and (intersection / union) > 0.82:
            return True
    return False


def build_project_deep_dive_questions(project: Dict[str, Any], evidence: Dict[str, Any], role: str, interview_number: int = 1) -> List[Dict[str, Any]]:
    """
    Generates deep dive questions for a specific project found in the resume.
    Rotates question aspects based on interview_number to ensure diversity across sessions.
    Ensures that questions ONLY reference technologies/facts claimed in the resume.
    """
    proj_name = project.get("name", "your project")
    techs = project.get("technologies", [])
    primary_tech = techs[0] if techs else None

    # Filter techs to ensure only claimed items are referenced
    claimed_techs = [t for t in techs if is_claimed_in_resume(t, evidence)]
    tech_ref = claimed_techs[0] if claimed_techs else (primary_tech if primary_tech and is_claimed_in_resume(primary_tech, evidence) else None)

    questions = []

    # Level 1: Overview
    q1 = {
        "question": f"Can you give an overview of your project '{proj_name}' and explain the primary problem it solved?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "Project Overview",
        "difficulty": "easy",
        "type": "project"
    }

    # Level 2: Tech Decisions
    q2 = {
        "question": f"In your project '{proj_name}', why did you choose to use {tech_ref}, and what advantages did it provide?" if tech_ref else f"What core technologies did you choose for your project '{proj_name}', and why were they selected?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": f"{tech_ref} Architecture" if tech_ref else "Tech Stack Decisions",
        "difficulty": "medium",
        "type": "project"
    }

    # Level 3: Architecture
    q3 = {
        "question": f"How was the system architecture structured in '{proj_name}' and how did the components communicate with each other?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "System Architecture",
        "difficulty": "medium",
        "type": "project"
    }

    # Level 4: Implementation Details
    q4 = {
        "question": f"Can you walk through the technical implementation details of a critical module or feature you personally wrote in '{proj_name}'?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "Implementation Details",
        "difficulty": "medium",
        "type": "project"
    }

    # Level 5: Problems / Challenges
    q5 = {
        "question": f"What was the most difficult technical bug or challenge you encountered while developing '{proj_name}', and how did you debug and resolve it?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "Problem Solving & Debugging",
        "difficulty": "hard",
        "type": "project"
    }

    # Level 6: Debugging / Scaling
    q6 = {
        "question": f"If '{proj_name}' experienced a tenfold increase in active traffic, what bottlenecks would emerge and how would you scale it?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "Scalability & Performance",
        "difficulty": "hard",
        "type": "project"
    }

    # Level 7: Trade-offs
    q7 = {
        "question": f"Looking back at '{proj_name}', what architectural or design trade-offs did you make, and what would you refactor today?",
        "source": "resume",
        "sourceType": "project",
        "sourceEntity": proj_name,
        "sourceValue": proj_name,
        "topic": "Architectural Trade-offs",
        "difficulty": "hard",
        "type": "project"
    }

    # Rotate priorities based on interview_number
    if interview_number == 1:
        questions = [q1, q2, q3, q4, q5, q6, q7]
    elif interview_number == 2:
        questions = [q4, q5, q3, q2, q6, q7, q1]
    else:
        questions = [q6, q7, q5, q4, q3, q2, q1]

    return questions


def build_certification_questions(cert: Dict[str, Any], role: str) -> List[Dict[str, Any]]:
    """Generates questions grounded in candidate's actual resume certifications."""
    c_name = cert.get("name") if isinstance(cert, dict) else str(cert)
    return [{
        "question": f"In your resume, you listed the certification '{c_name}'. How has the knowledge gained from this certification directly influenced your technical decisions?",
        "source": "resume",
        "sourceType": "certification",
        "sourceEntity": c_name,
        "sourceValue": c_name,
        "topic": f"{c_name} Certification",
        "difficulty": "medium",
        "type": "certification"
    }]


def build_responsibility_questions(title: str, company: str, resp: str) -> List[Dict[str, Any]]:
    """Generates questions grounded in specific candidate experience responsibilities."""
    return [{
        "question": f"In your resume under {title}, you mentioned: '{resp}'. Can you walk through how you implemented this and what key design choices you made?",
        "source": "resume",
        "sourceType": "responsibility",
        "sourceEntity": resp,
        "sourceValue": resp,
        "topic": "Key Responsibility",
        "difficulty": "medium",
        "type": "experience"
    }]


def build_skill_questions(skill_name: str, role: str) -> List[Dict[str, Any]]:
    """
    Generates skill-specific technical questions for a skill explicitly present in candidate's resume.
    """
    skill_lower = skill_name.lower()
    questions = []

    if "react" in skill_lower:
        questions.append({
            "question": "You listed React in your resume. Explain how you used React in your projects and how you handle component state and rendering lifecycle.",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "React Architecture",
            "difficulty": "medium",
            "type": "technical"
        })
        questions.append({
            "question": "When working with React, how do you prevent unnecessary re-renders and optimize component performance in large applications?",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "Frontend Optimization",
            "difficulty": "hard",
            "type": "technical"
        })

    elif "fastapi" in skill_lower:
        questions.append({
            "question": "You mentioned FastAPI in your resume. How did you structure your API routes, request validation, and asynchronous endpoints?",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "API Design",
            "difficulty": "medium",
            "type": "technical"
        })

    elif "postgresql" in skill_lower or "postgres" in skill_lower:
        questions.append({
            "question": "You listed PostgreSQL in your resume. Explain how PostgreSQL was used in your project and how you designed the data model or indexing strategy.",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "Database Architecture",
            "difficulty": "medium",
            "type": "technical"
        })

    elif "python" in skill_lower:
        questions.append({
            "question": "You included Python in your resume skills. How have you used Python for backend or data processing tasks, and how do you handle memory or concurrency?",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "Python Core",
            "difficulty": "medium",
            "type": "technical"
        })

    elif "java" in skill_lower or "spring" in skill_lower:
        questions.append({
            "question": "You listed Java / Spring Boot in your resume. How did you structure dependency injection and enterprise services in your application?",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "Java Architecture",
            "difficulty": "medium",
            "type": "technical"
        })

    elif "sql" in skill_lower or "mysql" in skill_lower or "mongodb" in skill_lower:
        questions.append({
            "question": f"You mentioned {skill_name} in your resume. How did you design database schemas and write optimized queries for your project?",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": "Database Architecture",
            "difficulty": "medium",
            "type": "technical"
        })

    else:
        questions.append({
            "question": f"Explain how you utilized {skill_name} in your recent work or projects, and what technical challenges you solved with it.",
            "source": "resume",
            "sourceType": "skill",
            "sourceValue": skill_name,
            "topic": f"{skill_name} Practical Application",
            "difficulty": "medium",
            "type": "technical"
        })

    return questions


def build_experience_questions(exp: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates questions around actual work / internship experience explicitly mentioned in resume.
    Never invents an employer responsibility.
    """
    title = exp.get("title", "role")
    company = exp.get("company", "organization")
    techs = exp.get("technologies", [])
    resps = exp.get("responsibilities", [])

    questions = []

    if company and company.lower() != "company" and title and title.lower() != "role":
        questions.append({
            "question": f"What were your key technical responsibilities and individual contributions during your experience as {title} at {company}?",
            "source": "resume",
            "sourceType": "experience",
            "sourceValue": f"{title} at {company}",
            "topic": "Professional Experience",
            "difficulty": "medium",
            "type": "experience"
        })
    elif "intern" in title.lower() or "internship" in title.lower():
        questions.append({
            "question": f"What were your main responsibilities during your internship and what technical decisions did you personally make?",
            "source": "resume",
            "sourceType": "experience",
            "sourceValue": title,
            "topic": "Internship Experience",
            "difficulty": "medium",
            "type": "experience"
        })
    else:
        questions.append({
            "question": f"Walk me through your practical experience as {title}. What technical challenges did you take ownership of?",
            "source": "resume",
            "sourceType": "experience",
            "sourceValue": title,
            "topic": "Professional Experience",
            "difficulty": "medium",
            "type": "experience"
        })

    if techs:
        t_ref = techs[0]
        questions.append({
            "question": f"In your role as {title}, how did you apply {t_ref} to deliver measurable outcomes or improvements?",
            "source": "resume",
            "sourceType": "experience",
            "sourceValue": f"{title} ({t_ref})",
            "topic": f"{t_ref} Industry Practice",
            "difficulty": "medium",
            "type": "experience"
        })

    return questions


def build_weakness_remediation_questions(
    weak_topic: str,
    evidence: Dict[str, Any],
    role: str
) -> Dict[str, Any]:
    """
    Combines authentic previous weakness with candidate's actual resume evidence when available.
    Example: Weakness = "Database Performance & Indexing", Resume contains "PostgreSQL"
    -> "You mentioned PostgreSQL in your project. How would you identify and optimize a slow query in that application?"
    """
    weak_lower = weak_topic.lower()
    claimed = evidence.get("claimed_items", set())

    # Check for matching resume evidence
    matching_skill = None
    if "database" in weak_lower or "sql" in weak_lower or "indexing" in weak_lower or "query" in weak_lower:
        for sk in ["postgresql", "postgres", "mysql", "sql", "mongodb"]:
            if is_claimed_in_resume(sk, evidence):
                matching_skill = sk.capitalize() if sk != "postgresql" else "PostgreSQL"
                break
    elif "react" in weak_lower or "frontend" in weak_lower:
        if is_claimed_in_resume("react", evidence):
            matching_skill = "React"
    elif "api" in weak_lower or "rest" in weak_lower:
        for sk in ["fastapi", "express", "django", "node"]:
            if is_claimed_in_resume(sk, evidence):
                matching_skill = sk.capitalize()
                break

    if matching_skill:
        return {
            "question": f"You mentioned {matching_skill} in your project. Based on your previous session feedback on {weak_topic}, how would you identify and optimize performance bottlenecks in that application?",
            "source": "weakness",
            "sourceType": "weakness",
            "sourceValue": weak_topic,
            "topic": weak_topic,
            "difficulty": "hard",
            "type": "technical",
            "isTargetedRemediation": True,
            "targetedWeakness": weak_topic
        }
    else:
        # Generate targeted remediation question for the weakness without fabricating resume claims
        return {
            "question": f"In a previous interview, {weak_topic} was identified as an area for growth. How would you systematically troubleshoot and resolve an issue in this area for a {role} role?",
            "source": "weakness",
            "sourceType": "weakness",
            "sourceValue": weak_topic,
            "topic": weak_topic,
            "difficulty": "medium",
            "type": "technical",
            "isTargetedRemediation": True,
            "targetedWeakness": weak_topic
        }


def build_hypothetical_role_question(role: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a hypothetical question for role requirements NOT present in candidate's resume.
    Strictly avoids claiming candidate used the tech.
    """
    role_info = ROLE_RELEVANCE_MAPS.get(role, ROLE_RELEVANCE_MAPS["Full Stack Developer"])
    unclaimed_techs = [t for t in ["docker", "kubernetes", "redis", "aws", "graphql", "microservices"] if not is_claimed_in_resume(t, evidence)]
    
    selected_tech = unclaimed_techs[0] if unclaimed_techs else "Docker"
    
    return {
        "question": f"Suppose this application needed to be deployed using {selected_tech.capitalize()}. How would you approach the deployment, containerization, and environment configuration?",
        "source": "role",
        "sourceType": "role",
        "sourceValue": role,
        "topic": f"{selected_tech.capitalize()} Deployment",
        "difficulty": "medium",
        "type": "technical"
    }


def generate_follow_up_question(
    question_text: str,
    candidate_answer: str,
    user_profile: Dict[str, Any],
    role: str
) -> Dict[str, Any]:
    """
    Generates a dynamic follow-up question grounded strictly in candidate's answer & resume context.
    Prevents hallucination or fabricating facts not stated by candidate or resume.
    """
    ans_clean = (candidate_answer or "").strip()
    evidence = normalize_resume_evidence(user_profile)
    
    # Extract candidate-mentioned technologies or keywords from candidate_answer
    mentioned_techs = [t for t in evidence["claimed_items"] if t in ans_clean.lower() and len(t) > 2]
    
    if "jwt" in ans_clean.lower() or "auth" in ans_clean.lower():
        return {
            "question": "Regarding your mention of authentication, how did you handle token expiration, secret management, and user data isolation in that implementation?",
            "source": "followup",
            "sourceType": "followup",
            "sourceEntity": "Authentication",
            "sourceValue": "Authentication",
            "topic": "Authentication & Security",
            "difficulty": "medium",
            "type": "technical",
            "isFollowUp": True
        }
    elif "microservices" in ans_clean.lower() or "distributed" in ans_clean.lower():
        return {
            "question": "Since you mentioned microservices architecture, how did services communicate asynchronously and handle failure recovery or data consistency?",
            "source": "followup",
            "sourceType": "followup",
            "sourceEntity": "Microservices",
            "sourceValue": "Microservices",
            "topic": "Distributed Communication",
            "difficulty": "hard",
            "type": "technical",
            "isFollowUp": True
        }
    elif mentioned_techs:
        tech = mentioned_techs[0].capitalize()
        return {
            "question": f"Building on your answer regarding {tech}, what specific edge cases or performance bottlenecks did you address when implementing it?",
            "source": "followup",
            "sourceType": "followup",
            "sourceEntity": tech,
            "sourceValue": tech,
            "topic": f"{tech} Implementation Deep-Dive",
            "difficulty": "hard",
            "type": "technical",
            "isFollowUp": True
        }
    else:
        return {
            "question": "Can you elaborate further on the architectural trade-offs of that approach and what alternative solutions you considered?",
            "source": "followup",
            "sourceType": "followup",
            "sourceEntity": "Architecture",
            "sourceValue": "Architecture",
            "topic": "Architectural Trade-offs",
            "difficulty": "medium",
            "type": "technical",
            "isFollowUp": True
        }


def generate_resume_driven_questions(
    user_profile: Dict[str, Any],
    role: str,
    interview_number: int = 1,
    count: int = 10,
    previous_sessions: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Main entry point for Phase 7 dynamic resume-driven question generation.
    Generates candidate-specific, auditable interview questions derived from parsed resume evidence.
    """
    if count <= 0:
        count = 10
    count = min(count, 20)

    evidence = normalize_resume_evidence(user_profile)
    previous_sessions = previous_sessions or []

    # Collect previously asked normalized questions, weak topics, and strong topics for longitudinal adaptation
    asked_norm_questions = set()
    weak_topics_set = set()
    strong_topics_set = set()
    prior_scores = []

    for sess in previous_sessions:
        q_evals = sess.get("questionEvaluations") or []
        for qe in q_evals:
            q_text = qe.get("question") or qe.get("questionText")
            if q_text:
                asked_norm_questions.add(normalize_question_text(q_text))
            topic = qe.get("topic")
            score = qe.get("score", 100)
            if topic and topic != "General":
                if score < 70:
                    weak_topics_set.add(topic)
                elif score >= 80:
                    strong_topics_set.add(topic)

        improvements = sess.get("improvements") or []
        for imp in improvements:
            if isinstance(imp, dict) and imp.get("topic"):
                weak_topics_set.add(imp["topic"])
            elif isinstance(imp, str) and imp.strip():
                weak_topics_set.add(imp.strip())

        s_val = sess.get("overallScore") if sess.get("overallScore") is not None else sess.get("score")
        if s_val is not None:
            prior_scores.append(s_val)

    weak_topics_list = list(weak_topics_set)
    selected_questions: List[Dict[str, Any]] = []

    # 1. WEAKNESS REMEDIATION QUESTIONS (Interview #2+)
    if interview_number > 1 and weak_topics_list:
        target_weakness_count = max(1, int(round(count * 0.4)))
        for wt in weak_topics_list:
            if len(selected_questions) >= target_weakness_count:
                break
            w_q = build_weakness_remediation_questions(wt, evidence, role)
            if not is_duplicate_question(w_q["question"], asked_norm_questions):
                selected_questions.append(w_q)
                asked_norm_questions.add(normalize_question_text(w_q["question"]))

    # 2. PROJECT DEEP-DIVE QUESTIONS (~30% for Interview #1, or fill slots)
    if evidence["projects"]:
        for proj in evidence["projects"]:
            proj_qs = build_project_deep_dive_questions(proj, evidence, role, interview_number)
            for q in proj_qs:
                if len(selected_questions) >= count:
                    break
                if not is_duplicate_question(q["question"], asked_norm_questions):
                    selected_questions.append(q)
                    asked_norm_questions.add(normalize_question_text(q["question"]))
                if len([x for x in selected_questions if x.get("sourceType") == "project"]) >= max(2, int(round(count * 0.3))):
                    break

    # 3. SKILL-BASED QUESTIONS (~25%)
    if evidence["skills"]:
        role_info = ROLE_RELEVANCE_MAPS.get(role, ROLE_RELEVANCE_MAPS["Full Stack Developer"])
        rel_skills = role_info.get("primary_skills", [])

        sorted_skills = sorted(
            evidence["skills"],
            key=lambda s: 0 if any(r in s["value"].lower() for r in rel_skills) else 1
        )

        for sk in sorted_skills:
            if len(selected_questions) >= count:
                break
            sk_qs = build_skill_questions(sk["value"], role)
            for q in sk_qs:
                # Strong topics adaptation: upgrade difficulty if candidate previously mastered this topic
                if q.get("topic") in strong_topics_set and q.get("difficulty") == "easy":
                    q["difficulty"] = "hard"
                if not is_duplicate_question(q["question"], asked_norm_questions):
                    selected_questions.append(q)
                    asked_norm_questions.add(normalize_question_text(q["question"]))
                    break

    # 4. CERTIFICATION QUESTIONS
    if evidence.get("certifications") and len(selected_questions) < count:
        for cert in evidence["certifications"]:
            if len(selected_questions) >= count:
                break
            c_qs = build_certification_questions(cert, role)
            for q in c_qs:
                if not is_duplicate_question(q["question"], asked_norm_questions):
                    selected_questions.append(q)
                    asked_norm_questions.add(normalize_question_text(q["question"]))
                    break

    # 5. EXPERIENCE QUESTIONS (~15%)
    if evidence["experience"]:
        for exp in evidence["experience"]:
            if len(selected_questions) >= count:
                break
            exp_qs = build_experience_questions(exp)
            for q in exp_qs:
                if not is_duplicate_question(q["question"], asked_norm_questions):
                    selected_questions.append(q)
                    asked_norm_questions.add(normalize_question_text(q["question"]))
                    break

    # 6. HYPOTHETICAL ROLE-SPECIFIC QUESTIONS (~20%)
    if len(selected_questions) < count:
        role_q = build_hypothetical_role_question(role, evidence)
        if not is_duplicate_question(role_q["question"], asked_norm_questions):
            selected_questions.append(role_q)
            asked_norm_questions.add(normalize_question_text(role_q["question"]))

    # 7. BEHAVIORAL & SITUATIONAL QUESTIONS (~10%)
    if len(selected_questions) < count:
        for hr_q in COMMON_HR_QUESTIONS:
            if len(selected_questions) >= count:
                break
            formatted_hr = {
                "question": hr_q["question"],
                "source": "behavioral",
                "sourceType": "behavioral",
                "sourceEntity": hr_q.get("topic", "Behavioral"),
                "sourceValue": hr_q.get("topic", "Behavioral"),
                "topic": hr_q.get("topic", "Behavioral"),
                "difficulty": hr_q.get("difficulty", "medium"),
                "type": hr_q.get("type", "behavioral")
            }
            if not is_duplicate_question(formatted_hr["question"], asked_norm_questions):
                selected_questions.append(formatted_hr)
                asked_norm_questions.add(normalize_question_text(formatted_hr["question"]))

    # 8. SAFE FALLBACK FILLER (If count still not met, pull from role pool)
    if len(selected_questions) < count:
        fallback_pool = generate_questions_for_role(role, "medium", count)
        for fb in fallback_pool:
            if len(selected_questions) >= count:
                break
            fb_formatted = {
                "question": fb["question"],
                "source": "role",
                "sourceType": "role_requirement",
                "sourceEntity": role,
                "sourceValue": role,
                "topic": fb.get("topic", "General"),
                "difficulty": fb.get("difficulty", "medium"),
                "type": fb.get("type", "technical")
            }
            if not is_duplicate_question(fb_formatted["question"], asked_norm_questions):
                selected_questions.append(fb_formatted)
                asked_norm_questions.add(normalize_question_text(fb_formatted["question"]))

    # Ensure metadata fields are complete for all questions
    session_id = f"sess-{uuid.uuid4().hex[:12]}"
    final_questions = selected_questions[:count]

    for idx, q in enumerate(final_questions):
        q.setdefault("id", f"q-{idx + 1}")
        q.setdefault("source", "role")
        q.setdefault("sourceType", "role_requirement")
        s_ent = q.get("sourceEntity") or q.get("sourceValue") or role
        q["sourceEntity"] = s_ent
        q["sourceValue"] = s_ent
        q.setdefault("topic", "General")
        q.setdefault("difficulty", "medium")
        q.setdefault("type", "technical")
        q.setdefault("targetedWeakness", None)
        q.setdefault("isTargetedRemediation", False)

    return {
        "sessionId": session_id,
        "role": role,
        "interviewNumber": interview_number,
        "questions": final_questions
    }
