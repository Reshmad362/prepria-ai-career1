import io
import sys
import os
from typing import Dict, Any

from app.services.skill_extractor import parse_resume_text
from app.services.resume_service import (
    extract_text as extract_text_from_pdf,
    extract_text_from_docx,
    calculate_ats_score,
    generate_feedback
)

def extract_from_file_bytes(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses document bytes using appropriate extractor, runs ATS text logic,
    and returns a structured JSON dictionary.
    """
    ext = os.path.splitext(filename)[1].lower()
    raw_text = ""
    
    if ext == '.pdf':
        try:
            raw_text = extract_text_from_pdf(file_bytes)
        except Exception:
            raw_text = ""
    elif ext == '.docx':
        try:
            raw_text = extract_text_from_docx(file_bytes)
        except Exception:
            raw_text = ""
        
    # Analyze raw text against the ML matching components
    ats_data = parse_resume_text(raw_text)
    ats_data["score"] = calculate_ats_score(ats_data)
    ats_data["feedback"] = generate_feedback(ats_data, raw_text)
    
    return ats_data

