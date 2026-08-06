from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from app.services.document_service import upload_document, list_documents, delete_document

router = APIRouter(prefix="/documents", tags=["Document Center"])

@router.post("/upload")
async def upload_doc(
    user_id: str = Form(...),
    category: str = Form("Other"),
    file: UploadFile = File(...)
):
    try:
        doc = await upload_document(user_id, file, category)
        return {"success": True, "data": doc}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list/{user_id}")
async def get_docs(user_id: str, category: Optional[str] = None):
    try:
        docs = list_documents(user_id, category)
        return {"success": True, "data": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{doc_id}")
async def delete_doc(user_id: str, doc_id: str):
    try:
        success = delete_document(user_id, doc_id)
        if success:
            return {"success": True, "message": "Document deleted"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
