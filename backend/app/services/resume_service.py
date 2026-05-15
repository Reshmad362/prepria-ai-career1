import os
import uuid
import shutil
import pdfplumber
import re
from fastapi import UploadFile, HTTPException
from typing import Dict, Any

from app.services.skill_extractor import parse_resume_text

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure the local uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text(file: UploadFile) -> str:
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def calculate_ats_score(ats_data: Dict[str, Any]) -> int:
    """Calculate ATS score based on realistic, domain-independent factors."""
    score = 0
    
    skills = ats_data.get("skills", [])
    experience = ats_data.get("experience", "Not found")
    projects = ats_data.get("projects", [])
    education = ats_data.get("education", "Not found")
    
    # 1. Skill-based scoring (max 35 points, 5 pts per skill)
    skill_count = len(skills) if isinstance(skills, list) else 0
    score += min(35, skill_count * 5)
    
    # 2. Experience detection (max 30 points)
    if isinstance(experience, str) and experience.lower() != "not found":
        if "fresher" in experience.lower():
            score += 15
        else:
            score += 30
    elif isinstance(experience, list) and len(experience) > 0:
        score += 30
            
    # 3. Project-based bonus (max 15 points, 5 pts per project)
    project_count = len(projects) if isinstance(projects, list) else 0
    score += min(15, project_count * 5)
    
    # 4. Education weighting (max 15 points)
    if isinstance(education, str) and education.lower() != "not found":
        if "degree unspecified" not in education.lower():
            score += 15
        else:
            score += 5
    elif isinstance(education, list) and len(education) > 0:
        score += 15
            
    return min(95, score)

def generate_feedback(ats_data: Dict[str, Any], full_text: str) -> Dict[str, list]:
    """Generates strengths, weaknesses, and suggestions based on extracted data and full text."""
    strengths = []
    weaknesses = []
    suggestions = []
    
    skills = ats_data.get("skills", [])
    experience = ats_data.get("experience", "Not found")
    projects = ats_data.get("projects", [])
    
    text_lower = full_text.lower()
    
    # Skills logic
    skill_count = len(skills) if isinstance(skills, list) else 0
    if skill_count >= 5:
        strengths.append("Strong skill coverage detected.")
    elif skill_count < 3:
        weaknesses.append("Very few skills detected.")
        suggestions.append("Add more relevant, domain-specific skills to your resume.")
        
    # Experience logic
    if isinstance(experience, str) and experience.lower() != "not found" and ("intern" in experience.lower() or "experience" in experience.lower()):
        strengths.append("Practical experience or internship present.")
    elif "intern" in text_lower or "experience" in text_lower:
        strengths.append("Practical experience or internship present.")
    else:
        weaknesses.append("No formal experience or internship detected.")
        suggestions.append("Try adding internships, co-ops, or other practical experience.")
        
    # Projects logic
    project_count = len(projects) if isinstance(projects, list) else 0
    if project_count > 0 or "project" in text_lower:
        strengths.append("Project-based learning demonstrated.")
    else:
        weaknesses.append("No projects detected.")
        suggestions.append("Add 1–2 significant projects to showcase applied skills.")
        
    # Metrics / Numbers logic
    if re.search(r'\d', full_text):
        strengths.append("Measurable achievements (numbers/metrics) included.")
    else:
        weaknesses.append("Lack of quantified achievements.")
        suggestions.append("Incorporate numbers/metrics (e.g., %, amounts) to quantify your impact.")
        
    # Tech role keywords logic (heuristic)
    tech_keywords = ["react", "node", "java", "python", "aws", "sql"]
    tech_count = sum(1 for kw in tech_keywords if kw in text_lower)
    if tech_count > 0 and tech_count < 3:
        # Detected some tech but might be missing key ones
        weaknesses.append("Tech stack could be more comprehensively listed.")
        suggestions.append("If applying for tech roles, specifically list core frameworks and technologies.")
        
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions
    }

async def process_resume_upload(file: UploadFile) -> Dict[str, Any]:
    # 1. Validate empty file upload
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or file is empty")
    
    # 2. Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file type. Only .pdf and .docx are allowed."
        )
    
    # 3. Read content safely, handling potential upload interruption
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=500, detail="Upload interrupted while reading file")
    
    file_size = len(content)
    
    # 4. Validate empty file (zero bytes)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
        
    # 5. Validate file size (max 10MB limit)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="File too large. Maximum size is 10MB."
        )
    
    # 6. Handle duplicate file name collision by generating a unique UUID-based name
    unique_filename = f"resume_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 7. Store file in uploads/ folder
    try:
        with open(filepath, "wb") as f:
            f.write(content)
    except IOError:
        raise HTTPException(status_code=500, detail="Upload interrupted or failed to save file to disk")
        
    # 8. PERFORM ATS EXTRACTION
    try:
        await file.seek(0)
        extracted_text = ""
        if ext == ".pdf":
            extracted_text = extract_text(file)
        # Process the text using our imported skill_extractor
        extracted_data = parse_resume_text(extracted_text)
        
        ats_data = {
           "name": extracted_data.get("name", "Not found"),
           "email": extracted_data.get("email", "Not found"),
           "skills": extracted_data.get("skills", []),
           "experience": extracted_data.get("experience", "Not found"),
           "education": extracted_data.get("education", "Not found"),
           "projects": extracted_data.get("projects", []),
           "keywords": extracted_data.get("keywords", [])
        }
        ats_data["score"] = calculate_ats_score(ats_data)
        ats_data["feedback"] = generate_feedback(ats_data, extracted_text)
    except Exception as e:
        # Prevent upload failure if ATS crashes unexpectedly, return empty parsed data
        print("ATS Parsing Error:", str(e))
        ats_data = {
           "name": "Extraction Failed",
           "email": "Extraction Failed",
           "skills": [],
           "experience": "Extraction Failed",
           "education": "Not Found",
           "projects": [],
           "keywords": [],
           "score": 0,
           "feedback": {
               "strengths": [],
               "weaknesses": ["Analysis failed."],
               "suggestions": ["Try uploading a different format or checking proper text encoding."]
           }
        }

    # 9. Return JSON response format compliant with requirements
    return {
        "success": True,
        "filename": unique_filename,
        "data": ats_data
    }
