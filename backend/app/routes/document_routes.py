from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from typing import List, Optional
from app.services.document_service import upload_document, list_documents, delete_document
from app.routes.auth_routes import get_current_user, verify_user_ownership

router = APIRouter(prefix="/documents", tags=["Document Center"])

@router.post("/upload")
async def upload_doc(
    user_id: str = Form(...),
    category: str = Form("Other"),
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to upload documents for another user.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        doc = await upload_document(auth_user_key, file, category)
        return {"success": True, "data": doc}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list/{user_id}")
async def get_docs(user_id: str, category: Optional[str] = None, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's documents.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        docs = list_documents(auth_user_key, category)
        return {"success": True, "data": docs}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{doc_id}")
async def delete_doc(user_id: str, doc_id: str, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to delete another user's documents.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        success = delete_document(auth_user_key, doc_id)
        if success:
            return {"success": True, "message": "Document deleted"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
