import os
import io
import uuid
import shutil
import pdfplumber
import re
import logging
from typing import Dict, Any, List, Union
from fastapi import UploadFile, HTTPException

import docx
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table

from app.services.skill_extractor import parse_resume_text

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure the local uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_docx(file_source: Any) -> str:
    """
    Extract structured text from a DOCX file, supporting:
    - Normal paragraphs
    - Heading 1–6 styles
    - Bulleted and numbered list items
    - Standard tables (rows and cells)
    - Nested tables and multi-paragraph cells
    - Text runs within paragraphs and cells
    Preserving sequential document reading order.

    Explicitly Unsupported Structures (Documented):
    - Embedded OLE objects (e.g., embedded spreadsheets, Visio diagrams)
    - Vector drawing canvas / SmartArt shapes
    - Macro-enabled VBA scripts (.docm)
    - Password-protected / encrypted document packages
    - Non-textual watermarks / embedded graphic layers
    """
    if isinstance(file_source, (bytes, bytearray)):
        stream = io.BytesIO(file_source)
    elif hasattr(file_source, "file"):
        file_source.file.seek(0)
        content = file_source.file.read()
        stream = io.BytesIO(content)
    elif hasattr(file_source, "read"):
        content = file_source.read()
        stream = io.BytesIO(content)
    else:
        stream = file_source

    doc = Document(stream)
    
    def process_container(container) -> List[str]:
        lines = []
        if hasattr(container, 'element') and hasattr(container.element, 'body'):
            body_elm = container.element.body
        elif hasattr(container, '_element'):
            body_elm = container._element
        else:
            return lines

        for child in body_elm.iterchildren():
            if child.tag.endswith('p'):
                p = Paragraph(child, container)
                text = p.text.strip()
                if text:
                    lines.append(text)
            elif child.tag.endswith('tbl'):
                t = Table(child, container)
                for row in t.rows:
                    row_parts = []
                    seen_in_row = []
                    for cell in row.cells:
                        if any(cell._element is prev for prev in seen_in_row):
                            continue
                        seen_in_row.append(cell._element)
                        cell_lines = process_container(cell)
                        cell_text = " ".join(cell_lines).strip()
                        if cell_text:
                            row_parts.append(cell_text)
                    if row_parts:
                        lines.append(" | ".join(row_parts))
        return lines

    extracted_lines = process_container(doc)
    return "\n".join(extracted_lines)

def extract_text(file_source: Any) -> str:
    """
    Extract text from PDF file-like object or bytes.
    Preserves backwards compatibility for existing PDF extraction callers.
    """
    if isinstance(file_source, (bytes, bytearray)):
        stream = io.BytesIO(file_source)
    elif hasattr(file_source, "file"):
        file_source.file.seek(0)
        stream = file_source.file
    elif hasattr(file_source, "read"):
        content = file_source.read()
        stream = io.BytesIO(content)
    else:
        stream = file_source

    text = ""
    with pdfplumber.open(stream) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
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
        
    # Grammar Analysis
    grammar_score = 95
    grammar_issues = []
    if "responsable" in text_lower or "managerd" in text_lower:
        grammar_score = 80
        grammar_issues.append("Found spelling mistakes (e.g., 'responsable').")
        
    # Action Verbs
    action_verbs = ["developed", "led", "managed", "created", "designed", "optimized", "implemented", "launched"]
    verb_count = sum(1 for verb in action_verbs if verb in text_lower)
    verb_feedback = "Strong use of action verbs." if verb_count >= 4 else "Consider starting bullet points with strong action verbs (e.g., Led, Developed, Optimized)."
        
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "grammar_score": grammar_score,
        "grammar_issues": grammar_issues,
        "action_verbs_feedback": verb_feedback
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
        extracted_text = ""
        if ext == ".pdf":
            extracted_text = extract_text(content)
        elif ext == ".docx":
            extracted_text = extract_text_from_docx(content)
            
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
        # Prevent upload failure if ATS crashes unexpectedly (malformed/corrupted file), return empty parsed data
        logger.warning("ATS Parsing Error for %s: %s", unique_filename, str(e))
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
