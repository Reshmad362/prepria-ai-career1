from fastapi import APIRouter, UploadFile, File
import tempfile

try:
    import whisper
    # Load model once securely
    model = whisper.load_model("base")
except ImportError:
    whisper = None
    model = None

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not model:
        return {"error": "Whisper is not installed or model failed to load."}
        
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)

        return {
            "text": result["text"]
        }

    except Exception as e:
        return {"error": str(e)}
