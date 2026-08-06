import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from typing import List, Dict, Any
from datetime import datetime

DOCUMENTS_DIR = "uploads/documents"
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

# Mock database for storing document metadata
# In a real database, this would be a table storing user_id, filename, file_type, size, url
documents_db = []

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB

async def upload_document(user_id: str, file: UploadFile, category: str) -> Dict[str, Any]:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
        
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read file")
        
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 15MB.")
        
    unique_filename = f"doc_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(DOCUMENTS_DIR, unique_filename)
    
    try:
        with open(filepath, "wb") as f:
            f.write(content)
    except IOError:
        raise HTTPException(status_code=500, detail="Failed to save file")
        
    doc_meta = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "original_name": file.filename,
        "filename": unique_filename,
        "category": category, # Resume, Certificate, ID, Other
        "size": len(content),
        "uploaded_at": datetime.utcnow().isoformat()
    }
    documents_db.append(doc_meta)
    
    return doc_meta

def list_documents(user_id: str, category: str = None) -> List[Dict[str, Any]]:
    docs = [d for d in documents_db if d["user_id"] == user_id]
    if category:
        docs = [d for d in docs if d["category"] == category]
    return docs

def delete_document(user_id: str, doc_id: str) -> bool:
    global documents_db
    doc = next((d for d in documents_db if d["id"] == doc_id and d["user_id"] == user_id), None)
    if not doc:
        return False
        
    filepath = os.path.join(DOCUMENTS_DIR, doc["filename"])
    if os.path.exists(filepath):
        os.remove(filepath)
        
    documents_db = [d for d in documents_db if d["id"] != doc_id]
    return True
