import re

def detect_fillers(text: str) -> dict:
    if not text:
        return {"filler_count": 0, "fillers": []}

    # Use re.IGNORECASE to capture capitalized filler words
    filler_regex = r"\b(um+|uh+|mm+|hmm+|like|basically|actually|you know|kind of|sort of)\b"
    
    # Find all matches
    matches = re.findall(filler_regex, text, re.IGNORECASE)
    
    # Clean the matches to normalize them
    fillers = [match.lower() for match in matches]
    
    return {
        "filler_count": len(fillers),
        "fillers": fillers
    }

