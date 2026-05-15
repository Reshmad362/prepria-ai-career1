from pydantic import BaseModel
from typing import List, Optional
import math

class Profile(BaseModel):
    skills: List[str]
    projects: List[str] = []
    experience: str = ""
    education: str = ""

class RoleScore(BaseModel):
    name: str
    score: float

class RoleResponse(BaseModel):
    roles: List[RoleScore]

RULES = [
    {"role": "Full Stack Developer", "skills": ["react", "java", "sql"], "base_score": 0.92},
    {"role": "Frontend Developer", "skills": ["react", "js"], "base_score": 0.88},
    {"role": "Frontend Developer", "skills": ["react", "javascript"], "base_score": 0.88},
    {"role": "Backend Developer", "skills": ["java", "sql"], "base_score": 0.81}, # Matches Output Example
    {"role": "Data Scientist", "skills": ["python", "ml"], "base_score": 0.90},
    {"role": "AI Engineer", "skills": ["ai", "nlp"], "base_score": 0.95},
]

def match_roles(profile: Profile) -> RoleResponse:
    if not profile.skills:
        return RoleResponse(roles=[])

    skills_lower = [s.lower() for s in profile.skills]
    
    role_scores = {}
    
    for rule in RULES:
        has_all_skills = all(skill in skills_lower for skill in rule["skills"])
        if has_all_skills:
            # If the role is already added, keep the higher score
            score = rule["base_score"]
            if rule["role"] in role_scores:
                role_scores[rule["role"]] = max(role_scores[rule["role"]], score)
            else:
                role_scores[rule["role"]] = score
                
    # If partial matches are needed
    if not role_scores:
        for rule in RULES:
            matched_skills = [skill for skill in rule["skills"] if skill in skills_lower]
            if matched_skills:
                # Partial match mapping
                score = rule["base_score"] * (len(matched_skills) / len(rule["skills"]))
                score = round(score, 2)
                if rule["role"] in role_scores:
                    role_scores[rule["role"]] = max(role_scores[rule["role"]], score)
                else:
                    role_scores[rule["role"]] = score
                    
    # Generate the result list
    result = []
    for name, score in role_scores.items():
        result.append(RoleScore(name=name, score=score))
        
    # Sort roles by descending score
    result.sort(key=lambda x: x.score, reverse=True)
    
    return RoleResponse(roles=result)
