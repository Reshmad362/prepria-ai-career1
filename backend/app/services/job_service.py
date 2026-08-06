import json
from typing import List, Dict

# Mock data for jobs, realistic ones
MOCK_JOBS = [
    {
        "id": "job-1",
        "title": "Senior Frontend Developer",
        "company": "TechNova Solutions",
        "location": "San Francisco, CA (Hybrid)",
        "type": "Full-time",
        "salary": "$130k - $160k",
        "postedAt": "2 days ago",
        "description": "We are looking for a Senior Frontend Developer with expertise in React, Next.js, and modern CSS frameworks like Tailwind. You will lead our frontend architecture and mentor junior developers.",
        "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Next.js", "Redux", "Frontend Architecture"]
    },
    {
        "id": "job-2",
        "title": "Data Scientist",
        "company": "DataDriven Inc.",
        "location": "Remote",
        "type": "Full-time",
        "salary": "$140k - $170k",
        "postedAt": "5 hours ago",
        "description": "Join our analytics team to build machine learning models that drive our core product. Experience with Python, Pandas, Scikit-learn, and SQL is required.",
        "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Pandas", "Scikit-Learn"]
    },
    {
        "id": "job-3",
        "title": "Full Stack Engineer",
        "company": "StartupX",
        "location": "New York, NY",
        "type": "Full-time",
        "salary": "$120k - $150k",
        "postedAt": "1 week ago",
        "description": "Seeking a Full Stack Engineer to build scalable web applications. Must have experience with React on the frontend and Node.js or Python on the backend.",
        "skills": ["React", "Node.js", "Python", "MongoDB", "Express", "API Design", "Docker"]
    },
    {
        "id": "job-4",
        "title": "Product Manager",
        "company": "Innovate LLC",
        "location": "Austin, TX",
        "type": "Full-time",
        "salary": "$110k - $140k",
        "postedAt": "3 days ago",
        "description": "We are seeking a Product Manager to lead cross-functional teams. Experience in Agile methodologies, wireframing, and user research is a must.",
        "skills": ["Agile", "Product Strategy", "User Research", "Wireframing", "Jira", "Roadmapping"]
    },
    {
        "id": "job-5",
        "title": "Backend Developer",
        "company": "CloudScale",
        "location": "Seattle, WA (Remote)",
        "type": "Contract",
        "salary": "$80 - $100 / hr",
        "postedAt": "1 day ago",
        "description": "Looking for a strong Backend Developer for a 6-month contract to help migrate our legacy systems to a microservices architecture using Python/FastAPI and AWS.",
        "skills": ["Python", "FastAPI", "AWS", "Microservices", "PostgreSQL", "Docker", "Kubernetes"]
    },
    {
        "id": "job-6",
        "title": "UI/UX Designer",
        "company": "Creative Minds",
        "location": "Remote",
        "type": "Full-time",
        "salary": "$90k - $120k",
        "postedAt": "4 days ago",
        "description": "We need a talented UI/UX Designer to revamp our core platform. Must have a strong portfolio demonstrating user-centric design, prototyping in Figma, and design systems.",
        "skills": ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems", "User Testing"]
    }
]

class JobService:
    def __init__(self):
        pass

    def get_all_jobs(self) -> List[Dict]:
        return MOCK_JOBS

    def calculate_match_score(self, job_skills: List[str], user_skills: List[str]) -> int:
        if not job_skills or not user_skills:
            return 0
        
        # Convert to lower case for case-insensitive matching
        job_skills_lower = [s.lower() for s in job_skills]
        user_skills_lower = [s.lower() for s in user_skills]
        
        matches = 0
        for skill in job_skills_lower:
            # Check if job skill is in user skills or vice versa
            if any(skill in u_skill for u_skill in user_skills_lower) or any(u_skill in skill for u_skill in user_skills_lower):
                matches += 1
                
        # Basic percentage match based on how many required skills the user has
        score = int((matches / len(job_skills_lower)) * 100)
        # Cap at 98% because nobody is perfect :)
        return min(score, 98)

    def match_jobs_for_user(self, user_skills: List[str]) -> List[Dict]:
        jobs = self.get_all_jobs()
        matched_jobs = []
        
        for job in jobs:
            score = self.calculate_match_score(job.get("skills", []), user_skills)
            matched_job = job.copy()
            matched_job["matchScore"] = score
            matched_jobs.append(matched_job)
            
        # Sort by match score descending
        matched_jobs.sort(key=lambda x: x["matchScore"], reverse=True)
        return matched_jobs
