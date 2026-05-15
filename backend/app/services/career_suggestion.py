from typing import List, Dict, Any

def generate_career_suggestions(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates career suggestions based on the provided user intelligence data.
    """
    resume_skills = data.get("resume_skills", [])
    matched_roles = data.get("matched_roles", [])
    latest_score = data.get("latest_score", 0.0)
    fluency_score = data.get("fluency_score", 0.0)
    weak_skills = data.get("weak_skills", [])
    history_available = data.get("history_available", False)

    recommended_roles = []
    learning_path = []
    next_steps = []
    
    # Heuristic 1: No Resume
    if not resume_skills:
        next_steps.append("Upload your resume to get personalized role recommendations.")
        recommended_roles.append({
            "name": "General Software Engineer",
            "reason": "Default recommendation. Please upload a resume for tailored roles."
        })
        learning_path.append("Review basic software engineering principles.")
    else:
        # Heuristic: Match Roles & Strong Profile
        for role in matched_roles:
            if latest_score >= 0.75:
                recommended_roles.append({
                    "name": f"Senior {role}",
                    "reason": f"Strong interview performance ({latest_score*100}%) indicates readiness for advanced roles."
                })
            else:
                recommended_roles.append({
                    "name": role,
                    "reason": "Matches your current skill set."
                })

    # Heuristic 2: Weak Confidence / Low Fluency
    if fluency_score < 60:
        learning_path.append("Practice speaking rhythm and reduce filler words")
        next_steps.append("Schedule 2 behavioral mock interviews to build fluency")
    
    # Heuristic 3: Poor DSA
    if any(skill.upper() in ["DSA", "ALGORITHMS", "DATA STRUCTURES"] for skill in (weak_skills + resume_skills)):
        learning_path.extend([
            "Practice arrays, strings, and linked lists",
            "Study two pointers and sliding window techniques"
        ])
        
    if not learning_path:
        learning_path = ["Deepen knowledge in your primary tech stack.", "Learn system design basics."]
        
    if not next_steps:
        next_steps = ["Take another mock interview to refine skills."]
        
    # Heuristic 4: No History
    if not history_available:
        next_steps.insert(0, "Complete a baseline mock interview to establish your benchmark score.")

    # Deduplicate
    learning_path = list(dict.fromkeys(learning_path))
    next_steps = list(dict.fromkeys(next_steps))

    return {
        "recommended_roles": recommended_roles,
        "weak_skills": weak_skills,
        "learning_path": learning_path,
        "next_steps": next_steps
    }
