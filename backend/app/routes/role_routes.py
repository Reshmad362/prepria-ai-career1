from fastapi import APIRouter, Body
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()

class RoleMatchRequest(BaseModel):
    skills: List[str]
    projects: List[str] = []
    experience: str = ""
    education: str = ""

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "skills": ["Java", "React", "SQL"],
                    "projects": ["Mock Interview System"],
                    "experience": "Fresher",
                    "education": "B.E"
                }
            ]
        }
    }

class RoleScore(BaseModel):
    name: str
    domain: str
    score: float

class RoleResponse(BaseModel):
    roles: List[RoleScore]

ROLE_RULES = [
    # Technical Rules
    {"name": "Software Engineer", "domain": "Technical", "reqs": ["java", "python", "c++", "c#", "go", "ruby"], "threshold": 0.85},
    {"name": "Frontend Developer", "domain": "Technical", "reqs": ["react", "angular", "vue", "javascript", "js", "html", "css"], "threshold": 0.88},
    {"name": "Backend Developer", "domain": "Technical", "reqs": ["java", "sql", "node", "express", "django", "spring"], "threshold": 0.87},
    {"name": "Full Stack Developer", "domain": "Technical", "reqs": ["react", "java", "sql", "javascript", "node"], "threshold": 0.92},
    {"name": "Data Scientist", "domain": "Technical", "reqs": ["python", "ml", "machine learning", "statistics"], "threshold": 0.91},
    {"name": "AI Engineer", "domain": "Technical", "reqs": ["python", "ai", "artificial intelligence", "deep learning"], "threshold": 0.94},
    {"name": "ML Engineer", "domain": "Technical", "reqs": ["python", "ml", "tensorflow", "pytorch"], "threshold": 0.91},
    {"name": "DevOps Engineer", "domain": "Technical", "reqs": ["aws", "docker", "kubernetes", "ci/cd", "linux"], "threshold": 0.89},
    {"name": "Cloud Engineer", "domain": "Technical", "reqs": ["aws", "azure", "gcp", "cloud"], "threshold": 0.87},
    {"name": "QA Engineer", "domain": "Technical", "reqs": ["testing", "selenium", "cypress", "qa", "manual testing"], "threshold": 0.82},

    # Analytics Rules
    {"name": "Data Analyst", "domain": "Analytics", "reqs": ["excel", "sql", "power bi", "tableau"], "threshold": 0.86},
    {"name": "Business Analyst", "domain": "Analytics", "reqs": ["business", "agile", "requirements", "scrum", "excel"], "threshold": 0.85},
    {"name": "Research Analyst", "domain": "Analytics", "reqs": ["research", "data analysis", "market research"], "threshold": 0.82},
    {"name": "BI Developer", "domain": "Analytics", "reqs": ["sql", "power bi", "tableau", "etl", "data warehouse"], "threshold": 0.88},

    # Non-Technical Rules
    {"name": "HR Executive", "domain": "Non-Technical", "reqs": ["communication", "hiring", "recruitment", "hr"], "threshold": 0.85},
    {"name": "Recruiter", "domain": "Non-Technical", "reqs": ["sourcing", "screening", "recruiting", "talent acquisition"], "threshold": 0.84},
    {"name": "Marketing Executive", "domain": "Non-Technical", "reqs": ["seo", "marketing", "content", "social media", "campaigns"], "threshold": 0.87},
    {"name": "Sales Associate", "domain": "Non-Technical", "reqs": ["sales", "b2b", "b2c", "lead generation", "negotiation"], "threshold": 0.83},
    {"name": "Business Development Executive", "domain": "Non-Technical", "reqs": ["business development", "sales", "partnerships", "strategy"], "threshold": 0.86},
    {"name": "Project Coordinator", "domain": "Non-Technical", "reqs": ["project management", "coordination", "jira", "agile", "scheduling"], "threshold": 0.84},
    {"name": "Customer Success Associate", "domain": "Non-Technical", "reqs": ["customer support", "communication", "client relations", "crm"], "threshold": 0.81},

    # Creative Rules
    {"name": "UI/UX Designer", "domain": "Creative", "reqs": ["figma", "wireframes", "prototyping", "design", "adobe xd"], "threshold": 0.89},
    {"name": "Graphic Designer", "domain": "Creative", "reqs": ["photoshop", "illustrator", "design", "creative", "canva"], "threshold": 0.85},
    {"name": "Content Writer", "domain": "Creative", "reqs": ["writing", "blogging", "seo", "copywriting", "content creation"], "threshold": 0.83},
    {"name": "Social Media Manager", "domain": "Creative", "reqs": ["social media", "instagram", "linkedin", "marketing", "content calendar"], "threshold": 0.84},

    # Core Engineering Rules
    {"name": "Mechanical Engineer", "domain": "Core Engineering", "reqs": ["solidworks", "cad", "ansys", "mechanical design"], "threshold": 0.88},
    {"name": "Civil Engineer", "domain": "Core Engineering", "reqs": ["autocad", "structural design", "revit", "construction"], "threshold": 0.87},
    {"name": "Electrical Engineer", "domain": "Core Engineering", "reqs": ["matlab", "circuits", "electrical design", "autocad electrical"], "threshold": 0.89},
    {"name": "Embedded Systems Engineer", "domain": "Core Engineering", "reqs": ["c", "c++", "microcontrollers", "rtos", "embedded c"], "threshold": 0.91},
]

@router.post("/match-role", response_model=RoleResponse)
def match_role(data: RoleMatchRequest = Body(...)):
    skills = [skill.lower() for skill in data.skills]
    
    if not skills:
        return RoleResponse(roles=[])
        
    role_scores = {}
    
    for rule in ROLE_RULES:
        reqs = rule["reqs"]
        # Find matching skills. A rule requires partial or full matching.
        matched = [r for r in reqs if r in skills]
        
        # Calculate ratio of matched skills vs required skills, optionally cap it so having some key ones hits max
        if len(matched) > 0:
            # Add weight for the specific requested combos directly mapping cleanly
            score = rule["threshold"] * (len(matched) / min(3, len(reqs)))  # assuming hitting 3 is a solid match
            score = min(0.99, score + 0.1)  # base boost
            score = round(score, 2)
            
            # Additional heuristic rules from prompt (Python + Machine Learning -> Data Scientist)
            if rule["name"] == "Data Scientist" and "python" in skills and ("ml" in skills or "machine learning" in skills):
                score = max(score, 0.91)
            elif rule["name"] == "AI Engineer" and "python" in skills and "ai" in skills:
                score = max(score, 0.94)
            elif rule["name"] == "Data Analyst" and "excel" in skills and "sql" in skills and "power bi" in skills:
                score = max(score, 0.92)
            elif rule["name"] == "HR Executive" and "communication" in skills and "hiring" in skills and "recruitment" in skills:
                score = max(score, 0.89)
            elif rule["name"] == "Marketing Executive" and "seo" in skills and "marketing" in skills and "content" in skills:
                score = max(score, 0.88)
            elif rule["name"] == "Civil Engineer" and "autocad" in skills and "structural design" in skills:
                score = max(score, 0.90)
            elif rule["name"] == "Mechanical Engineer" and "solidworks" in skills and "cad" in skills:
                score = max(score, 0.89)
            elif rule["name"] == "UI/UX Designer" and "figma" in skills and "wireframes" in skills:
                score = max(score, 0.91)
                
            # Full stack special handling
            if rule["name"] == "Full Stack Developer" and "react" in skills and "java" in skills and "sql" in skills:
                score = max(score, 0.95)
                
            # Filter low thresholds and prevent dupes picking best score
            if score > 0.4:
                if rule["name"] in role_scores:
                    if score > role_scores[rule["name"]]["score"]:
                        role_scores[rule["name"]]["score"] = score
                else:
                    role_scores[rule["name"]] = {"domain": rule["domain"], "score": score}

    # Format output
    result = []
    for name, data in role_scores.items():
        result.append(RoleScore(name=name, domain=data["domain"], score=data["score"]))
        
    # Sort roles by descending score
    result.sort(key=lambda x: x.score, reverse=True)
    
    return RoleResponse(roles=result)