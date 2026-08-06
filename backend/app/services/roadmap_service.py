from typing import Dict, Any, List

def generate_career_roadmap(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a dynamic career roadmap based on the user's profile, skills, and target role.
    This simulates an AI engine returning a structured timeline.
    """
    target_role = user_profile.get("targetRole", "Software Engineer")
    skills = user_profile.get("skills", [])
    experience_level = user_profile.get("experienceLevel", "Fresher")
    
    # Base nodes structure
    roadmap = {
        "title": f"Path to {target_role}",
        "description": "Your personalized AI-generated roadmap to achieve your career goals.",
        "nodes": []
    }
    
    # 1. Foundation Node
    foundation_skills = ["Data Structures", "Algorithms", "Git"]
    if "frontend" in target_role.lower():
        foundation_skills = ["HTML/CSS", "JavaScript Fundamentals", "Responsive Design"]
    elif "data" in target_role.lower():
        foundation_skills = ["Python", "SQL", "Statistics"]
        
    roadmap["nodes"].append({
        "id": "step_1",
        "title": "Foundation & Core Skills",
        "description": "Master the fundamental building blocks required for this role.",
        "status": "completed" if experience_level != "Fresher" else "in_progress",
        "skills": foundation_skills,
        "action": "Complete basic assessments to verify knowledge."
    })
    
    # 2. Advanced Skills Node
    advanced_skills = ["System Design", "Microservices", "Cloud (AWS/GCP)"]
    if "frontend" in target_role.lower():
        advanced_skills = ["React/Angular", "State Management", "Performance Optimization"]
    elif "data" in target_role.lower():
        advanced_skills = ["Machine Learning", "Data Pipelines", "Big Data Tools"]
        
    roadmap["nodes"].append({
        "id": "step_2",
        "title": "Advanced Technologies",
        "description": "Deep dive into industry-standard frameworks and tools.",
        "status": "in_progress" if experience_level != "Fresher" else "locked",
        "skills": advanced_skills,
        "action": "Build a capstone project using these technologies."
    })
    
    # 3. Portfolio & Real-world Application
    roadmap["nodes"].append({
        "id": "step_3",
        "title": "Portfolio & Projects",
        "description": "Demonstrate your capability through real-world applications.",
        "status": "locked",
        "skills": ["End-to-End Development", "Deployment", "Documentation"],
        "action": "Upload 2 significant projects to your Document Center."
    })
    
    # 4. Interview Readiness
    roadmap["nodes"].append({
        "id": "step_4",
        "title": "Interview Readiness",
        "description": "Prepare for technical, behavioral, and system design interviews.",
        "status": "locked",
        "skills": ["Technical Communication", "Behavioral (STAR)", "Mock Interviews"],
        "action": "Achieve >85% average in AI Mock Interviews."
    })
    
    # 5. Target Achievement
    roadmap["nodes"].append({
        "id": "step_5",
        "title": f"Secure {target_role} Role",
        "description": "Apply, interview, and negotiate your offers.",
        "status": "locked",
        "skills": ["Offer Negotiation", "Culture Fit", "Onboarding"],
        "action": "Apply to suggested roles in your Job Recommendations."
    })
    
    return roadmap
