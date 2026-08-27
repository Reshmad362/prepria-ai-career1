from typing import List, Dict, Any, Optional
import json

# Comprehensive multi-domain jobs dataset for PREPRIA Career Opportunities
MOCK_CAREER_OPPORTUNITIES = [
  # ──────────────────────────────────────────────────
  # TECHNOLOGY & SOFTWARE
  # ──────────────────────────────────────────────────
  {
    "id": "job-tech-1",
    "title": "Senior Frontend Engineer",
    "company": "Stripe",
    "logo": "S",
    "location": "San Francisco, CA (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Senior Level",
    "salary": "$160,000 - $195,000",
    "postedDate": "1 day ago",
    "category": "Frontend",
    "domain": "Technology",
    "department": "Core Product Engineering",
    "applicationUrl": "https://stripe.com/jobs",
    "description": "We are looking for a Senior Frontend Engineer to build high-scale, accessible merchant dashboards and developer surfaces using React, TypeScript, and modern design systems.",
    "requiredSkills": ["React", "TypeScript", "JavaScript", "Next.js", "CSS3", "Web Accessibility", "REST APIs"],
    "preferredSkills": ["GraphQL", "Zustand", "Jest", "Tailwind CSS", "Design Systems"],
    "benefits": ["Comprehensive Health Coverage", "401(k) Matching", "Remote Flexibility", "$3,000 Annual Learning Budget"]
  },
  {
    "id": "job-tech-2",
    "title": "Full Stack Developer",
    "company": "Vercel",
    "logo": "V",
    "location": "Remote (US/Global)",
    "workType": "Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$135,000 - $165,000",
    "postedDate": "2 days ago",
    "category": "Full Stack",
    "domain": "Technology",
    "department": "Platform SDK & Frameworks",
    "applicationUrl": "https://vercel.com/careers",
    "description": "Join Vercel's framework team building full-stack applications with Next.js App Router, Server Components, Node.js, and edge computing primitives.",
    "requiredSkills": ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "Git", "REST APIs"],
    "preferredSkills": ["Server Components", "PostgreSQL", "Prisma", "Docker", "Redis"],
    "benefits": ["100% Remote Culture", "Home Office Setup Stipend", "Unlimited PTO", "Equity Grants"]
  },
  {
    "id": "job-tech-3",
    "title": "Backend Software Engineer",
    "company": "Datadog",
    "logo": "D",
    "location": "New York, NY (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$140,000 - $175,000",
    "postedDate": "3 days ago",
    "category": "Backend",
    "domain": "Technology",
    "department": "Distributed Ingestion Engine",
    "applicationUrl": "https://careers.datadoghq.com",
    "description": "Build high-throughput, low-latency microservices handling millions of events per second with Node.js, Python FastAPI, PostgreSQL, and Kafka.",
    "requiredSkills": ["Node.js", "Python", "PostgreSQL", "REST APIs", "SQL", "Docker", "System Design"],
    "preferredSkills": ["Redis", "Apache Kafka", "FastAPI", "Microservices", "AWS"],
    "benefits": ["Competitive Equity", "Gym Membership", "Generous Parental Leave", "Catered Lunches"]
  },
  {
    "id": "job-tech-4",
    "title": "Cloud DevOps & Platform Engineer",
    "company": "HashiCorp",
    "logo": "H",
    "location": "Austin, TX (Remote)",
    "workType": "Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Senior Level",
    "salary": "$150,000 - $185,000",
    "postedDate": "Just now",
    "category": "DevOps",
    "domain": "Technology",
    "department": "Cloud Infrastructure",
    "applicationUrl": "https://www.hashicorp.com/careers",
    "description": "Architect automated CI/CD deployment pipelines, manage container fleets on AWS ECS/EKS, and automate infrastructure with Terraform and AWS CDK.",
    "requiredSkills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Git"],
    "preferredSkills": ["AWS CodePipeline", "Prometheus", "Grafana", "Python", "Bash"],
    "benefits": ["Flexible Hours", "Health & Wellness Allowance", "Remote Setup Budget", "Education Reimbursement"]
  },
  {
    "id": "job-tech-5",
    "title": "Junior Frontend Developer",
    "company": "Shopify",
    "logo": "S",
    "location": "Toronto, ON (Remote)",
    "workType": "Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Entry Level",
    "salary": "$85,000 - $110,000",
    "postedDate": "4 days ago",
    "category": "Frontend",
    "domain": "Technology",
    "department": "Merchant Experience",
    "applicationUrl": "https://www.shopify.com/careers",
    "description": "Develop responsive, customer-facing commerce storefront components using React, modern JavaScript ES6+, HTML5 semantic markup, and CSS3.",
    "requiredSkills": ["React", "JavaScript", "HTML5", "CSS3", "Git", "Responsive Design"],
    "preferredSkills": ["TypeScript", "Tailwind CSS", "REST APIs", "Jest"],
    "benefits": ["Mentorship Program", "Health Benefits", "Home Internet Stipend", "Learning & Development Fund"]
  },

  # ──────────────────────────────────────────────────
  # HUMAN RESOURCES & PEOPLE OPERATIONS
  # ──────────────────────────────────────────────────
  {
    "id": "job-hr-1",
    "title": "Talent Acquisition Specialist",
    "company": "Airbnb",
    "logo": "A",
    "location": "San Francisco, CA (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$95,000 - $125,000",
    "postedDate": "1 day ago",
    "category": "HR",
    "domain": "Human Resources",
    "department": "Global Talent Team",
    "applicationUrl": "https://careers.airbnb.com",
    "description": "Lead end-to-end recruitment pipelines, partner with engineering hiring managers, source passive candidates via LinkedIn Recruiter, and conduct structured behavioral interviews.",
    "requiredSkills": ["Recruitment", "Talent Sourcing", "LinkedIn Recruiter", "Candidate Screening", "Structured Interviewing", "Stakeholder Communication"],
    "preferredSkills": ["HR Analytics", "Greenhouse ATS", "Employer Branding", "Offer Negotiation"],
    "benefits": ["Annual Travel Credit", "Comprehensive Health Plan", "Flexible Working Hours", "Employee Stock Purchase"]
  },
  {
    "id": "job-hr-2",
    "title": "Human Resources Executive",
    "company": "Deloitte",
    "logo": "D",
    "location": "Chicago, IL (On-site)",
    "workType": "On-site",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$90,000 - $115,000",
    "postedDate": "2 days ago",
    "category": "HR",
    "domain": "Human Resources",
    "department": "People & Performance",
    "applicationUrl": "https://www2.deloitte.com/careers",
    "description": "Manage employee lifecycle operations, new hire onboarding journeys, performance appraisal cycles, HRMS administration, and workplace compliance.",
    "requiredSkills": ["HR Management", "Employee Onboarding", "HRMS Software", "Employee Relations", "Performance Management", "Workplace Compliance"],
    "preferredSkills": ["Workday", "Excel", "POSH Act Compliance", "Attrition Modeling"],
    "benefits": ["Comprehensive Medical", "401(k) Match", "Tuition Assistance", "Paid Time Off"]
  },
  {
    "id": "job-hr-3",
    "title": "People Operations & HR Analyst",
    "company": "Canva",
    "logo": "C",
    "location": "Austin, TX (Remote)",
    "workType": "Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Entry Level",
    "salary": "$75,000 - $95,000",
    "postedDate": "5 days ago",
    "category": "HR",
    "domain": "Human Resources",
    "department": "People Analytics",
    "applicationUrl": "https://www.canva.com/careers",
    "description": "Analyze employee engagement survey data, build headcount turnover reports in Excel, support HR operations, and optimize onboarding processes.",
    "requiredSkills": ["HR Analytics", "Excel", "Employee Lifecycle", "Data Analysis", "Candidate Screening"],
    "preferredSkills": ["Tableau", "HRMS Software", "Survey Design", "Communication"],
    "benefits": ["Free Canva Pro", "Flexible Schedule", "Health Insurance", "Wellness Budget"]
  },

  # ──────────────────────────────────────────────────
  # MARKETING & GROWTH
  # ──────────────────────────────────────────────────
  {
    "id": "job-mkt-1",
    "title": "Digital Growth Marketing Specialist",
    "company": "HubSpot",
    "logo": "H",
    "location": "Boston, MA (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$95,000 - $125,000",
    "postedDate": "1 day ago",
    "category": "Marketing",
    "domain": "Marketing",
    "department": "Inbound Demand Gen",
    "applicationUrl": "https://www.hubspot.com/careers",
    "description": "Manage multi-channel customer acquisition across Google Ads PPC, SEO keyword clusters, email lifecycle nurture funnels, and Google Analytics 4 tracking.",
    "requiredSkills": ["Digital Marketing", "SEO Strategy", "Google Ads", "GA4", "Email Marketing", "Copywriting"],
    "preferredSkills": ["HubSpot CRM", "Conversion Rate Optimization", "Meta Ads", "A/B Testing"],
    "benefits": ["Unlimited Vacation", "Tuition Reimbursement", "Parental Leave", "Stock Options"]
  },
  {
    "id": "job-mkt-2",
    "title": "SEO & Content Marketing Strategist",
    "company": "Notion",
    "logo": "N",
    "location": "San Francisco, CA (Remote)",
    "workType": "Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$100,000 - $130,000",
    "postedDate": "3 days ago",
    "category": "Marketing",
    "domain": "Marketing",
    "department": "Organic Growth",
    "applicationUrl": "https://www.notion.so/careers",
    "description": "Drive exponential organic search traffic through technical SEO audits, high-converting product guides, pillar-and-cluster content architecture, and backlink strategies.",
    "requiredSkills": ["SEO", "Content Marketing", "Technical SEO", "Keyword Research", "Copywriting", "GA4"],
    "preferredSkills": ["Ahrefs / Semrush", "Schema Markup", "WordPress", "Data Storytelling"],
    "benefits": ["Remote First", "Annual Wellness Stipend", "Equipment Budget", "Comprehensive Healthcare"]
  },
  {
    "id": "job-mkt-3",
    "title": "Performance Marketing Lead",
    "company": "DoorDash",
    "logo": "D",
    "location": "New York, NY (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Senior Level",
    "salary": "$135,000 - $165,000",
    "postedDate": "4 days ago",
    "category": "Marketing",
    "domain": "Marketing",
    "department": "Growth & Paid Acquisition",
    "applicationUrl": "https://careers.doordash.com",
    "description": "Scale multi-million dollar performance marketing budgets across Meta Ads Manager, Google Search, TikTok, and App Install campaigns with strict ROAS targets.",
    "requiredSkills": ["Performance Marketing", "Meta Ads Manager", "Google Ads", "ROAS Optimization", "Marketing Attribution", "Data Analysis"],
    "preferredSkills": ["Conversions API (CAPI)", "Lookalike Audiences", "SQL", "Tableau"],
    "benefits": ["DoorDash Credits", "Competitive 401(k)", "Full Medical/Dental", "Learning Credits"]
  },

  # ──────────────────────────────────────────────────
  # DATA & ANALYTICS
  # ──────────────────────────────────────────────────
  {
    "id": "job-data-1",
    "title": "Business Intelligence & Data Analyst",
    "company": "Spotify",
    "logo": "S",
    "location": "New York, NY (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$115,000 - $145,000",
    "postedDate": "2 days ago",
    "category": "Data",
    "domain": "Data & Analytics",
    "department": "Creator Analytics",
    "applicationUrl": "https://www.lifeatspotify.com/jobs",
    "description": "Transform multi-terabyte music listening and creator data into actionable business intelligence dashboards using complex SQL, Power BI, Python Pandas, and Star Schema modeling.",
    "requiredSkills": ["SQL", "Data Analysis", "Power BI", "Data Modeling", "Excel", "Business Intelligence"],
    "preferredSkills": ["Python", "Pandas", "Tableau", "Window Functions", "DAX Formulas"],
    "benefits": ["Spotify Premium for Life", "Flexible Workplace Policy", "Health & Dental", "Retirement Plan"]
  },
  {
    "id": "job-data-2",
    "title": "Junior Data Analyst",
    "company": "Amazon",
    "logo": "A",
    "location": "Seattle, WA (On-site)",
    "workType": "On-site",
    "employmentType": "Full-time",
    "experienceLevel": "Entry Level",
    "salary": "$80,000 - $105,000",
    "postedDate": "3 days ago",
    "category": "Data",
    "domain": "Data & Analytics",
    "department": "Operations Intelligence",
    "applicationUrl": "https://www.amazon.jobs",
    "description": "Analyze logistics performance data, write relational SQL queries, build operational Excel models, and create automated KPI reporting workflows.",
    "requiredSkills": ["SQL", "Excel", "Data Analysis", "Relational Joins", "Data Cleaning"],
    "preferredSkills": ["Python", "Power BI", "Statistics", "Tableau"],
    "benefits": ["Comprehensive Benefits Day 1", "Career Advancement Pathways", "Employee Discounts", "401(k) Match"]
  },
  {
    "id": "job-data-3",
    "title": "Senior Data Analyst (Product & Growth)",
    "company": "Uber",
    "logo": "U",
    "location": "San Francisco, CA (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Senior Level",
    "salary": "$145,000 - $180,000",
    "postedDate": "Just now",
    "category": "Data",
    "domain": "Data & Analytics",
    "department": "Rider Growth Analytics",
    "applicationUrl": "https://www.uber.com/careers",
    "description": "Lead A/B test experimentation analysis, cohort retention modeling, SQL window function queries, and metric trees to identify driver and rider funnel friction.",
    "requiredSkills": ["SQL", "Data Analysis", "A/B Testing Math", "Python", "Cohort Retention", "Metric Trees", "Tableau"],
    "preferredSkills": ["Snowflake", "dbt", "Predictive Analytics", "Machine Learning"],
    "benefits": ["Uber Credits", "Health & Wellness Allowance", "Generous Equity", "Annual Learning Fund"]
  },

  # ──────────────────────────────────────────────────
  # FINANCE & BUSINESS
  # ──────────────────────────────────────────────────
  {
    "id": "job-fin-1",
    "title": "Financial Analyst (FP&A)",
    "company": "Goldman Sachs",
    "logo": "G",
    "location": "New York, NY (On-site)",
    "workType": "On-site",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$110,000 - $140,000",
    "postedDate": "2 days ago",
    "category": "Finance",
    "domain": "Finance & Accounting",
    "department": "Corporate FP&A",
    "applicationUrl": "https://www.goldmansachs.com/careers",
    "description": "Build three-statement financial models, forecast quarterly departmental revenues and expenses, conduct variance analysis, and prepare executive board presentations in Excel.",
    "requiredSkills": ["Financial Modeling", "Excel", "Data Analysis", "Financial Analysis", "Budgeting", "Variance Analysis"],
    "preferredSkills": ["SQL", "Power BI", "Accounting Principles", "PowerPoint"],
    "benefits": ["Top-tier Healthcare", "Performance Bonus", "Retirement Matching", "Onsite Gym"]
  },
  {
    "id": "job-biz-1",
    "title": "Business Operations Analyst",
    "company": "McKinsey & Company",
    "logo": "M",
    "location": "Atlanta, GA (Hybrid)",
    "workType": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid Level",
    "salary": "$105,000 - $135,000",
    "postedDate": "4 days ago",
    "category": "Business",
    "domain": "Business & Sales",
    "department": "Operations Practice",
    "applicationUrl": "https://www.mckinsey.com/careers",
    "description": "Conduct quantitative process flow analyses, evaluate supply chain efficiencies, design executive KPI dashboards, and streamline cross-functional business operations.",
    "requiredSkills": ["Business Analysis", "Excel", "Process Optimization", "Stakeholder Communication", "Data Analysis"],
    "preferredSkills": ["SQL", "Tableau", "Project Management", "Agile"],
    "benefits": ["Executive Coaching", "Full Health & Dental", "Travel Perks", "Comprehensive Retirement"]
  }
]

class JobService:
    def __init__(self):
        self.jobs = MOCK_CAREER_OPPORTUNITIES

    def get_all_jobs(self) -> List[Dict[str, Any]]:
        return self.jobs

    def calculate_skill_match(self, job_skills: List[str], user_skills: List[str]) -> Dict[str, Any]:
        if not job_skills:
            return {"score": 0, "matched": [], "missing": []}
        
        job_skills_lower = {s.lower(): s for s in job_skills}
        user_skills_lower = {s.lower() for s in (user_skills or [])}

        matched = []
        missing = []

        for s_lower, orig_name in job_skills_lower.items():
            # Substring and fuzzy check
            has_match = any(
                s_lower in u or u in s_lower or s_lower.replace(" ", "") in u.replace(" ", "")
                for u in user_skills_lower
            )
            if has_match:
                matched.append(orig_name)
            else:
                missing.append(orig_name)

        match_ratio = len(matched) / len(job_skills)
        # Base match score between 35% and 96%
        raw_score = int(match_ratio * 100)
        score = min(96, max(30, raw_score))

        return {
            "score": score,
            "matchedSkills": matched,
            "missingSkills": missing,
            "totalRequired": len(job_skills)
        }

    def match_jobs_for_user(self, user_skills: List[str], target_role: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for job in self.jobs:
            analysis = self.calculate_skill_match(job.get("requiredSkills", []), user_skills)
            
            # Boost score if job title or category matches user's target role
            role_boost = 0
            if target_role:
                tr_lower = target_role.lower()
                title_lower = job.get("title", "").lower()
                cat_lower = job.get("category", "").lower()
                domain_lower = job.get("domain", "").lower()

                if tr_lower in title_lower or title_lower in tr_lower:
                    role_boost += 8
                elif any(word in title_lower for word in tr_lower.split() if len(word) > 2):
                    role_boost += 4
                elif cat_lower in tr_lower or domain_lower in tr_lower:
                    role_boost += 3

            final_score = min(96, analysis["score"] + role_boost)

            matched_job = job.copy()
            matched_job["matchScore"] = final_score
            matched_job["matchedSkills"] = analysis["matchedSkills"]
            matched_job["missingSkills"] = analysis["missingSkills"]
            
            # Dynamic readiness calculation
            resume_readiness = min(98, max(50, final_score + 6))
            skills_readiness = analysis["score"]
            interview_readiness = min(95, max(45, final_score - 8))
            overall_readiness = int((resume_readiness * 0.35) + (skills_readiness * 0.45) + (interview_readiness * 0.20))

            matched_job["readiness"] = {
                "resume": resume_readiness,
                "skills": skills_readiness,
                "interview": interview_readiness,
                "overall": overall_readiness
            }

            # AI Recommendation Explanation
            if len(analysis["missingSkills"]) > 0:
                top_gap = analysis["missingSkills"][0]
                matched_job["aiRecommendation"] = f"Your resume matches {len(analysis['matchedSkills'])} of {len(job.get('requiredSkills', []))} core requirements. Your key area to strengthen is {top_gap}. Preparing this competency will enhance your readiness."
            else:
                matched_job["aiRecommendation"] = f"Outstanding match! Your profile demonstrates strong coverage across all {len(analysis['matchedSkills'])} core requirements for this role."

            results.append(matched_job)

        # Sort by match score descending
        results.sort(key=lambda x: x["matchScore"], reverse=True)
        return results
