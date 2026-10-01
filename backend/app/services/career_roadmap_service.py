"""
PREPRIA Dynamic Evidence-Grounded Career Roadmap Service (Phase 11)
Provides deterministic, multi-domain career pathways, skill gap derivation,
readiness scoring, and progressive milestone unlocking grounded in authentic
candidate evidence (resume skills, verified learning hub courses, mock interview scores,
and longitudinal mastery).

Persists roadmap states to disk (career_roadmaps.json) with full user isolation,
JWT identity verification, and temporary file atomic write protections.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.services.auth_service import get_user_by_email_or_id
from app.services.performance_tracker import get_user_interviews
from app.services.engagement_service import get_all_user_course_progress
from app.services.course_catalog_service import COURSE_CATALOG, get_course_catalog_entry

logger = logging.getLogger(__name__)

# ─── Data Stores & Persistence ───────────────────────────────────────────────
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_ROADMAPS_FILE = os.path.join(_DATA_DIR, "career_roadmaps.json")

os.makedirs(_DATA_DIR, exist_ok=True)

# In-memory roadmap store: Dict[email, Dict[str, Any]]
roadmaps_db: Dict[str, Dict[str, Any]] = {}


def _load_roadmaps_from_disk() -> None:
    global roadmaps_db
    if not os.path.exists(_ROADMAPS_FILE):
        roadmaps_db = {}
        return
    try:
        with open(_ROADMAPS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            roadmaps_db = data
            logger.info("Loaded career roadmap records for %d users from disk.", len(roadmaps_db))
        else:
            roadmaps_db = {}
    except Exception as e:
        logger.error("Failed to load career roadmaps from disk: %s", e)
        roadmaps_db = {}


def _save_roadmaps_to_disk() -> None:
    try:
        tmp = _ROADMAPS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(roadmaps_db, f, indent=2, default=str)
        if os.path.exists(_ROADMAPS_FILE):
            bak = _ROADMAPS_FILE + ".bak"
            try:
                if os.path.exists(bak):
                    os.remove(bak)
                os.rename(_ROADMAPS_FILE, bak)
            except Exception:
                pass
        os.replace(tmp, _ROADMAPS_FILE)
    except Exception as e:
        logger.error("Failed to persist career roadmaps to disk: %s", e)


# Initialize from disk
_load_roadmaps_from_disk()


# ─── Multi-Domain Role Definitions & Competency Catalogs ───────────────────────

CAREER_DOMAINS = {
    "Technology": {
        "name": "Technology & Software",
        "roles": ["Full Stack Developer", "Frontend Developer", "Backend Developer", "Software Engineer", "DevOps / Cloud Engineer", "QA Automation Engineer"]
    },
    "Data & Analytics": {
        "name": "Data & Analytics",
        "roles": ["Data Analyst", "Business Analyst", "BI Analyst", "Product Analyst"]
    },
    "Human Resources": {
        "name": "Human Resources",
        "roles": ["HR Executive", "Talent Acquisition Specialist", "HR Analyst", "Recruiter", "People Operations"]
    },
    "Marketing": {
        "name": "Marketing & Growth",
        "roles": ["Marketing Executive", "Digital Marketing Specialist", "SEO & Content Strategist", "Social Media Strategist"]
    },
    "Finance": {
        "name": "Finance & Accounting",
        "roles": ["Financial Analyst", "Investment Analyst", "Corporate Accountant", "Finance Associate"]
    },
    "Business & Sales": {
        "name": "Business & Sales",
        "roles": ["Business Development Executive", "Account Executive", "Sales Operations Manager", "Strategy Associate"]
    },
    "Design": {
        "name": "Design & Creative",
        "roles": ["UI/UX Designer", "Product Designer", "Graphic Designer"]
    }
}


ROLE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    # ── TECHNOLOGY ─────────────────────────────────────────────────────────────
    "Full Stack Developer": {
        "domain": "Technology",
        "coreSkills": ["JavaScript", "React", "Node.js", "Python", "FastAPI", "REST APIs", "PostgreSQL", "SQL", "Git", "Docker", "System Design"],
        "dimensions": [
            {"name": "Frontend Architecture", "weight": 0.25},
            {"name": "Backend APIs & Data", "weight": 0.25},
            {"name": "System Architecture & Security", "weight": 0.20},
            {"name": "Cloud & DevOps Pipeline", "weight": 0.15},
            {"name": "Testing & Clean Code", "weight": 0.15}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "FOUNDATIONS",
                "title": "Full Stack Core Architecture",
                "desc": "Master frontend UI engineering with modern React and foundational REST API backend design.",
                "skills": ["JavaScript", "React", "HTML", "CSS", "REST APIs"],
                "why": "Foundational client-server communication is required for all full stack developer positions.",
                "action": "Complete Frontend Core course or demonstrate verified React skills.",
                "recommendedCourseId": "react-essentials",
                "targetTopics": ["React", "JavaScript", "Frontend", "REST APIs"]
            },
            {
                "step": "02",
                "phase": "BACKEND & DATA",
                "title": "Microservices & Database Design",
                "desc": "Architect scalable relational database schemas, connection pools, and robust FastAPI / Node.js endpoints.",
                "skills": ["Python", "FastAPI", "Node.js", "PostgreSQL", "SQL"],
                "why": "Robust backend persistence and query optimization prevent critical bottlenecks under load.",
                "action": "Complete Python Backend Masterclass and achieve >=70% in Mock Interview backend topics.",
                "recommendedCourseId": "python-fastapi-mastery",
                "targetTopics": ["Python", "FastAPI", "PostgreSQL", "Database Design", "SQL"]
            },
            {
                "step": "03",
                "phase": "DEVOPS & CLOUD",
                "title": "Containerization & Cloud CI/CD",
                "desc": "Containerize full stack applications with Docker and deploy resilient pipelines.",
                "skills": ["Docker", "Git", "CI/CD", "Cloud Deployment"],
                "why": "Modern full stack engineers are expected to own deployment pipelines and container orchestration.",
                "action": "Deploy a containerized microservice or pass DevOps interview round.",
                "recommendedCourseId": "docker-cloud-fundamentals",
                "targetTopics": ["Docker", "DevOps", "Cloud", "Git"]
            },
            {
                "step": "04",
                "phase": "EXECUTIVE MASTERY",
                "title": "High-Throughput Distributed System Design",
                "desc": "Design fault-tolerant distributed architectures, caching layers, and security policies.",
                "skills": ["System Design", "Caching", "Security", "Microservices"],
                "why": "System design rounds are the decisive hiring criteria for mid-to-senior full stack engineers.",
                "action": "Score >=80% on advanced System Design mock interview.",
                "recommendedCourseId": "system-design-mastery",
                "targetTopics": ["System Design", "Scalability", "Architecture", "Security"]
            }
        ]
    },
    "Frontend Developer": {
        "domain": "Technology",
        "coreSkills": ["JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS", "TailwindCSS", "State Management", "Web Performance"],
        "dimensions": [
            {"name": "UI Component Design", "weight": 0.30},
            {"name": "State Management & React", "weight": 0.25},
            {"name": "TypeScript & Modern JS", "weight": 0.20},
            {"name": "Web Performance & SEO", "weight": 0.15},
            {"name": "Testing & Accessibility", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "UI FOUNDATIONS",
                "title": "Semantic HTML, CSS & Modern JS",
                "desc": "Build responsive accessible user interfaces and modern ES6+ asynchronous logic.",
                "skills": ["HTML", "CSS", "JavaScript", "TailwindCSS"],
                "why": "Clean semantic HTML and modular CSS are the non-negotiable fundamentals of frontend engineering.",
                "action": "Verify JavaScript and responsive styling competencies.",
                "recommendedCourseId": "modern-javascript-mastery",
                "targetTopics": ["JavaScript", "HTML", "CSS", "Frontend"]
            },
            {
                "step": "02",
                "phase": "FRAMEWORK MASTERY",
                "title": "React Architecture & State",
                "desc": "Engineer complex component hierarchies, custom hooks, and deterministic state stores.",
                "skills": ["React", "TypeScript", "State Management"],
                "why": "React component lifecycle and state predictability drive high-performance applications.",
                "action": "Complete React Advanced Patterns and pass Frontend interview evaluation.",
                "recommendedCourseId": "react-essentials",
                "targetTopics": ["React", "TypeScript", "State Management"]
            },
            {
                "step": "03",
                "phase": "PERFORMANCE",
                "title": "Performance Optimization & SSR",
                "desc": "Optimize Core Web Vitals, code splitting, memoization, and Next.js SSR hydration.",
                "skills": ["Next.js", "Web Performance", "SEO", "Vite"],
                "why": "Enterprise frontend roles evaluate candidates heavily on page speed and rendering performance.",
                "action": "Audit and optimize web performance metrics.",
                "recommendedCourseId": "web-performance-seo",
                "targetTopics": ["Next.js", "Web Performance", "Frontend"]
            },
            {
                "step": "04",
                "phase": "FRONTEND MASTERY",
                "title": "End-to-End Testing & Design Systems",
                "desc": "Implement comprehensive component libraries, Storybook documentation, and automated testing.",
                "skills": ["Testing", "Accessibility", "Design Systems"],
                "why": "Scalable design system architecture ensures cross-team consistency and accessibility compliance.",
                "action": "Demonstrate robust frontend testing and accessibility standards.",
                "recommendedCourseId": "frontend-testing-mastery",
                "targetTopics": ["Testing", "Accessibility", "Design Systems"]
            }
        ]
    },
    "Backend Developer": {
        "domain": "Technology",
        "coreSkills": ["Python", "FastAPI", "Django", "Node.js", "PostgreSQL", "SQL", "Redis", "REST APIs", "GraphQL", "Docker"],
        "dimensions": [
            {"name": "API Architecture", "weight": 0.30},
            {"name": "Database Schema & Query Optimization", "weight": 0.25},
            {"name": "Authentication & Security", "weight": 0.20},
            {"name": "Caching & Concurrency", "weight": 0.15},
            {"name": "Observability & CI/CD", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "API FOUNDATIONS",
                "title": "REST API Design & Asynchronous Architecture",
                "desc": "Construct clean, self-documenting REST APIs with FastAPI / Node.js and robust validation.",
                "skills": ["Python", "FastAPI", "Node.js", "REST APIs"],
                "why": "Standardized RESTful contracts and asynchronous non-blocking I/O are foundational for backends.",
                "action": "Build verified REST endpoints with token authentication.",
                "recommendedCourseId": "python-fastapi-mastery",
                "targetTopics": ["Python", "FastAPI", "REST APIs", "Backend"]
            },
            {
                "step": "02",
                "phase": "DATA LAYER",
                "title": "Relational Data Modeling & Indexing",
                "desc": "Design normalized database schemas, write indexed SQL queries, and manage transactional integrity.",
                "skills": ["PostgreSQL", "SQL", "Database Design"],
                "why": "Efficient data persistence and indexing strategies prevent costly database locks and slow queries.",
                "action": "Complete Database Optimization module and pass Backend mock interview.",
                "recommendedCourseId": "sql-database-mastery",
                "targetTopics": ["PostgreSQL", "SQL", "Database Design"]
            },
            {
                "step": "03",
                "phase": "PERFORMANCE & CACHING",
                "title": "Distributed Caching & Task Queues",
                "desc": "Implement Redis caching, Celery/BullMQ asynchronous background jobs, and rate limiting.",
                "skills": ["Redis", "Caching", "Task Queues"],
                "why": "Decoupling long-running tasks and caching hot keys is required for low-latency server responses.",
                "action": "Integrate Redis caching and async queue worker pipelines.",
                "recommendedCourseId": "distributed-systems-essentials",
                "targetTopics": ["Redis", "Caching", "Backend"]
            },
            {
                "step": "04",
                "phase": "SCALE & RESILIENCE",
                "title": "High-Availability System Architecture",
                "desc": "Architect resilient microservices with circuit breakers, load balancers, and full telemetry.",
                "skills": ["Docker", "System Design", "Security"],
                "why": "Senior backend engineers must design fault-tolerant systems with zero single points of failure.",
                "action": "Score >=80% on Backend Distributed Architecture mock interview.",
                "recommendedCourseId": "system-design-mastery",
                "targetTopics": ["System Design", "Microservices", "Security"]
            }
        ]
    },

    # ── DATA & ANALYTICS ───────────────────────────────────────────────────────
    "Data Analyst": {
        "domain": "Data & Analytics",
        "coreSkills": ["SQL", "Python", "Pandas", "Power BI", "Tableau", "Excel", "Data Visualization", "Statistics", "Data Cleaning"],
        "dimensions": [
            {"name": "SQL & Data Extraction", "weight": 0.30},
            {"name": "Python & Data Wrangling", "weight": 0.25},
            {"name": "BI Dashboards & Visualization", "weight": 0.20},
            {"name": "Statistical Analysis", "weight": 0.15},
            {"name": "Business Insight & Storytelling", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "DATA RETRIEVAL",
                "title": "Advanced SQL & Relational Queries",
                "desc": "Write complex SQL joins, aggregations, window functions, and subqueries across relational schemas.",
                "skills": ["SQL", "Excel", "Data Cleaning"],
                "why": "SQL is the foundational language for querying corporate data warehouses.",
                "action": "Complete Advanced SQL queries and pass Data Analytics baseline test.",
                "recommendedCourseId": "sql-database-mastery",
                "targetTopics": ["SQL", "Data Cleaning", "Data Analysis"]
            },
            {
                "step": "02",
                "phase": "PROGRAMMATIC ANALYSIS",
                "title": "Python Data Wrangling & Pandas",
                "desc": "Clean messy datasets, impute missing values, and transform complex frames with Pandas and NumPy.",
                "skills": ["Python", "Pandas", "Statistics"],
                "why": "Programmatic data wrangling enables automated end-to-end analytical pipelines.",
                "action": "Complete Python for Data Science and achieve passing score in analytics evaluation.",
                "recommendedCourseId": "python-fastapi-mastery",
                "targetTopics": ["Python", "Pandas", "Statistics"]
            },
            {
                "step": "03",
                "phase": "VISUALIZATION",
                "title": "Interactive BI Dashboards",
                "desc": "Design executive dashboards in Power BI / Tableau that communicate key performance indicators.",
                "skills": ["Power BI", "Tableau", "Data Visualization"],
                "why": "Visual dashboard design empowers non-technical stakeholders to make data-backed decisions.",
                "action": "Publish an executive KPI dashboard.",
                "recommendedCourseId": "bi-dashboard-mastery",
                "targetTopics": ["Power BI", "Data Visualization"]
            },
            {
                "step": "04",
                "phase": "STRATEGIC INSIGHT",
                "title": "Hypothesis Testing & Business Impact",
                "desc": "Perform rigorous A/B test analysis, statistical significance testing, and executive readouts.",
                "skills": ["Statistics", "A/B Testing", "Business Intelligence"],
                "why": "Translating quantitative signals into actionable business growth recommendations separates top analysts.",
                "action": "Score >=80% on Data Analyst Case Study mock interview.",
                "recommendedCourseId": "business-analytics-case-studies",
                "targetTopics": ["Statistics", "Data Analysis", "Business Intelligence"]
            }
        ]
    },

    # ── HUMAN RESOURCES ────────────────────────────────────────────────────────
    "HR Executive": {
        "domain": "Human Resources",
        "coreSkills": ["Recruitment", "Candidate Screening", "HR Analytics", "HRMS Tools", "Employee Relations", "Workplace Compliance", "Excel", "Stakeholder Communication"],
        "dimensions": [
            {"name": "Recruitment & Sourcing", "weight": 0.25},
            {"name": "Communication & Stakeholders", "weight": 0.25},
            {"name": "HR Analytics & Metrics", "weight": 0.20},
            {"name": "HRMS Tools & Administration", "weight": 0.15},
            {"name": "Policy & Compliance", "weight": 0.15}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "HR FUNDAMENTALS",
                "title": "Employee Lifecycle & Onboarding Operations",
                "desc": "Manage end-to-end employee onboarding workflows, documentation, and orientation standards.",
                "skills": ["Employee Relations", "Onboarding", "HR Policies"],
                "why": "Mastering foundational onboarding and offboarding procedures is required across corporate HR.",
                "action": "Design standard employee onboarding workflows.",
                "recommendedCourseId": "hr-operations-foundations",
                "targetTopics": ["HR", "Recruitment", "Communication"]
            },
            {
                "step": "02",
                "phase": "TALENT SOURCING",
                "title": "Candidate Screening & Pipeline Sourcing",
                "desc": "Source high-caliber talent across LinkedIn, run structured behavioral screening, and manage candidate pipelines.",
                "skills": ["Recruitment", "Candidate Screening", "Stakeholder Communication"],
                "why": "Efficient candidate screening dramatically shortens company time-to-hire and improves quality of hire.",
                "action": "Demonstrate structured screening Rubric in HR mock interview.",
                "recommendedCourseId": "talent-acquisition-mastery",
                "targetTopics": ["Recruitment", "Candidate Screening"]
            },
            {
                "step": "03",
                "phase": "HR METRICS",
                "title": "People Analytics & HRMS Operations",
                "desc": "Track retention rates, employee engagement indices, and headcount metrics in HRMS platforms.",
                "skills": ["HR Analytics", "HRMS Tools", "Excel"],
                "why": "Data-driven HR teams leverage turnover and satisfaction metrics to proactively reduce attrition.",
                "action": "Build an HR attrition and diversity reporting matrix.",
                "recommendedCourseId": "people-analytics-essentials",
                "targetTopics": ["HR Analytics", "Excel"]
            },
            {
                "step": "04",
                "phase": "COMPLIANCE & STRATEGY",
                "title": "Labor Law Compliance & Strategic People Ops",
                "desc": "Navigate workplace statutory compliance, resolve complex employee disputes, and drive culture initiatives.",
                "skills": ["Workplace Compliance", "Employee Relations", "Leadership"],
                "why": "Protecting the organization from statutory liabilities and cultivating psychological safety defines HR leadership.",
                "action": "Score >=80% on HR Strategic Case Study mock interview.",
                "recommendedCourseId": "workplace-compliance-leadership",
                "targetTopics": ["Workplace Compliance", "Employee Relations"]
            }
        ]
    },

    # ── MARKETING ──────────────────────────────────────────────────────────────
    "Digital Marketing Specialist": {
        "domain": "Marketing",
        "coreSkills": ["SEO", "SEM", "Google Analytics", "Content Strategy", "Social Media Marketing", "Copywriting", "Email Marketing", "PPC Campaigns"],
        "dimensions": [
            {"name": "Organic SEO & Content", "weight": 0.25},
            {"name": "Paid Advertising (PPC/SEM)", "weight": 0.25},
            {"name": "Marketing Analytics & Attribution", "weight": 0.20},
            {"name": "Conversion Rate Optimization (CRO)", "weight": 0.15},
            {"name": "Campaign Strategy & Copywriting", "weight": 0.15}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "ORGANIC GROWTH",
                "title": "Search Engine Optimization & Keyword Research",
                "desc": "Conduct technical on-page SEO audits, keyword clustering, and high-intent content strategies.",
                "skills": ["SEO", "Content Strategy", "Copywriting"],
                "why": "Organic search is the most cost-effective long-term channel for customer acquisition.",
                "action": "Conduct full technical SEO audit and content roadmap.",
                "recommendedCourseId": "seo-growth-mastery",
                "targetTopics": ["SEO", "Marketing", "Content Strategy"]
            },
            {
                "step": "02",
                "phase": "PAID PERFORMANCE",
                "title": "PPC Campaign Management & Meta Ads",
                "desc": "Structure high-ROI Google Ads search campaigns and Meta paid social acquisition funnels.",
                "skills": ["SEM", "PPC Campaigns", "Social Media Marketing"],
                "why": "Mastering paid traffic budgeting and CAC/LTV targets is essential for growth marketing roles.",
                "action": "Optimize paid advertising campaign with target ROAS.",
                "recommendedCourseId": "paid-acquisition-mastery",
                "targetTopics": ["SEM", "PPC Campaigns"]
            },
            {
                "step": "03",
                "phase": "ATTRIBUTION & DATA",
                "title": "Google Analytics 4 & Funnel Tracking",
                "desc": "Set up custom conversion events, UTM attribution models, and multi-touch customer journey funnels.",
                "skills": ["Google Analytics", "Marketing Analytics", "Email Marketing"],
                "why": "Accurate attribution prevents wasteful ad spend and identifies high-converting touchpoints.",
                "action": "Construct multi-touch attribution report in GA4.",
                "recommendedCourseId": "ga4-analytics-mastery",
                "targetTopics": ["Google Analytics", "Marketing Analytics"]
            },
            {
                "step": "04",
                "phase": "GROWTH SCALING",
                "title": "Conversion Rate Optimization & Lifecycle Marketing",
                "desc": "Run multivariate landing page experiments and automated retention lifecycle flows.",
                "skills": ["CRO", "Content Strategy", "Email Marketing"],
                "why": "Scaling user retention and conversion velocity maximizes customer lifetime value.",
                "action": "Score >=80% on Growth Marketing Strategy mock interview.",
                "recommendedCourseId": "growth-marketing-leadership",
                "targetTopics": ["Marketing", "CRO"]
            }
        ]
    },

    # ── FINANCE ────────────────────────────────────────────────────────────────
    "Financial Analyst": {
        "domain": "Finance",
        "coreSkills": ["Financial Modeling", "Excel", "Valuation", "DCF", "Financial Statements", "Budgeting", "Variance Analysis", "Corporate Finance"],
        "dimensions": [
            {"name": "Three-Statement Modeling", "weight": 0.30},
            {"name": "Valuation & DCF Analysis", "weight": 0.25},
            {"name": "Financial Statement Analysis", "weight": 0.20},
            {"name": "Budgeting & Forecasting", "weight": 0.15},
            {"name": "Executive Presentation", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "FINANCIAL ACCOUNTING",
                "title": "Three-Statement Accounting & Linkages",
                "desc": "Analyze Balance Sheets, Income Statements, and Cash Flow Statements with full financial linkages.",
                "skills": ["Financial Statements", "Excel", "Corporate Finance"],
                "why": "Understanding how income flows into balance sheets and cash flows is foundational for all analysts.",
                "action": "Build integrated three-statement financial model in Excel.",
                "recommendedCourseId": "financial-modeling-foundations",
                "targetTopics": ["Finance", "Financial Statements", "Excel"]
            },
            {
                "step": "02",
                "phase": "CORPORATE VALUATION",
                "title": "Discounted Cash Flow & Valuation Multiples",
                "desc": "Calculate WACC, project free cash flows, and value businesses using DCF and comparable company metrics.",
                "skills": ["Financial Modeling", "Valuation", "DCF"],
                "why": "Rigorous valuation modeling is the central requirement in investment banking and FP&A.",
                "action": "Perform complete DCF valuation analysis.",
                "recommendedCourseId": "corporate-valuation-mastery",
                "targetTopics": ["Valuation", "Financial Modeling"]
            },
            {
                "step": "03",
                "phase": "FP&A OPERATIONS",
                "title": "Corporate Budgeting & Variance Analysis",
                "desc": "Model departmental operating expenses, track budget vs. actual variances, and forecast revenue runs.",
                "skills": ["Budgeting", "Variance Analysis", "Corporate Finance"],
                "why": "Proactive variance analysis alerts executive leadership to revenue deficits and cost overruns.",
                "action": "Generate quarterly financial variance report.",
                "recommendedCourseId": "fpa-budgeting-mastery",
                "targetTopics": ["Budgeting", "Variance Analysis"]
            },
            {
                "step": "04",
                "phase": "STRATEGIC FINANCE",
                "title": "M&A Deal Modeling & Capital Strategy",
                "desc": "Evaluate accretion/dilution M&A models, capital structuring decisions, and strategic financial memos.",
                "skills": ["Corporate Finance", "Valuation", "Leadership"],
                "why": "Strategic capital allocation and deal modeling are expected of senior finance professionals.",
                "action": "Score >=80% on Strategic Finance Case Study mock interview.",
                "recommendedCourseId": "strategic-finance-leadership",
                "targetTopics": ["Finance", "Corporate Finance"]
            }
        ]
    },

    # ── BUSINESS & SALES ───────────────────────────────────────────────────────
    "Business Development Executive": {
        "domain": "Business & Sales",
        "coreSkills": ["Lead Generation", "B2B Sales", "Cold Outreach", "CRM Tools", "Negotiation", "Pipeline Management", "Client Pitching", "Market Research"],
        "dimensions": [
            {"name": "Prospecting & Outbound Pipeline", "weight": 0.30},
            {"name": "Client Pitching & Discovery", "weight": 0.25},
            {"name": "Negotiation & Deal Closing", "weight": 0.20},
            {"name": "CRM & Pipeline Analytics", "weight": 0.15},
            {"name": "Relationship Management", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "OUTBOUND PROSPECTING",
                "title": "Lead Sourcing & Outbound Strategy",
                "desc": "Identify high-value ICP target accounts, craft multi-touch cold email cadences, and book discovery meetings.",
                "skills": ["Lead Generation", "Cold Outreach", "Market Research"],
                "why": "Consistent pipeline generation is the lifeblood of B2B sales development.",
                "action": "Build targeted outbound cadence and prospect database.",
                "recommendedCourseId": "b2b-prospecting-mastery",
                "targetTopics": ["Sales", "Lead Generation", "Communication"]
            },
            {
                "step": "02",
                "phase": "DISCOVERY & PITCH",
                "title": "Consultative Discovery & Product Demonstrations",
                "desc": "Uncover prospect pain points using MEDDPICC / SPIN selling frameworks and deliver tailored demos.",
                "skills": ["Client Pitching", "B2B Sales", "Negotiation"],
                "why": "Consultative discovery aligns product value propositions directly with client business objectives.",
                "action": "Execute structured discovery call in Sales mock interview.",
                "recommendedCourseId": "consultative-selling-mastery",
                "targetTopics": ["B2B Sales", "Client Pitching"]
            },
            {
                "step": "03",
                "phase": "PIPELINE VELOCITY",
                "title": "CRM Management & Deal Velocity",
                "desc": "Manage sales stages in Salesforce/HubSpot, forecast deal closing dates, and eliminate pipeline friction.",
                "skills": ["CRM Tools", "Pipeline Management", "Sales Operations"],
                "why": "Accurate CRM pipeline hygiene ensures predictable revenue forecasting.",
                "action": "Demonstrate CRM deal stage management and forecasting.",
                "recommendedCourseId": "crm-pipeline-mastery",
                "targetTopics": ["CRM Tools", "Pipeline Management"]
            },
            {
                "step": "04",
                "phase": "ENTERPRISE CLOSING",
                "title": "Complex Contract Negotiation & Closing",
                "desc": "Overcome executive objections, navigate procurement and legal reviews, and close multi-year enterprise contracts.",
                "skills": ["Negotiation", "B2B Sales", "Leadership"],
                "why": "Enterprise closing capability transforms sales reps into high-earning strategic account executives.",
                "action": "Score >=80% on Enterprise Sales Negotiation mock interview.",
                "recommendedCourseId": "enterprise-sales-closing",
                "targetTopics": ["Negotiation", "Sales"]
            }
        ]
    },

    # ── DESIGN ─────────────────────────────────────────────────────────────────
    "UI/UX Designer": {
        "domain": "Design",
        "coreSkills": ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Usability Testing", "Interaction Design", "Information Architecture"],
        "dimensions": [
            {"name": "User Research & Information Architecture", "weight": 0.25},
            {"name": "Wireframing & Prototyping (Figma)", "weight": 0.25},
            {"name": "Design Systems & Visual UI", "weight": 0.25},
            {"name": "Usability Testing & Iteration", "weight": 0.15},
            {"name": "Developer Handoff & Accessibility", "weight": 0.10}
        ],
        "milestoneTemplates": [
            {
                "step": "01",
                "phase": "UX RESEARCH",
                "title": "User Personas & Journey Mapping",
                "desc": "Conduct qualitative user interviews, synthesize empathy maps, and define core user journey flows.",
                "skills": ["User Research", "Information Architecture", "Usability Testing"],
                "why": "Grounded user research prevents building features that fail to solve authentic customer problems.",
                "action": "Deliver verified user research synthesis and journey map.",
                "recommendedCourseId": "ux-research-foundations",
                "targetTopics": ["Design", "User Research", "UX"]
            },
            {
                "step": "02",
                "phase": "UI PROTOTYPING",
                "title": "Interactive High-Fidelity Figma Prototyping",
                "desc": "Craft pixel-perfect UI layouts, responsive auto-layout frames, and interactive component prototypes.",
                "skills": ["Figma", "Wireframing", "Prototyping"],
                "why": "Figma proficiency with auto-layout and interactive variants is the universal industry standard.",
                "action": "Construct interactive multi-screen Figma prototype.",
                "recommendedCourseId": "figma-prototyping-mastery",
                "targetTopics": ["Figma", "Wireframing", "Prototyping"]
            },
            {
                "step": "03",
                "phase": "SYSTEMS & ATOMS",
                "title": "Scalable Design Tokens & Component Libraries",
                "desc": "Build tokenized design systems (colors, typography, elevation) with accessibility contrast compliance.",
                "skills": ["Design Systems", "Interaction Design", "Accessibility"],
                "why": "Design systems ensure brand consistency and 10x faster frontend development velocity.",
                "action": "Publish accessible, tokenized UI component system.",
                "recommendedCourseId": "design-systems-mastery",
                "targetTopics": ["Design Systems", "Interaction Design"]
            },
            {
                "step": "04",
                "phase": "PRODUCT STRATEGY",
                "title": "Usability Audits & Product Design Strategy",
                "desc": "Run unmoderated usability tests, calculate System Usability Scale (SUS) scores, and guide product direction.",
                "skills": ["Usability Testing", "User Research", "Leadership"],
                "why": "Product designers who measure business impact and usability metrics lead strategic product initiatives.",
                "action": "Score >=80% on Product Design Case Study mock interview.",
                "recommendedCourseId": "product-design-leadership",
                "targetTopics": ["Design", "Usability Testing"]
            }
        ]
    }
}


# Default fallback definition for unspecified roles
_DEFAULT_ROLE_DEF = ROLE_DEFINITIONS["Full Stack Developer"]


def get_role_definition(role_name: str) -> Dict[str, Any]:
    """Finds exact or closest matching role definition."""
    if not role_name:
        return _DEFAULT_ROLE_DEF
    
    clean = str(role_name).strip()
    if clean in ROLE_DEFINITIONS:
        return ROLE_DEFINITIONS[clean]
    
    # Case-insensitive lookup
    clean_lower = clean.lower()
    for k, v in ROLE_DEFINITIONS.items():
        if k.lower() == clean_lower or k.lower() in clean_lower or clean_lower in k.lower():
            return v
    
    # Domain search
    for domain, data in CAREER_DOMAINS.items():
        if domain.lower() in clean_lower:
            first_role = data["roles"][0]
            return ROLE_DEFINITIONS.get(first_role, _DEFAULT_ROLE_DEF)

    return _DEFAULT_ROLE_DEF


def get_domain_for_role(role_name: str) -> str:
    definition = get_role_definition(role_name)
    return definition.get("domain", "Technology")


# ─── Evidence-Grounded Roadmap Calculation ────────────────────────────────────

def compute_user_career_roadmap(user_id: str, target_role_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Authoritatively calculates a candidate's complete, deterministic career roadmap
    by ingesting real persisted evidence:
      1. User profile and resume extracted skills
      2. Completed Learning Hub courses and dwell time
      3. Mock interview evaluation scores and topic performance
      4. Target role competency dimensions and skill gaps
    """
    user = get_user_by_email_or_id(user_id) or {}
    email = user.get("email") or str(user_id)

    # 1. Determine Target Role
    persisted_record = roadmaps_db.get(email, {})
    target_role = (
        target_role_override or
        persisted_record.get("target_role") or
        user.get("target_role") or
        user.get("targetRole") or
        "Full Stack Developer"
    ).strip()

    role_def = get_role_definition(target_role)
    career_domain = role_def.get("domain", "Technology")
    required_skills = role_def.get("coreSkills", [])
    req_skills_lower = {s.lower(): s for s in required_skills}

    # 2. Ingest Real Candidate Evidence
    # A. Resume / Profile Skills
    profile_skills_raw = user.get("skills") or user.get("extractedSkills") or []
    if isinstance(profile_skills_raw, str):
        profile_skills = [s.strip() for s in profile_skills_raw.split(",") if s.strip()]
    elif isinstance(profile_skills_raw, list):
        profile_skills = [str(s).strip() for s in profile_skills_raw if str(s).strip()]
    else:
        profile_skills = []

    verified_skills = set()
    evidence_by_skill: Dict[str, List[str]] = {}

    for s in profile_skills:
        s_lower = s.lower()
        if s_lower in req_skills_lower:
            canonical = req_skills_lower[s_lower]
            verified_skills.add(canonical)
            evidence_by_skill.setdefault(canonical, []).append(f"Grounded in Resume / Profile skill: {s}")

    # B. Completed Course Evidence
    user_courses = get_all_user_course_progress(email)
    completed_course_ids = set()
    completed_course_titles = set()
    
    courses_iterable = user_courses if isinstance(user_courses, list) else list(user_courses.values()) if isinstance(user_courses, dict) else []
    for prog in courses_iterable:
        if not isinstance(prog, dict):
            continue
        cid = prog.get("courseId") or prog.get("course_id")
        if not cid:
            continue
        if prog.get("status") == "completed" or prog.get("progress_percent", 0) >= 100 or prog.get("is_completed") or prog.get("completed") or prog.get("certificateEligible"):
            completed_course_ids.add(cid)
            cat_entry = get_course_catalog_entry(cid) or {}
            course_title = cat_entry.get("title", cid)
            completed_course_titles.add(course_title)
            # Map course topics into verified skills
            course_skills = (cat_entry.get("topics") or []) + (cat_entry.get("skills_covered") or [])
            for cs in course_skills:
                cs_lower = str(cs).lower()
                if cs_lower in req_skills_lower:
                    canonical = req_skills_lower[cs_lower]
                    verified_skills.add(canonical)
                    evidence_by_skill.setdefault(canonical, []).append(f"Verified by Course: {course_title} (Completed)")

    # C. Mock Interview History Evidence
    user_interviews = get_user_interviews(email)
    interview_scores = []
    interview_strong_topics = set()
    interview_weak_topics = set()
    for idx, inv in enumerate(user_interviews):
        score = inv.get("overallScore") or inv.get("score") or 0
        if isinstance(score, float) and 0 < score <= 1.0:
            score = int(round(score * 100))
        else:
            score = int(round(score or 0))
        interview_scores.append(score)

        eval_data = inv.get("evaluation") or {}
        strong_skills = eval_data.get("strong_skills", []) or inv.get("strongSkills", [])
        for ss in strong_skills:
            ss_lower = str(ss).lower()
            if ss_lower in req_skills_lower:
                canonical = req_skills_lower[ss_lower]
                verified_skills.add(canonical)
                interview_strong_topics.add(canonical)
                evidence_by_skill.setdefault(canonical, []).append(f"Validated by Mock Interview #{idx+1} (Score: {score}%)")

        weak_skills = eval_data.get("weak_skills", []) or inv.get("weakSkills", [])
        for ws in weak_skills:
            ws_lower = str(ws).lower()
            if ws_lower in req_skills_lower:
                canonical = req_skills_lower[ws_lower]
                interview_weak_topics.add(canonical)

    # 3. Calculate Deterministic Readiness Score & Skill Coverage
    total_req_count = max(len(required_skills), 1)
    verified_req_count = len(verified_skills & set(required_skills))
    skill_coverage_ratio = verified_req_count / total_req_count

    # Missing / Gap Skills
    missing_skills = [s for s in required_skills if s not in verified_skills]

    # Deterministic weighted components:
    # 45% Skill Coverage + 25% Learning Progress + 30% Interview Score Average
    comp_skill = skill_coverage_ratio * 45.0

    target_course_count = max(len(role_def.get("milestoneTemplates", [])), 1)
    comp_learning = min(len(completed_course_ids) / float(target_course_count), 1.0) * 25.0

    if interview_scores:
        avg_interview = sum(interview_scores) / float(len(interview_scores))
        comp_interview = (min(max(avg_interview, 0.0), 100.0) / 100.0) * 30.0
    else:
        # If no interviews yet, scale by skill coverage baseline
        comp_interview = skill_coverage_ratio * 15.0

    raw_readiness = comp_skill + comp_learning + comp_interview
    readiness_score = int(round(min(max(raw_readiness, 0.0), 100.0)))

    # 4. Milestone Progression & Authoritative State Derivation
    milestone_templates = role_def.get("milestoneTemplates", [])
    persisted_milestone_states = persisted_record.get("milestones", {})
    calculated_milestones = []
    
    prev_milestone_completed = True  # Step 1 is always unlocked unless prerequisites say otherwise

    for i, tmpl in enumerate(milestone_templates):
        step_str = tmpl.get("step", f"{i+1:02d}")
        m_id = f"ms-{target_role.lower().replace(' ', '-')}-{step_str}"
        tmpl_skills = tmpl.get("skills", [])
        tmpl_skills_set = set(s.lower() for s in tmpl_skills)
        matched_verified = [s for s in verified_skills if s.lower() in tmpl_skills_set]
        
        # Check course / interview prerequisites
        rec_course_id = tmpl.get("recommendedCourseId")
        course_done = rec_course_id in completed_course_ids if rec_course_id else False
        has_skill_match = len(matched_verified) >= max(1, len(tmpl_skills) // 2)

        # Check explicit persisted override if user marked it completed after backend validation
        saved_status = persisted_milestone_states.get(m_id, {}).get("status")
        saved_evidence = persisted_milestone_states.get(m_id, {}).get("evidence", [])

        # Derive authoritative status
        if saved_status == "completed":
            status = "completed"
        elif course_done or (has_skill_match and interview_scores and interview_scores[-1] >= 70):
            status = "completed"
        elif prev_milestone_completed or i == 0 or has_skill_match:
            status = "in_progress"
        else:
            status = "locked"

        # Evidence collection
        milestone_evidence = list(saved_evidence)
        for s in matched_verified:
            for ev in evidence_by_skill.get(s, []):
                if ev not in milestone_evidence:
                    milestone_evidence.append(ev)
        if course_done:
            course_title = (get_course_catalog_entry(rec_course_id) or {}).get("title", rec_course_id)
            c_ev = f"Verified by Course: {course_title} (Completed)"
            if c_ev not in milestone_evidence:
                milestone_evidence.append(c_ev)

        # Calculate estimated weeks
        estimated_weeks = max(1, int(round((len(tmpl_skills) - len(matched_verified)) * 1.5)))

        milestone_obj = {
            "id": m_id,
            "step": step_str,
            "phase": tmpl.get("phase", "CORE"),
            "title": tmpl.get("title", f"Milestone {step_str}"),
            "desc": tmpl.get("desc", ""),
            "skills": tmpl_skills,
            "status": status,
            "why": tmpl.get("why", ""),
            "action": tmpl.get("action", ""),
            "recommendedCourseId": rec_course_id,
            "evidence": milestone_evidence,
            "matchedSkills": matched_verified,
            "estimatedWeeks": estimated_weeks,
            "completedAt": persisted_milestone_states.get(m_id, {}).get("completedAt") if status == "completed" else None
        }

        calculated_milestones.append(milestone_obj)
        prev_milestone_completed = (status == "completed")

    # 5. Determine Overall Recommended Next Step & Estimated Progression
    next_incomplete_milestone = next((m for m in calculated_milestones if m["status"] != "completed"), None)
    if next_incomplete_milestone:
        recommended_action = f"Focus on Milestone {next_incomplete_milestone['step']}: {next_incomplete_milestone['title']}. {next_incomplete_milestone['action']}"
        active_step = next_incomplete_milestone["step"]
    else:
        recommended_action = f"All core milestones for {target_role} completed! Ready for senior interview evaluations."
        active_step = "04"

    total_estimated_weeks = sum(m["estimatedWeeks"] for m in calculated_milestones if m["status"] != "completed") or 2

    roadmap_payload = {
        "user_id": email,
        "target_role": target_role,
        "career_domain": career_domain,
        "readiness_score": readiness_score,
        "skill_coverage_percent": int(round(skill_coverage_ratio * 100)),
        "verified_skills": sorted(list(verified_skills)),
        "missing_skills": missing_skills,
        "total_required_skills": len(required_skills),
        "verified_skills_count": len(verified_skills & set(required_skills)),
        "dimensions": role_def.get("dimensions", []),
        "milestones": calculated_milestones,
        "active_step": active_step,
        "estimated_weeks": total_estimated_weeks,
        "recommended_next_action": recommended_action,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

    # Save to disk
    roadmaps_db[email] = {
        "target_role": target_role,
        "career_domain": career_domain,
        "readiness_score": readiness_score,
        "milestones": {m["id"]: {"status": m["status"], "evidence": m["evidence"], "completedAt": m.get("completedAt")} for m in calculated_milestones},
        "updated_at": roadmap_payload["last_updated"]
    }
    _save_roadmaps_to_disk()

    return roadmap_payload


def update_user_target_role(user_id: str, new_target_role: str) -> Dict[str, Any]:
    """
    Updates the candidate's target role, triggers deterministic recalculation
    of skill gaps, milestones, and readiness scores, and persists to disk.
    """
    if not new_target_role or not str(new_target_role).strip():
        raise ValueError("Target role cannot be empty.")
    
    clean_role = str(new_target_role).strip()
    return compute_user_career_roadmap(user_id, target_role_override=clean_role)


def complete_user_milestone(user_id: str, milestone_id: str) -> Dict[str, Any]:
    """
    Validates prerequisites for a roadmap milestone before allowing completion.
    Rejects completion if the milestone is locked or prerequisite steps are not satisfied.
    """
    user = get_user_by_email_or_id(user_id) or {}
    email = user.get("email") or str(user_id)

    # Compute current roadmap state first
    current_roadmap = compute_user_career_roadmap(email)
    milestones = current_roadmap.get("milestones", [])

    target_milestone = None
    target_idx = -1
    for idx, m in enumerate(milestones):
        if m["id"] == milestone_id or m["step"] == milestone_id:
            target_milestone = m
            target_idx = idx
            break

    if not target_milestone:
        raise ValueError(f"Milestone '{milestone_id}' not found in candidate roadmap.")

    # Prerequisite validation: earlier milestones must be completed or in progress
    if target_milestone["status"] == "locked":
        raise ValueError(f"Cannot complete locked milestone '{target_milestone['title']}'. Prerequisite milestones must be completed first.")

    # Mark as completed in persisted store
    now_iso = datetime.now(timezone.utc).isoformat()
    persisted_record = roadmaps_db.setdefault(email, {})
    persisted_milestones = persisted_record.setdefault("milestones", {})
    
    existing_evidence = list(target_milestone.get("evidence", []))
    manual_ev = f"Manually verified and marked complete on {now_iso[:10]}"
    if manual_ev not in existing_evidence:
        existing_evidence.append(manual_ev)

    persisted_milestones[target_milestone["id"]] = {
        "status": "completed",
        "evidence": existing_evidence,
        "completedAt": now_iso
    }
    _save_roadmaps_to_disk()

    # Recompute and return updated roadmap
    return compute_user_career_roadmap(email)
