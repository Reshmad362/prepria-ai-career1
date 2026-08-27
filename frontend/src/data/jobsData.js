/**
 * PREPRIA Comprehensive Multi-Domain Career Opportunities Dataset
 * Covers Technology, Data & Analytics, Human Resources, Marketing, Finance, and Business Operations.
 */

export const INITIAL_CAREER_OPPORTUNITIES = [
  // ──────────────────────────────────────────────────
  // TECHNOLOGY & SOFTWARE
  // ──────────────────────────────────────────────────
  {
    id: "job-tech-1",
    title: "Senior Frontend Engineer",
    company: "Stripe",
    logoText: "S",
    logoBg: "bg-indigo-600",
    location: "San Francisco, CA (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Senior Level",
    salary: "$160,000 - $195,000",
    postedDate: "1 day ago",
    category: "Frontend",
    domain: "Technology",
    department: "Merchant Dashboard & UI Platforms",
    applicationUrl: "https://stripe.com/jobs",
    description: "Stripe is looking for a Senior Frontend Engineer to build high-scale, accessible merchant dashboards and developer surfaces using React, TypeScript, and modern design systems. You will lead UI architecture, mentor junior developers, and collaborate closely with product design teams.",
    requiredSkills: ["React", "TypeScript", "JavaScript", "Next.js", "CSS3", "Web Accessibility", "REST APIs"],
    preferredSkills: ["GraphQL", "Zustand", "Jest", "Tailwind CSS", "Design Systems"],
    responsibilities: [
      "Architect and ship high-performance React/Next.js dashboard interfaces for millions of global businesses",
      "Collaborate with UX research and product design to implement accessible design system components",
      "Optimize web vitals (LCP, INP, CLS) and frontend client bundle performance",
      "Conduct thorough code reviews and mentor engineers on modern frontend best practices"
    ],
    benefits: ["Comprehensive Health Coverage", "401(k) with 5% Match", "Flexible Work Policy", "$3,000 Annual Learning Budget"]
  },
  {
    id: "job-tech-2",
    title: "Full Stack Developer",
    company: "Vercel",
    logoText: "V",
    logoBg: "bg-black",
    location: "Remote (US / Global)",
    workType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$135,000 - $165,000",
    postedDate: "2 days ago",
    category: "Full Stack",
    domain: "Technology",
    department: "Platform Frameworks & SDKs",
    applicationUrl: "https://vercel.com/careers",
    description: "Join Vercel's framework engineering team building full-stack web applications with Next.js App Router, Server Components, Node.js, and edge computing primitives. You will bridge frontend customer experiences with resilient backend services.",
    requiredSkills: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "Git", "REST APIs"],
    preferredSkills: ["Server Components", "PostgreSQL", "Prisma", "Docker", "Redis"],
    responsibilities: [
      "Build full-stack customer workflows leveraging Next.js App Router and Server Actions",
      "Design and maintain scalable REST and edge API endpoints with TypeScript and Node.js",
      "Integrate PostgreSQL databases with Prisma ORM and manage caching with Redis",
      "Ensure end-to-end type safety and automated testing coverage with Playwright and Jest"
    ],
    benefits: ["100% Remote Culture", "Home Office Setup Stipend", "Unlimited Paid Time Off", "Generous Equity Grants"]
  },
  {
    id: "job-tech-3",
    title: "Backend Software Engineer",
    company: "Datadog",
    logoText: "D",
    logoBg: "bg-purple-600",
    location: "New York, NY (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$140,000 - $175,000",
    postedDate: "3 days ago",
    category: "Backend",
    domain: "Technology",
    department: "Distributed Ingestion Engine",
    applicationUrl: "https://careers.datadoghq.com",
    description: "Build high-throughput, low-latency microservices handling millions of metrics per second with Node.js, Python FastAPI, PostgreSQL, Redis, and Kafka. You will solve distributed systems challenges and ensure 99.99% system availability.",
    requiredSkills: ["Node.js", "Python", "PostgreSQL", "REST APIs", "SQL", "Docker", "System Design"],
    preferredSkills: ["Redis", "Apache Kafka", "FastAPI", "Microservices", "AWS"],
    responsibilities: [
      "Design and maintain distributed backend APIs and event-driven data ingestion pipelines",
      "Optimize relational PostgreSQL queries and implement Redis caching layers to reduce database load",
      "Author unit and integration tests using Jest, Supertest, and Testcontainers",
      "Participate in on-call rotation and conduct blameless incident post-mortems"
    ],
    benefits: ["Competitive Equity", "Gym Membership", "Generous Parental Leave", "Catered Daily Lunches"]
  },
  {
    id: "job-tech-4",
    title: "Cloud DevOps & Platform Engineer",
    company: "HashiCorp",
    logoText: "H",
    logoBg: "bg-blue-600",
    location: "Austin, TX (Remote)",
    workType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Senior Level",
    salary: "$150,000 - $185,000",
    postedDate: "Just now",
    category: "DevOps",
    domain: "Technology",
    department: "Cloud Infrastructure",
    applicationUrl: "https://www.hashicorp.com/careers",
    description: "Architect automated CI/CD release pipelines on AWS, manage containerized microservice fleets on ECS and Kubernetes, and codify enterprise cloud infrastructure with Terraform and AWS CDK.",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Git"],
    preferredSkills: ["AWS CodePipeline", "Prometheus", "Grafana", "Python", "Bash"],
    responsibilities: [
      "Maintain self-mutating CI/CD deployment pipelines using CodePipeline and GitHub Actions",
      "Enforce least-privilege IAM policies, Trivy container scanning, and zero-downtime Blue-Green releases",
      "Monitor application performance with Prometheus and Grafana alerts",
      "Automate cloud provisioning with modular Terraform infrastructure as code"
    ],
    benefits: ["Flexible Hours", "Health & Wellness Allowance", "Remote Setup Budget", "Education Reimbursement"]
  },
  {
    id: "job-tech-5",
    title: "Junior Frontend Developer",
    company: "Shopify",
    logoText: "S",
    logoBg: "bg-emerald-600",
    location: "Toronto, ON (Remote)",
    workType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Entry Level",
    salary: "$85,000 - $110,000",
    postedDate: "4 days ago",
    category: "Frontend",
    domain: "Technology",
    department: "Merchant Experience",
    applicationUrl: "https://www.shopify.com/careers",
    description: "Develop responsive, customer-facing commerce storefront components using React, modern JavaScript ES6+, HTML5 semantic markup, and CSS3. Receive structured mentorship from senior engineering staff.",
    requiredSkills: ["React", "JavaScript", "HTML5", "CSS3", "Git", "Responsive Design"],
    preferredSkills: ["TypeScript", "Tailwind CSS", "REST APIs", "Jest"],
    responsibilities: [
      "Build clean, reusable React UI components adhering to accessibility guidelines",
      "Collaborate with product designers to translate Figma mockups into pixel-perfect web pages",
      "Write unit tests for UI components and participate in sprint planning",
      "Debug browser rendering inconsistencies across mobile and desktop devices"
    ],
    benefits: ["Mentorship Program", "Health Benefits", "Home Internet Stipend", "Learning & Development Fund"]
  },

  // ──────────────────────────────────────────────────
  // HUMAN RESOURCES & PEOPLE OPERATIONS
  // ──────────────────────────────────────────────────
  {
    id: "job-hr-1",
    title: "Talent Acquisition Specialist",
    company: "Airbnb",
    logoText: "A",
    logoBg: "bg-rose-500",
    location: "San Francisco, CA (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$95,000 - $125,000",
    postedDate: "1 day ago",
    category: "HR",
    domain: "Human Resources",
    department: "Global Talent Team",
    applicationUrl: "https://careers.airbnb.com",
    description: "Lead end-to-end recruitment pipelines, partner with technical and business hiring managers, source top-tier passive talent via LinkedIn Recruiter, and conduct structured behavioral interviews using the STAR framework.",
    requiredSkills: ["Recruitment", "Talent Sourcing", "LinkedIn Recruiter", "Candidate Screening", "Structured Interviewing", "Stakeholder Communication"],
    preferredSkills: ["HR Analytics", "Greenhouse ATS", "Employer Branding", "Offer Negotiation"],
    responsibilities: [
      "Manage full-cycle recruiting for technical and business functions from sourcing to offer closing",
      "Build proactive talent pipelines using Boolean search strings in LinkedIn Recruiter",
      "Conduct structured behavioral candidate screening calls and assess cultural alignment",
      "Track recruiting metrics such as Time-to-Fill, Source of Hire, and Offer Acceptance Rate"
    ],
    benefits: ["Annual Travel Credit ($2,000)", "Comprehensive Health Plan", "Flexible Working Hours", "Employee Stock Purchase Program"]
  },
  {
    id: "job-hr-2",
    title: "Human Resources Executive",
    company: "Deloitte",
    logoText: "D",
    logoBg: "bg-green-700",
    location: "Chicago, IL (On-site)",
    workType: "On-site",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$90,000 - $115,000",
    postedDate: "2 days ago",
    category: "HR",
    domain: "Human Resources",
    department: "People & Performance",
    applicationUrl: "https://www2.deloitte.com/careers",
    description: "Manage employee lifecycle operations, new hire onboarding journeys, performance appraisal cycles, HRMS administration, and workplace compliance.",
    requiredSkills: ["HR Management", "Employee Onboarding", "HRMS Software", "Employee Relations", "Performance Management", "Workplace Compliance"],
    preferredSkills: ["Workday", "Excel", "POSH Act Compliance", "Attrition Modeling"],
    responsibilities: [
      "Orchestrate seamless 30-60-90 day onboarding and orientation programs for new hires",
      "Facilitate continuous performance management reviews and OKR calibration meetings",
      "Maintain employee master data and leave records within enterprise HRMS software",
      "Conduct workplace compliance audits and resolve employee grievance queries"
    ],
    benefits: ["Comprehensive Medical", "401(k) Match", "Tuition Assistance", "Paid Time Off"]
  },
  {
    id: "job-hr-3",
    title: "People Operations & HR Analyst",
    company: "Canva",
    logoText: "C",
    logoBg: "bg-cyan-600",
    location: "Austin, TX (Remote)",
    workType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Entry Level",
    salary: "$75,000 - $95,000",
    postedDate: "5 days ago",
    category: "HR",
    domain: "Human Resources",
    department: "People Analytics",
    applicationUrl: "https://www.canva.com/careers",
    description: "Analyze employee engagement survey data, build headcount turnover reports in Excel, support HR operations, and optimize onboarding processes.",
    requiredSkills: ["HR Analytics", "Excel", "Employee Lifecycle", "Data Analysis", "Candidate Screening"],
    preferredSkills: ["Tableau", "HRMS Software", "Survey Design", "Communication"],
    responsibilities: [
      "Calculate annualized voluntary and involuntary attrition rates across business departments",
      "Analyze eNPS sentiment survey trends and prepare actionable retention presentations",
      "Automate monthly headcount reports and HR KPI dashboards using Excel pivots and formulas",
      "Coordinate pre-boarding communication and background verification processes"
    ],
    benefits: ["Free Canva Pro Lifetime", "Flexible Working Hours", "Comprehensive Health Plan", "Annual Learning Stipend"]
  },

  // ──────────────────────────────────────────────────
  // MARKETING & GROWTH
  // ──────────────────────────────────────────────────
  {
    id: "job-mkt-1",
    title: "Digital Growth Marketing Specialist",
    company: "HubSpot",
    logoText: "H",
    logoBg: "bg-orange-600",
    location: "Boston, MA (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$95,000 - $125,000",
    postedDate: "1 day ago",
    category: "Marketing",
    domain: "Marketing",
    department: "Inbound Demand Generation",
    applicationUrl: "https://www.hubspot.com/careers",
    description: "Manage multi-channel customer acquisition across Google Ads PPC, SEO keyword clusters, email lifecycle nurture funnels, and Google Analytics 4 tracking.",
    requiredSkills: ["Digital Marketing", "SEO Strategy", "Google Ads", "GA4", "Email Marketing", "Copywriting"],
    preferredSkills: ["HubSpot CRM", "Conversion Rate Optimization", "Meta Ads", "A/B Testing"],
    responsibilities: [
      "Plan and execute paid search campaigns in Google Ads with Target ROAS bidding",
      "Optimize inbound content for search intent to drive organic keyword rankings",
      "Build automated email nurture workflows and welcome sequences in HubSpot",
      "Track full-funnel conversion attribution models in Google Analytics 4"
    ],
    benefits: ["Unlimited Vacation", "Tuition Reimbursement", "Parental Leave", "Stock Options"]
  },
  {
    id: "job-mkt-2",
    title: "SEO & Content Marketing Strategist",
    company: "Notion",
    logoText: "N",
    logoBg: "bg-black",
    location: "San Francisco, CA (Remote)",
    workType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$100,000 - $130,000",
    postedDate: "3 days ago",
    category: "Marketing",
    domain: "Marketing",
    department: "Organic Growth",
    applicationUrl: "https://www.notion.so/careers",
    description: "Drive exponential organic search traffic through technical SEO audits, high-converting product guides, pillar-and-cluster content architecture, and backlink strategies.",
    requiredSkills: ["SEO", "Content Marketing", "Technical SEO", "Keyword Research", "Copywriting", "GA4"],
    preferredSkills: ["Ahrefs / Semrush", "Schema Markup", "WordPress", "Data Storytelling"],
    responsibilities: [
      "Author authoritative, high-converting product guides and template landing pages",
      "Perform technical SEO audits addressing Core Web Vitals, canonical tags, and schema markup",
      "Execute pillar-and-cluster content strategies targeting high-intent business search queries",
      "Measure organic traffic growth, bounce rates, and lead conversion rates in GA4"
    ],
    benefits: ["Remote First", "Annual Wellness Stipend", "Equipment Budget", "Comprehensive Healthcare"]
  },
  {
    id: "job-mkt-3",
    title: "Performance Marketing Lead",
    company: "DoorDash",
    logoText: "D",
    logoBg: "bg-red-600",
    location: "New York, NY (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Senior Level",
    salary: "$135,000 - $165,000",
    postedDate: "4 days ago",
    category: "Marketing",
    domain: "Marketing",
    department: "Growth & Paid Acquisition",
    applicationUrl: "https://careers.doordash.com",
    description: "Scale multi-million dollar performance marketing budgets across Meta Ads Manager, Google Search, TikTok, and App Install campaigns with strict ROAS targets.",
    requiredSkills: ["Performance Marketing", "Meta Ads Manager", "Google Ads", "ROAS Optimization", "Marketing Attribution", "Data Analysis"],
    preferredSkills: ["Conversions API (CAPI)", "Lookalike Audiences", "SQL", "Tableau"],
    responsibilities: [
      "Manage high-budget paid social campaigns across Meta Ads and Google Ads",
      "Implement server-to-server tracking via Meta Conversions API (CAPI)",
      "Analyze creative ad fatigue and establish continuous multi-variant A/B testing loops",
      "Collaborate with data science to build Media Mix Models (MMM) allocating annual spend"
    ],
    benefits: ["DoorDash Monthly Credits", "Competitive 401(k)", "Full Medical/Dental", "Learning Credits"]
  },

  // ──────────────────────────────────────────────────
  // DATA & ANALYTICS
  // ──────────────────────────────────────────────────
  {
    id: "job-data-1",
    title: "Business Intelligence & Data Analyst",
    company: "Spotify",
    logoText: "S",
    logoBg: "bg-emerald-500",
    location: "New York, NY (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$115,000 - $145,000",
    postedDate: "2 days ago",
    category: "Data",
    domain: "Data & Analytics",
    department: "Creator & Artist Analytics",
    applicationUrl: "https://www.lifeatspotify.com/jobs",
    description: "Transform multi-terabyte music listening and creator data into actionable business intelligence dashboards using complex SQL, Power BI, Python Pandas, and Star Schema modeling.",
    requiredSkills: ["SQL", "Data Analysis", "Power BI", "Data Modeling", "Excel", "Business Intelligence"],
    preferredSkills: ["Python", "Pandas", "Tableau", "Window Functions", "DAX Formulas"],
    responsibilities: [
      "Write advanced SQL queries with Window Functions and CTEs across multi-terabyte datasets",
      "Architect Star Schema data models with Fact and Dimension tables in Power BI",
      "Develop interactive executive dashboards with drill-down DAX calculations",
      "Translate complex listener metrics into strategic product recommendations"
    ],
    benefits: ["Spotify Premium for Life", "Flexible Workplace Policy", "Health & Dental", "Retirement Plan"]
  },
  {
    id: "job-data-2",
    title: "Junior Data Analyst",
    company: "Amazon",
    logoText: "A",
    logoBg: "bg-amber-600",
    location: "Seattle, WA (On-site)",
    workType: "On-site",
    employmentType: "Full-time",
    experienceLevel: "Entry Level",
    salary: "$80,000 - $105,000",
    postedDate: "3 days ago",
    category: "Data",
    domain: "Data & Analytics",
    department: "Operations Intelligence",
    applicationUrl: "https://www.amazon.jobs",
    description: "Analyze logistics performance data, write relational SQL queries, build operational Excel models, and create automated KPI reporting workflows.",
    requiredSkills: ["SQL", "Excel", "Data Analysis", "Relational Joins", "Data Cleaning"],
    preferredSkills: ["Python", "Power BI", "Statistics", "Tableau"],
    responsibilities: [
      "Query operational relational databases using multi-table JOINs and GROUP BY filters",
      "Clean and preprocess logistics data using Excel Power Query and Python Pandas",
      "Generate weekly inventory delivery time performance reports for regional managers",
      "Identify operational bottlenecks and anomalies using descriptive statistical models"
    ],
    benefits: ["Comprehensive Benefits Day 1", "Career Advancement Pathways", "Employee Discounts", "401(k) Match"]
  },
  {
    id: "job-data-3",
    title: "Senior Data Analyst (Product & Growth)",
    company: "Uber",
    logoText: "U",
    logoBg: "bg-black",
    location: "San Francisco, CA (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Senior Level",
    salary: "$145,000 - $180,000",
    postedDate: "Just now",
    category: "Data",
    domain: "Data & Analytics",
    department: "Rider Growth Analytics",
    applicationUrl: "https://www.uber.com/careers",
    description: "Lead A/B test experimentation analysis, cohort retention modeling, SQL window function queries, and metric trees to identify driver and rider funnel friction.",
    requiredSkills: ["SQL", "Data Analysis", "A/B Testing Math", "Python", "Cohort Retention", "Metric Trees", "Tableau"],
    preferredSkills: ["Snowflake", "dbt", "Predictive Analytics", "Machine Learning"],
    responsibilities: [
      "Design and evaluate statistical A/B tests with sample sizing and hypothesis testing rigor",
      "Construct North Star Metric Trees and cohort retention curves to guide product feature launches",
      "Build scalable data transformation pipelines in Snowflake and dbt",
      "Partner with product managers to define growth KPIs and evaluate feature impact"
    ],
    benefits: ["Uber Monthly Credits", "Health & Wellness Allowance", "Generous Equity", "Annual Learning Fund"]
  },

  // ──────────────────────────────────────────────────
  // FINANCE & BUSINESS
  // ──────────────────────────────────────────────────
  {
    id: "job-fin-1",
    title: "Financial Analyst (FP&A)",
    company: "Goldman Sachs",
    logoText: "G",
    logoBg: "bg-blue-800",
    location: "New York, NY (On-site)",
    workType: "On-site",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$110,000 - $140,000",
    postedDate: "2 days ago",
    category: "Finance",
    domain: "Finance & Accounting",
    department: "Corporate FP&A",
    applicationUrl: "https://www.goldmansachs.com/careers",
    description: "Build three-statement financial models, forecast quarterly departmental revenues and expenses, conduct variance analysis, and prepare executive board presentations in Excel.",
    requiredSkills: ["Financial Modeling", "Excel", "Data Analysis", "Financial Analysis", "Budgeting", "Variance Analysis"],
    preferredSkills: ["SQL", "Power BI", "Accounting Principles", "PowerPoint"],
    responsibilities: [
      "Construct multi-scenario 3-statement financial projection models in Excel",
      "Analyze monthly budget vs actual variances and explain key operational cost drivers",
      "Prepare quarterly executive presentations for executive leadership and board members",
      "Evaluate capital expenditure ROI and strategic investment proposals"
    ],
    benefits: ["Top-tier Healthcare", "Performance Bonus", "Retirement Matching", "Onsite Fitness Center"]
  },
  {
    id: "job-biz-1",
    title: "Business Operations Analyst",
    company: "McKinsey & Company",
    logoText: "M",
    logoBg: "bg-slate-900",
    location: "Atlanta, GA (Hybrid)",
    workType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid Level",
    salary: "$105,000 - $135,000",
    postedDate: "4 days ago",
    category: "Business",
    domain: "Business & Sales",
    department: "Operations Practice",
    applicationUrl: "https://www.mckinsey.com/careers",
    description: "Conduct quantitative process flow analyses, evaluate supply chain efficiencies, design executive KPI dashboards, and streamline cross-functional business operations.",
    requiredSkills: ["Business Analysis", "Excel", "Process Optimization", "Stakeholder Communication", "Data Analysis"],
    preferredSkills: ["SQL", "Tableau", "Project Management", "Agile"],
    responsibilities: [
      "Map and analyze core operational business workflows to eliminate bottlenecks and waste",
      "Conduct quantitative cost-benefit modeling to evaluate automation opportunities",
      "Design executive KPI summary reports for leadership and cross-functional teams",
      "Facilitate stakeholder working sessions to align department heads on growth goals"
    ],
    benefits: ["Executive Coaching", "Full Health & Dental", "Travel Perks", "Comprehensive Retirement Plan"]
  }
];
