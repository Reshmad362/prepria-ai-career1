/**
 * PREPRIA Multi-Domain AI Mock Interview Engine & Comprehensive Question Bank
 * Covers 40+ Technical, Data, Business, HR, Marketing, Finance, Sales, and Design roles
 * with adaptive question generation, dimension scoring, and longitudinal intelligence.
 */

export const INTERVIEW_ROLES_CATALOG = [
  // ──────────────────────────────────────────────────
  // TECHNOLOGY & ENGINEERING
  // ──────────────────────────────────────────────────
  {
    id: "fe-dev",
    name: "Frontend Developer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Code2",
    description: "Master React, Next.js, state management, CSS layouts, Web Vitals performance, and modern browser APIs.",
    types: ["Technical", "System Design", "Coding / Problem Solving", "Behavioral", "Mixed"],
    skills: ["React", "TypeScript", "JavaScript", "Next.js", "CSS3", "Web Performance", "State Management"],
    sampleTopics: ["Virtual DOM Reconciliation", "Core Web Vitals", "Custom Hooks", "State Architecture"]
  },
  {
    id: "be-dev",
    name: "Backend Developer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Server",
    description: "Practice REST API design, microservices, PostgreSQL/MongoDB, Redis caching, async queues, and system scalability.",
    types: ["Technical", "System Design", "Database & Indexing", "Behavioral", "Mixed"],
    skills: ["Node.js", "Python", "PostgreSQL", "Redis", "REST APIs", "Microservices", "Docker"],
    sampleTopics: ["Event Loop & Async I/O", "ACID Transactions", "Database Indexing", "Message Queues"]
  },
  {
    id: "fs-dev",
    name: "Full Stack Developer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Layers",
    description: "Full-spectrum engineering: modern UI frameworks, backend APIs, relational database design, auth, and cloud deployment.",
    types: ["Full Stack Technical", "System Architecture", "Problem Solving", "Behavioral", "Mixed"],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js", "REST APIs", "Docker"],
    sampleTopics: ["Client vs Server Rendering", "End-to-End Type Safety", "API Security & JWT", "Database Modeling"]
  },
  {
    id: "sw-eng",
    name: "Software Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Code2",
    description: "Core computer science fundamentals, data structures, algorithms, object-oriented design, concurrency, and clean code.",
    types: ["Data Structures & Algorithms", "System Design", "OOP & Design Patterns", "Behavioral", "Mixed"],
    skills: ["Data Structures", "Algorithms", "Java / C++ / Python", "Design Patterns", "Concurrency", "Unit Testing"],
    sampleTopics: ["Time & Space Complexity", "Concurrency & Thread Safety", "SOLID Principles", "Memory Management"]
  },
  {
    id: "mobile-dev",
    name: "Mobile Developer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Smartphone",
    description: "Cross-platform and native mobile architecture (React Native / Flutter / iOS / Android), state, offline storage, and performance.",
    types: ["Mobile Technical", "Architecture & Offline Sync", "UI Performance", "Behavioral", "Mixed"],
    skills: ["React Native", "Flutter", "Swift / Kotlin", "Offline SQLite", "Push Notifications", "App Store Guidelines"],
    sampleTopics: ["Bridge vs Fabric/JSI", "Offline Sync & Conflicts", "Battery & Memory Optimization", "Deep Linking"]
  },
  {
    id: "devops-eng",
    name: "DevOps Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "Cloud",
    description: "Infrastructure as Code, CI/CD pipelines, container orchestration (Docker/Kubernetes), AWS, and SRE observability.",
    types: ["Cloud & Infrastructure", "CI/CD & Automation", "Incident Management", "Behavioral", "Mixed"],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Prometheus"],
    sampleTopics: ["Blue-Green Deployments", "Terraform State Locking", "Kubernetes Ingress", "Observability & SRE"]
  },
  {
    id: "cloud-eng",
    name: "Cloud Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "Cloud",
    description: "Multi-cloud architecture (AWS/GCP/Azure), VPC networking, IAM least-privilege, serverless Lambda, and cost optimization.",
    types: ["Cloud Architecture", "Networking & Security", "Serverless & Compute", "Behavioral", "Mixed"],
    skills: ["AWS", "GCP", "VPC & Subnets", "IAM Policies", "Serverless Lambda", "CloudFormation", "Cost Optimization"],
    sampleTopics: ["VPC Peering vs Transit Gateway", "S3 Lifecycle & Glacier", "IAM Role Delegation", "Auto-scaling Groups"]
  },
  {
    id: "qa-eng",
    name: "QA Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "CheckCircle",
    description: "Manual & exploratory testing, test case design, defect tracking, boundary value analysis, and regression strategies.",
    types: ["Test Strategy & Design", "Defect Management", "Regression Testing", "Behavioral", "Mixed"],
    skills: ["Test Case Design", "Jira", "Boundary Value Analysis", "Regression Testing", "API Testing (Postman)"],
    sampleTopics: ["Equivalence Partitioning", "Writing Bug Reports with Traceability", "Acceptance Testing", "Smoke vs Sanity"]
  },
  {
    id: "auto-test-eng",
    name: "Automation Test Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "CheckCircle",
    description: "Playwright, Cypress, Selenium WebDriver, Jest, API test automation, and CI/CD test pipeline integration.",
    types: ["Automation Frameworks", "E2E & Integration Testing", "CI/CD Pipeline Integration", "Behavioral", "Mixed"],
    skills: ["Playwright", "Cypress", "Selenium", "Jest", "Postman / Newman", "CI/CD Integration"],
    sampleTopics: ["Page Object Model", "Flaky Test Elimination", "Parallel Test Execution", "Mocking Network Requests"]
  },
  {
    id: "cyber-sec",
    name: "Cybersecurity Analyst",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "ShieldAlert",
    description: "Threat modeling, OWASP Top 10 vulnerabilities, SIEM log analysis, network security, and incident response protocols.",
    types: ["Security Architecture", "Vulnerability & Threat Modeling", "Incident Response", "Behavioral", "Mixed"],
    skills: ["OWASP Top 10", "Network Security", "SIEM", "Vulnerability Scanning", "Cryptography", "IAM"],
    sampleTopics: ["Cross-Site Scripting (XSS)", "SQL Injection Prevention", "Zero-Trust Architecture", "Incident Triage"]
  },
  {
    id: "net-eng",
    name: "Network Engineer",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Zap",
    description: "TCP/IP protocol stack, BGP/OSPF routing, VLANs, subnetting, firewalls, load balancing, and network troubleshooting.",
    types: ["Routing & Switching", "Network Security", "Protocol Analysis", "Behavioral", "Mixed"],
    skills: ["TCP/IP", "BGP / OSPF", "Subnetting", "Wireshark", "Firewalls", "VPNs", "DNS / DHCP"],
    sampleTopics: ["TCP 3-Way Handshake & Teardown", "CIDR Subnet Calculations", "BGP Path Selection", "Troubleshooting Packet Drops"]
  },
  {
    id: "sol-arch",
    name: "Solutions Architect",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "Layers",
    description: "Enterprise system design, high availability (99.99%), disaster recovery (RPO/RTO), trade-off evaluation, and cloud modernization.",
    types: ["Enterprise Architecture", "High Availability & DR", "Cost & Performance Tradeoffs", "Behavioral", "Mixed"],
    skills: ["Cloud Architecture", "System Design", "Disaster Recovery", "Microservices", "Event-Driven Architecture", "Cost Modeling"],
    sampleTopics: ["Active-Active Multi-Region Failover", "CAP Theorem in Practice", "Monolith to Microservices Migration", "RPO vs RTO SLA Design"]
  },
  {
    id: "sre-eng",
    name: "Site Reliability Engineer (SRE)",
    category: "Technology",
    domain: "Technology & Software",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "Activity",
    description: "SLO/SLI definition, error budgets, blameless post-mortems, automation of toil, observability (Prometheus/Grafana), and chaos engineering.",
    types: ["SLO / SLI & Error Budgets", "Incident Management & Post-Mortems", "Observability & Alerting", "Behavioral", "Mixed"],
    skills: ["SRE Principles", "Prometheus / Grafana", "Error Budgets", "Chaos Engineering", "Linux Tuning", "Incident Management"],
    sampleTopics: ["Defining Actionable SLIs vs Vanity Metrics", "Managing Exhausted Error Budgets", "Preventing Alert Fatigue", "Blameless Post-Mortems"]
  },

  // ──────────────────────────────────────────────────
  // DATA & ANALYTICS
  // ──────────────────────────────────────────────────
  {
    id: "data-analyst",
    name: "Data Analyst",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "BarChart3",
    description: "Complex SQL querying, window functions, statistical inference, metric trees, Power BI/Tableau, and business storytelling.",
    types: ["SQL & Querying", "Statistical Analysis", "Business Case Study", "Behavioral", "Mixed"],
    skills: ["SQL", "Excel", "Power BI", "Data Modeling", "Python (Pandas)", "Statistics"],
    sampleTopics: ["Window Functions (LEAD/LAG)", "Cohort Retention Analysis", "Star Schema Modeling", "A/B Testing p-values"]
  },
  {
    id: "biz-analyst-data",
    name: "Business Analyst",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Briefcase",
    description: "Bridge business requirements with quantitative analysis, stakeholder interview workflows, and KPI dashboard tracking.",
    types: ["Requirements Gathering", "Data-Driven Recommendations", "Stakeholder Alignment", "Behavioral", "Mixed"],
    skills: ["Business Analysis", "SQL", "Excel", "User Stories", "Stakeholder Communication", "Dashboarding"],
    sampleTopics: ["Translating Business Goals to Data Metrics", "Managing Conflicting Stakeholder Needs", "Conducting Cost-Benefit Analysis"]
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "BrainCircuit",
    description: "Predictive modeling, regression & classification, scikit-learn, gradient boosted trees (XGBoost), and feature engineering.",
    types: ["Machine Learning Theory", "Applied Python Modeling", "Feature Engineering & Metrics", "Behavioral", "Mixed"],
    skills: ["Python", "scikit-learn", "Pandas", "XGBoost", "Hypothesis Testing", "Model Evaluation (ROC-AUC)"],
    sampleTopics: ["Precision vs Recall Tradeoffs", "Regularization (L1/L2)", "Cross-Validation Protocols", "Feature Scaling"]
  },
  {
    id: "ml-eng",
    name: "ML Engineer",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "BrainCircuit",
    description: "MLOps, model deployment, inference optimization, feature stores, Dockerized model serving, and data drift monitoring.",
    types: ["MLOps & Model Deployment", "Model Serving & Latency", "Monitoring & Data Drift", "Behavioral", "Mixed"],
    skills: ["PyTorch / TensorFlow", "MLflow", "FastAPI / Triton", "Docker", "Feature Stores", "Data Drift Monitoring"],
    sampleTopics: ["Quantization & TensorRT Optimization", "Concept Drift Detection", "Real-Time vs Batch Inference", "A/B Testing Model Variants"]
  },
  {
    id: "ai-eng",
    name: "AI Engineer",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "Sparkles",
    description: "Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), vector databases, prompt engineering, and agentic workflows.",
    types: ["LLM & Prompt Architecture", "RAG & Vector Retrieval", "Agentic Systems & Tools", "Behavioral", "Mixed"],
    skills: ["LLM APIs (OpenAI/Anthropic)", "LangChain / LlamaIndex", "Vector DBs (Pinecone/Milvus)", "RAG Architecture", "Prompt Engineering"],
    sampleTopics: ["Hybrid Semantic + BM25 Search in RAG", "Mitigating Hallucinations", "Context Window Management", "Evaluation Frameworks (Ragas)"]
  },
  {
    id: "bi-analyst",
    name: "BI Analyst",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "PieChart",
    description: "Star Schema data modeling, DAX time-intelligence formulas, Tableau Level of Detail expressions, and KPI dashboards.",
    types: ["BI Architecture", "DAX & Calculations", "Executive Dashboard Design", "Behavioral", "Mixed"],
    skills: ["Power BI", "Tableau", "DAX Formulas", "Data Warehousing", "SQL", "KPI Reporting"],
    sampleTopics: ["DAX CALCULATE Modifier", "Tableau FIXED LOD", "Fact vs Dimension Separation", "Executive Metric Design"]
  },
  {
    id: "data-eng",
    name: "Data Engineer",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "Database",
    description: "ETL/ELT pipeline design, Snowflake/BigQuery data warehousing, dbt transformations, Apache Spark, and data governance.",
    types: ["Data Pipeline Architecture", "SQL & Transformations", "Distributed Processing", "Behavioral", "Mixed"],
    skills: ["SQL", "Python", "Snowflake", "dbt", "Apache Spark", "Airflow", "Data Modeling"],
    sampleTopics: ["Idempotent Pipeline Design", "Incremental dbt Models", "Data Partitioning & Clustering", "Schema Evolution"]
  },
  {
    id: "prod-analyst",
    name: "Product Analyst",
    category: "Data & Analytics",
    domain: "Data & Analytics",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Target",
    description: "User funnel drop-off analysis, feature adoption tracking, cohort retention, metric trees, and experiment readouts.",
    types: ["Product Metrics & Funnels", "Cohort Retention Analysis", "Experimentation & A/B Tests", "Behavioral", "Mixed"],
    skills: ["SQL", "Amplitude / Mixpanel", "A/B Testing", "Funnel Analysis", "Cohort Modeling", "Metric Trees"],
    sampleTopics: ["North Star Metric Definition", "Analyzing Funnel Churn", "Cohort Retention Curves", "Sample Size Calculations"]
  },

  // ──────────────────────────────────────────────────
  // BUSINESS & MANAGEMENT
  // ──────────────────────────────────────────────────
  {
    id: "prod-mgr",
    name: "Product Manager",
    category: "Business",
    domain: "Business & Strategy",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "Compass",
    description: "Product strategy, defining North Star metrics, PRDs, prioritization (RICE framework), and customer discovery.",
    types: ["Product Strategy", "Feature Prioritization", "User Empathy & Metrics", "Behavioral", "Mixed"],
    skills: ["Product Strategy", "RICE Prioritization", "North Star Metric", "PRD Writing", "User Research", "Agile"],
    sampleTopics: ["Handling Conflicting Stakeholder Demands", "Diagnosing Metric Drop-offs", "Applying the RICE Framework", "Product Roadmapping"]
  },
  {
    id: "proj-mgr",
    name: "Project Manager",
    category: "Business",
    domain: "Business & Strategy",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Briefcase",
    description: "Sprint planning, risk mitigation, critical path methodology (CPM), scope management, and stakeholder status reporting.",
    types: ["Agile & Scrum Delivery", "Risk & Scope Management", "Stakeholder Communication", "Behavioral", "Mixed"],
    skills: ["Agile / Scrum", "Jira", "Risk Mitigation", "Critical Path Method", "Budget Tracking", "Stakeholder Management"],
    sampleTopics: ["Managing Scope Creep Mid-Sprint", "Resolving Resource Bottlenecks", "Critical Path Calculation", "Post-Mortem Retrospectives"]
  },
  {
    id: "ops-analyst",
    name: "Operations Analyst",
    category: "Business",
    domain: "Business & Strategy",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Activity",
    description: "Process optimization (Lean/Six Sigma), bottleneck elimination, cost-benefit modeling, and operational KPI tracking.",
    types: ["Process Optimization", "Cost-Benefit Analysis", "Capacity Planning", "Behavioral", "Mixed"],
    skills: ["Process Mapping", "Excel Modeling", "Lean Six Sigma", "Cost Analysis", "KPI Tracking"],
    sampleTopics: ["Value Stream Mapping", "Root Cause Analysis (5 Whys / Fishbone)", "Capacity & Utilization Planning"]
  },
  {
    id: "strat-analyst",
    name: "Strategy Analyst",
    category: "Business",
    domain: "Business & Strategy",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "TrendingUp",
    description: "Market entry analysis, competitive benchmarking, financial projections, TAM/SAM/SOM sizing, and executive decks.",
    types: ["Market Analysis & Sizing", "Competitive Benchmarking", "Executive Presentations", "Behavioral", "Mixed"],
    skills: ["Market Sizing (TAM/SAM)", "Competitive Analysis", "Financial Modeling", "PowerPoint", "Strategic Planning"],
    sampleTopics: ["Market Sizing Methodologies", "Porter's 5 Forces Application", "M&A Strategic Rationale Analysis"]
  },
  {
    id: "mgmt-trainee",
    name: "Management Trainee",
    category: "Business",
    domain: "Business & Strategy",
    difficulty: "Beginner",
    duration: "20 min",
    questionCount: 8,
    icon: "Users",
    description: "Rotational leadership fundamentals, cross-functional collaboration, problem solving, and business agility.",
    types: ["Problem Solving & Logic", "Leadership Potential", "Situational Judgment", "Behavioral", "Mixed"],
    skills: ["Business Communication", "Problem Solving", "Team Leadership", "Data Interpretation", "Adaptability"],
    sampleTopics: ["Prioritizing Urgent vs Important Tasks", "Leading Diverse Teams", "Resolving Customer Escalations"]
  },

  // ──────────────────────────────────────────────────
  // HUMAN RESOURCES
  // ──────────────────────────────────────────────────
  {
    id: "hr-exec",
    name: "HR Executive",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Users",
    description: "Employee lifecycle management, 30-60-90 day onboarding, grievance handling, POSH compliance, and employee retention.",
    types: ["HR Operations", "Employee Relations", "Compliance & POSH", "Behavioral", "Mixed"],
    skills: ["HR Management", "Employee Relations", "Onboarding", "HRMS Software", "POSH Act", "Compliance"],
    sampleTopics: ["Resolving Workplace Conflict", "Managing Performance PIPs", "Designing 30-60-90 Day Onboarding", "ICC Investigation Guidelines"]
  },
  {
    id: "hr-gen",
    name: "HR Generalist",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Users",
    description: "Policy drafting, benefits administration, performance review coordination, payroll coordination, and workplace engagement.",
    types: ["Policy & Governance", "Employee Engagement", "Performance Appraisals", "Behavioral", "Mixed"],
    skills: ["HR Policies", "Benefits Administration", "Performance Management", "Employee Engagement", "Labor Laws"],
    sampleTopics: ["Drafting Remote Work Policies", "Conducting Exit Interviews", "Calibrating 9-Box Talent Reviews"]
  },
  {
    id: "ta-spec",
    name: "Talent Acquisition Specialist",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "UserCheck",
    description: "Candidate sourcing strategies, Boolean search, structured STAR behavioral interviewing, ATS management, and offer closing.",
    types: ["Sourcing Strategy", "Behavioral Interviewing", "Candidate Assessment", "Offer Negotiation", "Mixed"],
    skills: ["Recruitment", "LinkedIn Recruiter", "Boolean Search", "STAR Methodology", "Candidate Screening", "Offer Negotiation"],
    sampleTopics: ["Complex Boolean Search Strings", "Conducting STAR Screenings", "Handling Counter-Offers", "Reducing Time-to-Fill"]
  },
  {
    id: "recruiter",
    name: "Recruiter",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "UserCheck",
    description: "Full-cycle recruitment, candidate relationship management, screening phone screens, and interview coordination.",
    types: ["Candidate Screening", "Pipeline Sourcing", "Interview Coordination", "Behavioral", "Mixed"],
    skills: ["Recruiting", "Screening", "Candidate Experience", "ATS Management", "Phone Interviewing"],
    sampleTopics: ["Evaluating Resume Red Flags", "Enhancing Candidate Glassdoor Experience", "Managing High-Volume Pipelines"]
  },
  {
    id: "people-ops",
    name: "People Operations Associate",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Beginner",
    duration: "20 min",
    questionCount: 8,
    icon: "Users",
    description: "HR operational workflows, employee ticketing systems, onboarding documentation, and workplace culture initiatives.",
    types: ["HR Operations", "Onboarding Execution", "Employee Support", "Behavioral", "Mixed"],
    skills: ["HR Administration", "Employee Support", "Onboarding Logistics", "HRMS", "Communication"],
    sampleTopics: ["First Day Onboarding Journey", "Managing Employee Records Compliance", "Organizing Culture Events"]
  },
  {
    id: "hr-analyst",
    name: "HR Analyst",
    category: "Human Resources",
    domain: "Human Resources",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "TrendingUp",
    description: "Workforce headcount modeling, annualized attrition rate calculations, eNPS survey analysis, and executive HR reports.",
    types: ["People Analytics", "Workforce Planning", "Survey & Retention Modeling", "Behavioral", "Mixed"],
    skills: ["HR Analytics", "Excel Pivots", "Attrition Modeling", "eNPS Surveys", "Workforce Planning"],
    sampleTopics: ["Voluntary vs Involuntary Turnover", "Analyzing eNPS Drivers", "Forecasting Department Headcount", "Compensation Compa-Ratios"]
  },

  // ──────────────────────────────────────────────────
  // MARKETING
  // ──────────────────────────────────────────────────
  {
    id: "mkt-spec",
    name: "Digital Marketing Specialist",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Megaphone",
    description: "Multi-channel demand generation: Google Ads PPC, SEO keyword clusters, email nurture workflows, and GA4 attribution.",
    types: ["Campaign Strategy", "PPC & Paid Search", "SEO & Content", "Marketing Analytics", "Mixed"],
    skills: ["Digital Marketing", "Google Ads", "SEO", "GA4", "Email Marketing", "Copywriting"],
    sampleTopics: ["Optimizing Google Ads Quality Score", "GA4 Event Tracking Setup", "A/B Testing Email Subject Lines", "Target ROAS Bidding"]
  },
  {
    id: "seo-spec",
    name: "SEO Specialist",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Search",
    description: "On-page search intent, Technical SEO (Core Web Vitals, schema markup, canonicals), and pillar-and-cluster architectures.",
    types: ["Technical SEO", "On-Page Strategy", "Link Building & Digital PR", "Behavioral", "Mixed"],
    skills: ["SEO", "Technical SEO", "Keyword Research", "Schema Markup", "Core Web Vitals", "Content Strategy"],
    sampleTopics: ["Solving Keyword Cannibalization", "JSON-LD Structured Data", "Fixing Crawl Budget Waste", "Pillar Content Models"]
  },
  {
    id: "content-strat",
    name: "Content Strategist",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "BookOpen",
    description: "Brand tone of voice, editorial calendar management, multi-format content distribution, and thought leadership positioning.",
    types: ["Editorial Strategy", "Audience Persona Mapping", "Content Distribution", "Behavioral", "Mixed"],
    skills: ["Content Strategy", "Copywriting", "Editorial Planning", "Brand Voice", "SEO Basics", "Social Media"],
    sampleTopics: ["Repurposing Long-Form Assets into Multi-Channel Snippets", "Audience Persona Development", "Measuring Content ROI"]
  },
  {
    id: "mkt-analyst",
    name: "Marketing Analyst",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "BarChart3",
    description: "Marketing mix modeling (MMM), full-funnel attribution, CAC/LTV tracking, and marketing budget ROI evaluation.",
    types: ["Attribution Modeling", "Campaign ROI & CAC", "Channel Performance", "Behavioral", "Mixed"],
    skills: ["GA4", "SQL", "Excel", "Attribution Modeling", "LTV / CAC", "Tableau / Power BI"],
    sampleTopics: ["Data-Driven vs First/Last Touch Attribution", "Calculating Blended vs Paid CAC", "Channel Incremental Lift Analysis"]
  },
  {
    id: "social-media-mgr",
    name: "Social Media Manager",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Megaphone",
    description: "Organic social growth, brand community management, viral short-form video strategies (Reels/TikTok), and crisis PR response.",
    types: ["Social Growth Strategy", "Community Management", "Crisis PR & Response", "Behavioral", "Mixed"],
    skills: ["Social Strategy", "Copywriting", "Short-Form Video", "Community Management", "Analytics"],
    sampleTopics: ["Handling Negative Viral Feedback", "Short-Form Video Hook Formulas", "Influencer Collaboration ROI"]
  },
  {
    id: "growth-mkt",
    name: "Growth Marketing Associate",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Target",
    description: "Rapid experimentation loops, conversion rate optimization (CRO), landing page A/B testing, and onboarding activation funnels.",
    types: ["Experimentation & A/B Testing", "Activation & Onboarding Funnels", "Paid Acquisition", "Behavioral", "Mixed"],
    skills: ["CRO", "A/B Testing", "Landing Page Design", "Email Lifecycle", "Analytics"],
    sampleTopics: ["Designing High-Velocity Growth Sprints", "Optimizing Signup-to-Activation Rates", "Reducing Onboarding Drop-off"]
  },
  {
    id: "brand-exec",
    name: "Brand Executive",
    category: "Marketing",
    domain: "Marketing & Growth",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Palette",
    description: "Brand identity governance, PR campaigns, brand equity measurement, and creative agency partnership management.",
    types: ["Brand Positioning", "PR & Media Campaigns", "Brand Guidelines Governance", "Behavioral", "Mixed"],
    skills: ["Brand Strategy", "PR & Communications", "Creative Direction", "Brand Equity Tracking"],
    sampleTopics: ["Maintaining Brand Consistency Across Global Markets", "Measuring Brand Recall & Sentiment", "Launching Rebranding Campaigns"]
  },

  // ──────────────────────────────────────────────────
  // FINANCE
  // ──────────────────────────────────────────────────
  {
    id: "fin-analyst",
    name: "Financial Analyst",
    category: "Finance",
    domain: "Finance & Accounting",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "DollarSign",
    description: "Three-statement financial modeling, budget variance analysis, discounted cash flow (DCF), and capital expenditure ROI.",
    types: ["Financial Modeling", "Budgeting & Variance", "Valuation (DCF)", "Behavioral", "Mixed"],
    skills: ["Financial Modeling", "Excel", "Variance Analysis", "Financial Statements", "DCF Valuation", "Budgeting"],
    sampleTopics: ["Linking 3 Financial Statements", "Analyzing EBITDA Variance", "Calculating WACC in DCF Models", "Working Capital Optimization"]
  },
  {
    id: "accounts-exec",
    name: "Accounts Executive",
    category: "Finance",
    domain: "Finance & Accounting",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "DollarSign",
    description: "Accounts payable/receivable (AP/AR), ledger reconciliations, invoice auditing, GST/tax filing, and month-end closes.",
    types: ["General Ledger & Reconciliations", "Invoicing & AP/AR", "Tax Compliance", "Behavioral", "Mixed"],
    skills: ["Accounting Principles", "General Ledger", "Tally / QuickBooks", "Bank Reconciliation", "Tax Compliance"],
    sampleTopics: ["Month-End Reconciliation Process", "Aging Accounts Receivable Recovery", "Depreciation Accounting Standards"]
  },
  {
    id: "fin-assoc",
    name: "Finance Associate",
    category: "Finance",
    domain: "Finance & Accounting",
    difficulty: "Beginner",
    duration: "20 min",
    questionCount: 8,
    icon: "DollarSign",
    description: "Financial documentation, expense tracking, Excel workbook automation, and audit support preparation.",
    types: ["Financial Analysis", "Expense Auditing", "Excel Automation", "Behavioral", "Mixed"],
    skills: ["Excel Formulas", "Financial Documentation", "Expense Reports", "Data Entry", "Accounting"],
    sampleTopics: ["Audit Trail Verification", "Excel VLOOKUP/INDEX-MATCH Modeling", "Expense Policy Compliance"]
  },
  {
    id: "inv-analyst",
    name: "Investment Analyst",
    category: "Finance",
    domain: "Finance & Accounting",
    difficulty: "Advanced",
    duration: "30 min",
    questionCount: 12,
    icon: "TrendingUp",
    description: "Equity research, LBO modeling, comparable company analysis (Comps), precedent transactions, and investment memos.",
    types: ["Valuation & Comps", "LBO & Financial Modeling", "Investment Thesis & Pitch", "Behavioral", "Mixed"],
    skills: ["Financial Modeling", "Valuation (Comps / Precedents)", "LBO Modeling", "Equity Research", "Financial Due Diligence"],
    sampleTopics: ["Trading Comps vs Transaction Comps Multiples", "LBO Returns (IRR & MOIC) Drivers", "Drafting an Investment Memo"]
  },
  {
    id: "risk-analyst",
    name: "Risk Analyst",
    category: "Finance",
    domain: "Finance & Accounting",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "ShieldAlert",
    description: "Credit risk assessment, market risk, Value at Risk (VaR), stress testing, regulatory compliance (Basel III), and mitigation.",
    types: ["Credit & Market Risk", "Value at Risk (VaR)", "Stress Testing & Scenario Analysis", "Behavioral", "Mixed"],
    skills: ["Risk Assessment", "VaR Modeling", "Stress Testing", "Regulatory Compliance", "Statistics"],
    sampleTopics: ["Parametric vs Historical VaR", "Credit Scoring & Default Probability", "Designing Macro Stress Test Scenarios"]
  },

  // ──────────────────────────────────────────────────
  // SALES & OPERATIONS
  // ──────────────────────────────────────────────────
  {
    id: "sales-exec",
    name: "Sales Executive",
    category: "Sales",
    domain: "Sales & Business Development",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Briefcase",
    description: "Outbound pipeline prospecting, objection handling, B2B product demos, CRM management, and closing quotas.",
    types: ["Discovery & Pitching", "Objection Handling", "Closing & Negotiation", "Behavioral", "Mixed"],
    skills: ["B2B Sales", "Cold Outreach", "Objection Handling", "Salesforce / HubSpot", "Closing"],
    sampleTopics: ["Overcoming 'No Budget' Objections", "Structuring 15-Minute Discovery Calls", "Navigating Enterprise Decision Makers"]
  },
  {
    id: "bde-exec",
    name: "Business Development Executive",
    category: "Sales",
    domain: "Sales & Business Development",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Briefcase",
    description: "Strategic partnerships, account mapping, multi-channel outbound cadence (Email/LinkedIn/Phone), and lead qualification (BANT).",
    types: ["Lead Qualification (BANT)", "Strategic Outreach", "Partnership Pitching", "Behavioral", "Mixed"],
    skills: ["Outbound Prospecting", "BANT Qualification", "LinkedIn Outreach", "Cold Emailing", "Pipeline Management"],
    sampleTopics: ["Applying BANT in Enterprise Deals", "Crafting High-Converting Cold Sequences", "Account-Based Sales (ABS) Mapping"]
  },
  {
    id: "acct-mgr",
    name: "Account Manager",
    category: "Sales",
    domain: "Sales & Business Development",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Users",
    description: "Client relationship nurturing, contract renewals, upselling/cross-selling, quarterly business reviews (QBRs), and churn prevention.",
    types: ["Client Relationship Nurturing", "Upselling & Cross-Selling", "QBR Presentation", "Behavioral", "Mixed"],
    skills: ["Account Management", "Client Retention", "Contract Renewal", "Upselling", "QBRs"],
    sampleTopics: ["Running Effective QBR Sessions", "De-escalating Angry Enterprise Accounts", "Identifying Expansion Opportunities"]
  },
  {
    id: "cust-success",
    name: "Customer Success Associate",
    category: "Sales",
    domain: "Sales & Business Development",
    difficulty: "Beginner",
    duration: "20 min",
    questionCount: 8,
    icon: "UserCheck",
    description: "Customer onboarding journeys, product adoption training, health score monitoring, and ticket resolution management.",
    types: ["Customer Onboarding", "Health Score Monitoring", "Product Training", "Behavioral", "Mixed"],
    skills: ["Customer Success", "Onboarding", "Product Demos", "Churn Reduction", "Zendesk / Intercom"],
    sampleTopics: ["Diagnosing Customer Health Score Drop", "Conducting New User Onboarding Walkthroughs", "Reducing Time-to-First-Value"]
  },

  // ──────────────────────────────────────────────────
  // DESIGN
  // ──────────────────────────────────────────────────
  {
    id: "ui-ux-des",
    name: "UI/UX Designer",
    category: "Design",
    domain: "Design & Creative",
    difficulty: "Intermediate",
    duration: "25 min",
    questionCount: 10,
    icon: "Palette",
    description: "Design systems in Figma, user journey mapping, wireframing, usability heuristics, WCAG accessibility, and prototype testing.",
    types: ["Design Systems", "UX Research & Testing", "Usability Heuristics", "Behavioral", "Mixed"],
    skills: ["Figma", "UI Design", "UX Research", "Design Systems", "Usability Testing", "Wireframing"],
    sampleTopics: ["Jakob Nielsen's 10 Usability Heuristics", "Building Tokenized Design Systems", "Conducting Card Sorting Sessions", "Mobile Micro-Interactions"]
  },
  {
    id: "prod-des",
    name: "Product Designer",
    category: "Design",
    domain: "Design & Creative",
    difficulty: "Advanced",
    duration: "25 min",
    questionCount: 10,
    icon: "Compass",
    description: "End-to-end product thinking, interaction design, qualitative user interviews, design sprint facilitation, and business metric impact.",
    types: ["Product Thinking & Strategy", "Interaction Design", "User Testing & Validation", "Behavioral", "Mixed"],
    skills: ["Product Design", "Figma", "Design Sprints", "Interaction Design", "User Research", "Data-Informed Design"],
    sampleTopics: ["Balancing User Needs with Business Constraints", "Conducting Moderated Usability Studies", "Measuring Design Impact on Conversion"]
  },
  {
    id: "vis-des",
    name: "Visual Designer",
    category: "Design",
    domain: "Design & Creative",
    difficulty: "Intermediate",
    duration: "20 min",
    questionCount: 8,
    icon: "Palette",
    description: "Typography hierarchy, color theory, iconography, brand asset creation, responsive layout grids, and visual storytelling.",
    types: ["Typography & Color Theory", "Brand & Marketing Assets", "Visual Hierarchy & Layout", "Behavioral", "Mixed"],
    skills: ["Visual Design", "Typography", "Color Theory", "Figma / Adobe Illustrator", "Layout Grids"],
    sampleTopics: ["Establishing Typographic Hierarchy", "Accessible Color Contrast in Brand Palettes", "Designing Responsive Grid Systems"]
  }
];

/**
 * Universal fallback questions generator across any technical or business role
 */
export const getQuestionsForRole = (roleName, difficulty = "Intermediate", interviewType = "Mixed", count = 10) => {
  const genericRoleQuestions = [
    {
      id: `gen-${roleName}-1`,
      topic: "Core Fundamentals & Workflow",
      type: interviewType === 'Behavioral' ? 'Behavioral' : 'Technical',
      difficulty,
      question: `What are the core foundational principles and standard operational procedures you follow when executing projects as a ${roleName}?`,
      modelAnswerGuidelines: `Demonstrate structured mastery over ${roleName} methodologies, quality validation, and risk management.`
    },
    {
      id: `gen-${roleName}-2`,
      topic: "Problem Solving & Obstacles",
      type: "Problem Solving",
      difficulty,
      question: `Describe a complex challenge or bottleneck you encountered in your work as a ${roleName}. How did you isolate the problem and implement a solution?`,
      modelAnswerGuidelines: "Use STAR methodology (Situation, Task, Action, Result) with quantitative metrics."
    },
    {
      id: `gen-${roleName}-3`,
      topic: "Tooling, Technology & Best Practices",
      type: "Technical",
      difficulty,
      question: `What modern tools, platforms, frameworks, and metrics do you rely on daily to maximize your efficiency and deliver high-impact results as a ${roleName}?`,
      modelAnswerGuidelines: "Reference specific industry-standard tools, automation techniques, and data metrics."
    },
    {
      id: `gen-${roleName}-4`,
      topic: "Cross-Functional Collaboration",
      type: "Behavioral",
      difficulty,
      question: `How do you manage communication and alignment when working with stakeholders or team members who have competing priorities?`,
      modelAnswerGuidelines: "Highlight active listening, structured compromise, transparent documentation, and alignment on business ROI."
    },
    {
      id: `gen-${roleName}-5`,
      topic: "Quality Assurance & Error Prevention",
      type: "Problem Solving",
      difficulty,
      question: `What steps do you take to audit your deliverables and ensure zero defects, compliance breaches, or performance regressions?`,
      modelAnswerGuidelines: "Explain verification checklists, automated testing/validation, peer review, and monitoring."
    },
    {
      id: `gen-${roleName}-6`,
      topic: "Industry Trends & Continuous Learning",
      type: "Technical",
      difficulty,
      question: `How do you stay ahead of new industry trends, emerging technologies, and evolving market demands relevant to ${roleName}?`,
      modelAnswerGuidelines: "Mention continuous upskilling, whitepapers, community forums, and running practical experiments."
    },
    {
      id: `gen-${roleName}-7`,
      topic: "Strategic Impact & Business ROI",
      type: "Strategic Impact",
      difficulty,
      question: `Can you share an example of a project where your individual contribution directly impacted key business metrics (e.g. revenue, efficiency, retention)?`,
      modelAnswerGuidelines: "Quantify the baseline before the initiative, the specific action you took, and the final percentage lift."
    },
    {
      id: `gen-${roleName}-8`,
      topic: "Prioritization & Time Management",
      type: "Behavioral",
      difficulty,
      question: `When managing multiple critical deliverables under tight deadlines, what framework do you use to prioritize tasks without sacrificing quality?`,
      modelAnswerGuidelines: "Mention frameworks such as Eisenhower Matrix, MoSCoW, or Impact vs Effort matrix."
    },
    {
      id: `gen-${roleName}-9`,
      topic: "Conflict & Feedback",
      type: "Behavioral",
      difficulty,
      question: `Tell me about a time you received constructive feedback on your approach. How did you process it and adjust your execution?`,
      modelAnswerGuidelines: "Demonstrate professional humility, active listening, rapid iteration, and measurable improvement."
    },
    {
      id: `gen-${roleName}-10`,
      topic: "Role Vision & Long-Term Goals",
      type: "Role Vision",
      difficulty,
      question: `Looking ahead 1–2 years, how do you see the responsibilities of a ${roleName} evolving, and how are you preparing for that shift?`,
      modelAnswerGuidelines: "Discuss automation, AI tools, strategic leadership, and deeper cross-functional alignment."
    }
  ];

  return genericRoleQuestions.slice(0, count).map((q, idx) => ({
    ...q,
    stepIndex: idx + 1,
    totalSteps: count
  }));
};

/**
 * Calculates authentic 5-pillar scorecard and feedback evaluation
 */
export const evaluateInterviewSubmission = ({
  roleName,
  difficulty,
  answers = [],
  questions = [],
  userSkills = [],
  sessionDuration = "00:00"
}) => {
  let totalLength = 0;
  let validAnswerCount = 0;
  const questionEvaluations = [];

  answers.forEach((ansObj, idx) => {
    const rawText = typeof ansObj === 'string' ? ansObj : (ansObj?.transcript || ansObj?.text || "");
    const qItem = questions[idx] || {};
    const isSkipped = rawText === "[Skipped]" || ansObj?.status === 'skipped';
    const trimmed = rawText.replace("[Skipped]", "").trim();

    if (trimmed.length > 5 && !isSkipped) {
      const words = trimmed.split(/\s+/).filter(Boolean);
      totalLength += words.length;
      validAnswerCount += 1;

      // Question-specific score
      const qLengthScore = Math.min(100, Math.round(words.length * 2.5));
      const hasSTARStructure = /\b(when|situation|task|action|result|because|outcome|achieved|built|managed)\b/i.test(trimmed);
      const qScore = Math.min(96, Math.max(40, qLengthScore + (hasSTARStructure ? 15 : 0)));

      questionEvaluations.push({
        questionIndex: idx + 1,
        question: qItem.question || `Question ${idx + 1}`,
        topic: qItem.topic || "Core Concept",
        answerText: trimmed,
        score: qScore,
        wordCount: words.length,
        hasSTARStructure,
        status: "answered"
      });
    } else {
      questionEvaluations.push({
        questionIndex: idx + 1,
        question: qItem.question || `Question ${idx + 1}`,
        topic: qItem.topic || "Core Concept",
        answerText: isSkipped ? "[Question Skipped]" : "[No Answer Submitted]",
        score: 0,
        wordCount: 0,
        hasSTARStructure: false,
        status: isSkipped ? "skipped" : "unanswered"
      });
    }
  });

  // ZERO-ANSWER PROTECTION:
  // If zero valid answers were provided, return invalid evaluation
  if (validAnswerCount === 0) {
    return {
      isValid: false,
      isCompleted: false,
      answeredCount: 0,
      totalQuestions: questions.length,
      overallScore: 0,
      dimensions: {
        technicalKnowledge: 0,
        problemSolving: 0,
        communication: 0,
        roleKnowledge: 0,
        confidence: 0
      },
      questionEvaluations,
      strengths: [],
      improvements: [],
      nextInterviewFocus: [],
      completedAt: null,
      message: "You did not submit any responses, so PREPRIA cannot evaluate your performance."
    };
  }

  // Authentic dimension calculation for valid answers
  const avgWordsPerAnswer = Math.round(totalLength / validAnswerCount);
  const completionRatio = questions.length > 0 ? (validAnswerCount / questions.length) : 0;
  
  // Depth score (up to 40 pts)
  const depthScore = Math.min(40, Math.round(avgWordsPerAnswer * 0.8));
  // Coverage score (up to 50 pts)
  const coverageScore = Math.round(completionRatio * 50);

  const baseTechnical = Math.min(96, Math.round(coverageScore + depthScore + 8));
  const baseProblemSolving = Math.min(94, Math.round(coverageScore + depthScore + 5));
  const baseCommunication = Math.min(92, Math.round(coverageScore + (depthScore * 1.1)));
  const baseRoleKnowledge = Math.min(95, Math.round(coverageScore + depthScore + 6));
  const baseConfidence = Math.min(95, Math.round(coverageScore + depthScore + 4));

  const overallScore = Math.round(
    (baseTechnical * 0.3) +
    (baseProblemSolving * 0.25) +
    (baseCommunication * 0.2) +
    (baseRoleKnowledge * 0.15) +
    (baseConfidence * 0.1)
  );

  const isFullyCompleted = validAnswerCount >= questions.length;

  const strengths = [
    `Demonstrated articulated responses across ${validAnswerCount} role-specific scenarios`,
    "Applied clear domain reasoning when explaining execution methodologies",
    "Structured problem decomposition with practical implementation considerations"
  ];

  const improvements = [
    {
      topic: "System & Architecture Scalability",
      description: "Responses covered primary functional workflows. Elevate answers by addressing high-scale edge cases and failover recovery.",
      actionLabel: "Learn Architecture Patterns",
      actionPath: "/my-courses"
    },
    {
      topic: "STAR Metric Precision",
      description: "Quantify your achievements with concrete metrics (e.g. latency reduced by 40%, retention increased by 15%) to make examples more compelling.",
      actionLabel: "Review Career Roadmap",
      actionPath: "/career-roadmap"
    }
  ];

  return {
    isValid: true,
    isCompleted: isFullyCompleted,
    isPartial: !isFullyCompleted,
    answeredCount: validAnswerCount,
    totalQuestions: questions.length,
    overallScore,
    dimensions: {
      technicalKnowledge: baseTechnical,
      problemSolving: baseProblemSolving,
      communication: baseCommunication,
      roleKnowledge: baseRoleKnowledge,
      confidence: baseConfidence
    },
    questionEvaluations,
    strengths,
    improvements,
    nextInterviewFocus: ["System Architecture", "Metric-Driven Outcomes", "Concise Communication"],
    completedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };
};
