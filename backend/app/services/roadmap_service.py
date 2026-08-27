from typing import Dict, Any, List

def generate_career_roadmap(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a dynamic career roadmap based on the user's profile, skills, and target role.
    Dynamically supports Technical, HR, Marketing, Finance, Data, and Business domains.
    """
    target_role = user_profile.get("targetRole", "Software Engineer")
    skills = user_profile.get("skills", [])
    experience_level = user_profile.get("experienceLevel", "Fresher")
    
    role_lower = target_role.lower()

    # Base roadmap structure
    roadmap = {
        "title": f"Path to {target_role}",
        "description": f"Your personalized AI-generated roadmap to achieve placement as a {target_role}.",
        "nodes": []
    }

    # 1. HR Domain
    if "hr" in role_lower or "recruit" in role_lower or "talent" in role_lower:
        roadmap["nodes"] = [
            {
                "id": "step_1",
                "title": "HR Fundamentals & Employee Lifecycle",
                "description": "Master onboarding flows, company policies, and workplace communication.",
                "status": "completed" if experience_level != "Fresher" else "in_progress",
                "skills": ["Employee Lifecycle", "HR Policies", "Onboarding", "Active Listening"],
                "action": "Design standard 30-60-90 day employee onboarding SOPs."
            },
            {
                "id": "step_2",
                "title": "Talent Sourcing & Candidate Screening",
                "description": "LinkedIn Recruiter sourcing, Boolean search, and resume screening pipelines.",
                "status": "in_progress" if experience_level != "Fresher" else "locked",
                "skills": ["Recruitment", "Boolean Search", "Screening", "Interview Coordination"],
                "action": "Draft 2 optimized JDs and complete candidate sourcing exercise."
            },
            {
                "id": "step_3",
                "title": "HRMS & People Analytics",
                "description": "HR metrics, attrition modeling, employee engagement scores, and Excel reporting.",
                "status": "locked",
                "skills": ["HRMS Software", "HR Analytics", "Advanced Excel", "Attrition Modeling"],
                "action": "Build an HR attrition and diversity metrics dashboard in Excel."
            },
            {
                "id": "step_4",
                "title": "HR Behavioral & Situational Mock Interviews",
                "description": "Master situational judgment, STAR method, and employee grievance handling.",
                "status": "locked",
                "skills": ["Behavioral STAR", "Conflict Resolution", "Mock Interviews"],
                "action": "Achieve >85% average in AI HR Mock Interviews."
            }
        ]
    # 2. Marketing Domain
    elif "market" in role_lower or "seo" in role_lower or "social" in role_lower or "content" in role_lower:
        roadmap["nodes"] = [
            {
                "id": "step_1",
                "title": "Marketing Strategy & Consumer Personas",
                "description": "Understand marketing funnels (AIDA), value propositions, and buyer personas.",
                "status": "completed" if experience_level != "Fresher" else "in_progress",
                "skills": ["Marketing Principles", "Target Personas", "Copywriting", "Branding"],
                "action": "Develop 2 comprehensive buyer personas and messaging matrices."
            },
            {
                "id": "step_2",
                "title": "Inbound & SEO Growth Strategy",
                "description": "Keyword research, on-page optimization, content pillar architecture, and organic lead gen.",
                "status": "in_progress" if experience_level != "Fresher" else "locked",
                "skills": ["SEO", "Keyword Research", "Content Strategy", "Blog Optimization"],
                "action": "Write an SEO-optimized pillar article targeting high-intent long-tail keywords."
            },
            {
                "id": "step_3",
                "title": "Performance Ads & GA4 Analytics",
                "description": "Paid advertising (Meta/Google), conversion rate optimization, and ROI reporting.",
                "status": "locked",
                "skills": ["Google Ads", "Meta Ads", "GA4", "Conversion Optimization"],
                "action": "Create a multichannel campaign performance report."
            },
            {
                "id": "step_4",
                "title": "Marketing Case Studies & Campaign Defense",
                "description": "Present marketing case studies, growth hypotheses, and defend strategy in mock interviews.",
                "status": "locked",
                "skills": ["Campaign Defense", "Growth Hypotheses", "Mock Interviews"],
                "action": "Achieve >85% in AI Marketing Case Study Interviews."
            }
        ]
    # 3. Finance Domain
    elif "financ" in role_lower or "account" in role_lower or "invest" in role_lower:
        roadmap["nodes"] = [
            {
                "id": "step_1",
                "title": "Financial Statements & Accounting Principles",
                "description": "Master 3-statement financial accounting, revenue recognition, and debit/credit ledger.",
                "status": "completed" if experience_level != "Fresher" else "in_progress",
                "skills": ["Accounting Principles", "Income Statement", "Balance Sheet", "Cash Flow"],
                "action": "Build an interconnected 3-statement financial model from scratch."
            },
            {
                "id": "step_2",
                "title": "Financial Modeling & Valuation (DCF)",
                "description": "Construct multi-year revenue projections, WACC, and discounted cash flow models.",
                "status": "in_progress" if experience_level != "Fresher" else "locked",
                "skills": ["Financial Modeling", "DCF Valuation", "Advanced Excel", "Trading Comps"],
                "action": "Perform a full DCF valuation on a publicly listed company."
            },
            {
                "id": "step_3",
                "title": "Budgeting, Variance Analysis & Deck Presentation",
                "description": "Analyze budget vs actual variances and synthesize commentary for executive reviews.",
                "status": "locked",
                "skills": ["Variance Analysis", "Budgeting", "Financial Reporting", "PowerPoint Decks"],
                "action": "Draft an executive quarterly financial commentary memo."
            },
            {
                "id": "step_4",
                "title": "Finance Technical & Case Interviews",
                "description": "Accounting drill questions, valuation walk-throughs, and STAR behavioral prep.",
                "status": "locked",
                "skills": ["Finance Technicals", "Valuation Defense", "Mock Interviews"],
                "action": "Achieve >85% in AI Finance Technical Interviews."
            }
        ]
    # 4. Data / Business Analytics Domain
    elif "data" in role_lower or "business anal" in role_lower or "bi anal" in role_lower:
        roadmap["nodes"] = [
            {
                "id": "step_1",
                "title": "Data Modeling & Advanced SQL",
                "description": "Relational database queries, Window functions, CTEs, and aggregation pipelines.",
                "status": "completed" if experience_level != "Fresher" else "in_progress",
                "skills": ["SQL", "Window Functions", "CTEs", "Data Cleaning"],
                "action": "Solve 15 complex business analytics queries in SQL."
            },
            {
                "id": "step_2",
                "title": "Python Data Wrangling & Exploratory Analysis",
                "description": "Pandas, NumPy, missing data imputation, and statistical distributions.",
                "status": "in_progress" if experience_level != "Fresher" else "locked",
                "skills": ["Python", "Pandas", "NumPy", "Statistics"],
                "action": "Perform exploratory analysis on a 500k-row consumer dataset."
            },
            {
                "id": "step_3",
                "title": "Interactive Dashboards & Business Intelligence",
                "description": "Design executive dashboards with drill-through parameters and KPI telemetry.",
                "status": "locked",
                "skills": ["Power BI / Tableau", "DAX", "Data Storytelling", "KPI Reporting"],
                "action": "Publish an interactive multi-page business intelligence dashboard."
            },
            {
                "id": "step_4",
                "title": "Analytics Case Studies & Live Technical Defense",
                "description": "Present data insights, live SQL whiteboard tests, and business cases.",
                "status": "locked",
                "skills": ["Case Studies", "Live SQL Test", "Mock Interviews"],
                "action": "Achieve >85% in AI Data Analyst Mock Interviews."
            }
        ]
    # 5. Technology / Software Engineering Default
    else:
        foundation_skills = ["Data Structures", "Algorithms", "Git"]
        advanced_skills = ["System Design", "Microservices", "Cloud (AWS/GCP)"]
        if "frontend" in role_lower:
            foundation_skills = ["HTML/CSS", "JavaScript Fundamentals", "Git"]
            advanced_skills = ["React", "State Management", "Performance"]
        elif "backend" in role_lower:
            foundation_skills = ["Data Structures", "OOP", "Git"]
            advanced_skills = ["Node.js / Python", "REST APIs", "SQL & Redis"]

        roadmap["nodes"] = [
            {
                "id": "step_1",
                "title": "Foundation & Core Programming",
                "description": "Master algorithmic foundations and version control workflows.",
                "status": "completed" if experience_level != "Fresher" else "in_progress",
                "skills": foundation_skills,
                "action": "Complete basic coding assessments to verify fundamentals."
            },
            {
                "id": "step_2",
                "title": "Architecture & Modern Frameworks",
                "description": "Deep dive into industry-standard frameworks, tools, and API patterns.",
                "status": "in_progress" if experience_level != "Fresher" else "locked",
                "skills": advanced_skills,
                "action": "Build a production-grade application using these technologies."
            },
            {
                "id": "step_3",
                "title": "System Design, Databases & Scalability",
                "description": "Data modeling, caching, and scalable architecture.",
                "status": "locked",
                "skills": ["System Design", "Databases", "Docker", "Caching"],
                "action": "Document and blueprint an architectural specification."
            },
            {
                "id": "step_4",
                "title": "Full-Loop Technical Mock Interviews",
                "description": "Prepare for live coding, system design, and STAR behavioral interviews.",
                "status": "locked",
                "skills": ["Live Coding", "System Design", "Mock Interviews"],
                "action": "Achieve >85% average in AI Mock Interviews."
            }
        ]

    return roadmap
