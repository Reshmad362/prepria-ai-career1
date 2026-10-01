import re
from collections import Counter

def detect_fillers(text: str) -> dict:
    if not text:
        return {
            "filler_count": 0,
            "fillers": [],
            "filler_breakdown": {}
        }

    # Use re.IGNORECASE to capture capitalized filler words
    filler_regex = r"\b(um+|uh+|mm+|hmm+|like|basically|actually|you know|kind of|sort of)\b"
    
    # Find all matches
    matches = re.findall(filler_regex, str(text), re.IGNORECASE)
    
    # Clean and normalize the matches
    fillers = []
    for match in matches:
        m_low = match.lower()
        if re.match(r"^um+$", m_low):
            fillers.append("um")
        elif re.match(r"^uh+$", m_low):
            fillers.append("uh")
        elif re.match(r"^mm+$", m_low):
            fillers.append("mm")
        elif re.match(r"^hmm+$", m_low):
            fillers.append("hmm")
        else:
            fillers.append(m_low)
    
    breakdown = dict(Counter(fillers))
    
    return {
        "filler_count": len(fillers),
        "fillers": fillers,
        "filler_breakdown": breakdown
    }


