/**
 * PREPRIA Multi-Domain Career Roadmap & Skill Gap Intelligence Engine
 * Dynamically supports Technical, Data, HR, Marketing, Finance, Business, and Design career paths.
 */

export const CAREER_DOMAINS = {
  'Technology': {
    name: 'Technology & Software',
    roles: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Software Engineer', 'DevOps / Cloud Engineer', 'QA Automation Engineer']
  },
  'Data & Analytics': {
    name: 'Data & Analytics',
    roles: ['Data Analyst', 'Business Analyst', 'BI Analyst', 'Product Analyst']
  },
  'Human Resources': {
    name: 'Human Resources',
    roles: ['HR Executive', 'Talent Acquisition Specialist', 'HR Analyst', 'Recruiter', 'People Operations']
  },
  'Marketing': {
    name: 'Marketing & Growth',
    roles: ['Marketing Executive', 'Digital Marketing Specialist', 'SEO & Content Strategist', 'Social Media Strategist']
  },
  'Finance': {
    name: 'Finance & Accounting',
    roles: ['Financial Analyst', 'Investment Analyst', 'Corporate Accountant', 'Finance Associate']
  },
  'Business & Sales': {
    name: 'Business & Sales',
    roles: ['Business Development Executive', 'Account Executive', 'Sales Operations Manager', 'Strategy Associate']
  },
  'Design': {
    name: 'Design & Creative',
    roles: ['UI/UX Designer', 'Product Designer', 'Graphic Designer']
  }
};

export const ROLE_DEFINITIONS = {
  // ──────────────────────────────────────────────────
  // HUMAN RESOURCES DOMAIN
  // ──────────────────────────────────────────────────
  'HR Executive': {
    domain: 'Human Resources',
    category: 'Human Resources & People Ops',
    coreSkills: ['Recruitment', 'Candidate Screening', 'HR Analytics', 'HRMS Tools', 'Employee Relations', 'Workplace Compliance', 'Excel', 'Stakeholder Communication'],
    dimensions: [
      { name: 'Recruitment & Sourcing', weight: 0.25 },
      { name: 'Communication & Stakeholders', weight: 0.25 },
      { name: 'HR Analytics & Metrics', weight: 0.20 },
      { name: 'HRMS Tools & Administration', weight: 0.15 },
      { name: 'Policy & Compliance', weight: 0.15 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'HR FUNDAMENTALS',
        title: 'HR Operations & Employee Lifecycle',
        desc: 'Understand end-to-end employee lifecycle management, onboarding flows, and basic employment standards.',
        skills: ['Employee Lifecycle', 'Onboarding', 'HR Operations', 'HR Policies'],
        why: 'Mastering foundational employee lifecycle stages is expected across all corporate HR departments.',
        action: 'Design a standard 30-60-90 day employee onboarding workflow.',
        duration: '1–2 Weeks'
      },
      {
        step: '02',
        phase: 'TALENT ACQUISITION',
        title: 'Candidate Sourcing & Screening Excellence',
        desc: 'Master active candidate sourcing on LinkedIn, resume screening, initial phone screening, and interview scheduling.',
        skills: ['Recruitment', 'Candidate Screening', 'Job Description Writing', 'Interview Coordination'],
        why: 'Recruitment is the highest-volume core deliverable in entry-to-mid level HR roles.',
        action: 'Draft 2 optimized job descriptions and conduct mock screening calls.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'HR TECH & ANALYTICS',
        title: 'HRMS Tools & People Analytics',
        desc: 'Work with modern HRMS software, headcount reporting, attrition rate modeling, and Excel pivots.',
        skills: ['HRMS Tools', 'HR Analytics', 'Advanced Excel', 'Attrition Modeling'],
        why: 'Data-driven HR professionals who analyze turnover and performance command 30% higher compensation.',
        action: 'Build an HR attrition and diversity metrics dashboard in Excel.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'INTERPERSONAL MASTERY',
        title: 'Communication & Stakeholder Management',
        desc: 'Manage workplace communication, conflict de-escalation, grievance handling, and manager alignment.',
        skills: ['Stakeholder Communication', 'Conflict Resolution', 'Employee Engagement', 'Active Listening'],
        why: 'Effective empathy and negotiation skills protect organizational culture and retain top talent.',
        action: 'Complete 3 workplace conflict resolution case study scenarios.',
        duration: '1–2 Weeks'
      },
      {
        step: '05',
        phase: 'COMPLIANCE & LEGAL',
        title: 'Workplace Policies & Employment Compliance',
        desc: 'Understand labor laws, POSH compliance, statutory benefits, and company code of conduct.',
        skills: ['Labor Law Basics', 'POSH Compliance', 'Statutory Benefits', 'Code of Conduct'],
        why: 'Ensures zero legal exposure and upholds fair workplace standards across employee relations.',
        action: 'Review and audit a standard employee handbook for compliance gaps.',
        duration: '1 Week'
      },
      {
        step: '06',
        phase: 'INTERVIEW READINESS',
        title: 'HR Interview Preparation & Case Defense',
        desc: 'Master situational judgment questions, behavioral STAR method scenarios, and HR case interviews.',
        skills: ['Behavioral STAR Method', 'Situational Judgement', 'HR Strategy Pitch', 'Mock Interviews'],
        why: 'Role-play simulations ensure articulate, polished answers during executive HR hiring rounds.',
        action: 'Complete 3 AI HR behavioral mock interview sessions.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'End-to-End Recruitment & Onboarding Policy Suite',
      skills: ['Talent Sourcing', 'HRMS Workflow', 'HR Analytics', 'Excel'],
      why: 'Provides tangible evidence of structured recruitment, pipeline tracking, and employee engagement planning.',
      time: '12 Hours'
    }
  },

  'Talent Acquisition Specialist': {
    domain: 'Human Resources',
    category: 'Talent Acquisition & Sourcing',
    coreSkills: ['Boolean Search', 'LinkedIn Recruiter', 'Headhunting', 'ATS Management', 'Employer Branding', 'Candidate Experience', 'Salary Negotiation'],
    dimensions: [
      { name: 'Sourcing & Boolean Search', weight: 0.30 },
      { name: 'Candidate Pipeline Strategy', weight: 0.25 },
      { name: 'ATS Management', weight: 0.20 },
      { name: 'Negotiation & Closing', weight: 0.15 },
      { name: 'Employer Branding', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Sourcing Channels & Boolean Search Mastery',
        desc: 'Master advanced Boolean operators, LinkedIn Recruiter searches, and GitHub/Dribbble talent sourcing.',
        skills: ['Boolean Search', 'LinkedIn Sourcing', 'Candidate Outreach', 'Talent Mapping'],
        why: 'Top sourcers find passive, high-value candidates that standard job boards miss.',
        action: 'Build a targeted talent pipeline of 25 qualified candidates using Boolean strings.',
        duration: '1–2 Weeks'
      },
      {
        step: '02',
        phase: 'PIPELINE MANAGEMENT',
        title: 'ATS Workflow & Pipeline Velocity',
        desc: 'Optimize candidate tracking stages, SLA response times, and automated email nurturing sequences.',
        skills: ['ATS Management', 'Pipeline Velocity', 'Email Outreach', 'Candidate Experience'],
        why: 'Maintaining high candidate velocity directly reduces corporate time-to-hire metrics.',
        action: 'Design a 4-touchpoint passive candidate email nurture sequence.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'CLOSING & BRAND',
        title: 'Salary Negotiation & Offer Acceptance',
        desc: 'Learn market rate benchmarking, counter-offer mitigation, and candidate closing strategies.',
        skills: ['Salary Negotiation', 'Offer Management', 'Compensation Benchmarking', 'Candidate Closing'],
        why: 'Securing offer acceptances is the critical KPI in talent acquisition performance.',
        action: 'Simulate 2 high-stakes offer negotiation and counter-offer scenarios.',
        duration: '1–2 Weeks'
      },
      {
        step: '04',
        phase: 'INTERVIEW READINESS',
        title: 'TA Behavioral & Strategy Mock Interviews',
        desc: 'Defend hiring metrics (cost-per-hire, time-to-fill) in executive talent acquisition interviews.',
        skills: ['Recruitment Metrics', 'STAR Interviewing', 'Executive Presentation'],
        why: 'Proves your strategic ability to scale business teams under hiring constraints.',
        action: 'Complete 2 TA scenario-based AI mock interviews.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Full-Cycle Tech Hiring Campaign Strategy',
      skills: ['Boolean Sourcing', 'ATS Workflows', 'Email Nurturing', 'Salary Benchmarking'],
      why: 'Demonstrates complete candidate pipeline generation from sourcing to signed offer letter.',
      time: '10 Hours'
    }
  },

  // ──────────────────────────────────────────────────
  // MARKETING DOMAIN
  // ──────────────────────────────────────────────────
  'Marketing Executive': {
    domain: 'Marketing',
    category: 'Marketing & Brand Strategy',
    coreSkills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Google Analytics', 'Social Media Marketing', 'Campaign Management', 'Copywriting', 'Email Marketing'],
    dimensions: [
      { name: 'Content & Copywriting', weight: 0.25 },
      { name: 'Campaign Strategy', weight: 0.25 },
      { name: 'SEO & Organic Growth', weight: 0.20 },
      { name: 'Analytics & Measurement', weight: 0.15 },
      { name: 'Social Media Management', weight: 0.15 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Marketing Principles & Consumer Psychology',
        desc: 'Understand marketing funnels (AIDA), value propositions, target persona creation, and messaging.',
        skills: ['Marketing Fundamentals', 'Target Personas', 'Value Proposition', 'Copywriting'],
        why: 'Strong core messaging drives higher conversion across all downstream digital channels.',
        action: 'Develop 2 comprehensive buyer personas and core messaging matrices.',
        duration: '1 Week'
      },
      {
        step: '02',
        phase: 'ORGANIC GROWTH',
        title: 'SEO, Content Marketing & Inbound Channels',
        desc: 'Keyword research, on-page optimization, content pillar architecture, and organic lead generation.',
        skills: ['SEO Fundamentals', 'Keyword Research', 'Content Strategy', 'Blog Optimization'],
        why: 'Organic search creates sustainable, compounding website traffic without advertising spend.',
        action: 'Write an SEO-optimized pillar article targeting high-intent long-tail keywords.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'PAID & SOCIAL',
        title: 'Performance Marketing & Social Media Campaigns',
        desc: 'Plan and execute paid ad campaigns (Meta / Google), audience segmentation, and A/B ad testing.',
        skills: ['Paid Advertising', 'Social Media Strategy', 'A/B Creative Testing', 'Ad Copywriting'],
        why: 'Performance marketing skills allow businesses to scale customer acquisition predictably.',
        action: 'Design a complete multichannel ad campaign with budget allocation and targeting.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'ANALYTICS & ROI',
        title: 'Google Analytics 4 & Campaign ROI Measurement',
        desc: 'Track conversion goals, UTM tracking conventions, customer acquisition cost (CAC), and ROAS.',
        skills: ['Google Analytics 4', 'UTM Tracking', 'Conversion Rate Optimization', 'ROI Reporting'],
        why: 'Proving marketing return-on-investment is essential for budget approval and career growth.',
        action: 'Create a campaign performance report analyzing CAC, conversion rates, and ROI.',
        duration: '1–2 Weeks'
      },
      {
        step: '05',
        phase: 'INTERVIEW READINESS',
        title: 'Marketing Case Studies & Campaign Defense',
        desc: 'Present marketing case studies, growth hypotheses, and defend campaign strategy in mock interviews.',
        skills: ['Campaign Defense', 'Growth Hypotheses', 'Behavioral STAR', 'Mock Interviews'],
        why: 'Senior marketers are judged on strategic clarity and data-backed campaign decisions.',
        action: 'Complete 3 AI marketing scenario and growth case study mock interviews.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Omnichannel Go-To-Market & Growth Strategy Campaign',
      skills: ['Content Strategy', 'SEO Plan', 'Paid Ads Architecture', 'GA4 Analytics'],
      why: 'Demonstrates end-to-end marketing capability from customer persona to paid acquisition and ROI.',
      time: '14 Hours'
    }
  },

  'Digital Marketing Specialist': {
    domain: 'Marketing',
    category: 'Digital Growth & Performance',
    coreSkills: ['Google Ads', 'Meta Ads Manager', 'SEO', 'GA4', 'Email Marketing', 'Conversion Optimization', 'Retargeting', 'Copywriting'],
    dimensions: [
      { name: 'Paid Search & Social Ads', weight: 0.30 },
      { name: 'Analytics & Attribution', weight: 0.25 },
      { name: 'SEO & Inbound', weight: 0.20 },
      { name: 'Conversion Optimization', weight: 0.15 },
      { name: 'Email Automation', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'PAID CHANNELS',
        title: 'Google Ads & Search Engine Marketing',
        desc: 'Search intent modeling, negative keywords, Quality Score optimization, and bidding strategies.',
        skills: ['Google Ads', 'Keyword Bidding', 'Search Copywriting', 'Negative Keywords'],
        why: 'Google Ads captures high-intent customers at the exact moment of purchase decision.',
        action: 'Structure a multi-tier Google Search campaign with negative keyword lists.',
        duration: '2 Weeks'
      },
      {
        step: '02',
        phase: 'PERFORMANCE MEDIA',
        title: 'Meta & Social Ads Retargeting',
        desc: 'Pixel tracking, custom lookalike audiences, funnel-based retargeting, and creative refresh cycles.',
        skills: ['Meta Ads Manager', 'Pixel Tracking', 'Lookalike Audiences', 'Retargeting'],
        why: 'Social retargeting recaptures drop-offs and dramatically improves blended ROAS.',
        action: 'Design a 3-tier dynamic retargeting funnel with customized ad copy.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'DATA & CONVERSION',
        title: 'CRO & Full-Funnel Analytics',
        desc: 'Heatmaps, landing page conversion rate optimization, and multi-touch attribution modeling.',
        skills: ['GA4', 'Conversion Rate Optimization', 'Heatmap Analysis', 'Attribution'],
        why: 'Increasing landing page conversion rate by 1% doubles the profitability of paid ad spend.',
        action: 'Audit a landing page and write an A/B testing optimization brief.',
        duration: '1–2 Weeks'
      }
    ],
    recommendedProject: {
      title: 'Full-Funnel Paid Acquisition & Retargeting Engine',
      skills: ['Google Ads', 'Meta Ads', 'GA4 Tracking', 'Landing Page CRO'],
      why: 'Demonstrates data-driven performance marketing skills with clear ROI attribution.',
      time: '12 Hours'
    }
  },

  // ──────────────────────────────────────────────────
  // DATA & ANALYTICS DOMAIN
  // ──────────────────────────────────────────────────
  'Business Analyst': {
    domain: 'Data & Analytics',
    category: 'Business Analysis & Strategy',
    coreSkills: ['Requirement Gathering', 'Process Modeling', 'SQL', 'Advanced Excel', 'User Stories', 'BPMN', 'Stakeholder Management', 'Power BI'],
    dimensions: [
      { name: 'Requirement Engineering', weight: 0.25 },
      { name: 'Process & BPMN Modeling', weight: 0.25 },
      { name: 'Data Analysis & SQL', weight: 0.20 },
      { name: 'Stakeholder Alignment', weight: 0.15 },
      { name: 'Documentation & BRD', weight: 0.15 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Business Analysis Foundations & Scope Definition',
        desc: 'Understand business problem framing, scope boundaries, stakeholder mapping, and feasibility.',
        skills: ['Business Analysis', 'Scope Definition', 'Stakeholder Mapping', 'Feasibility Study'],
        why: 'Accurate problem formulation prevents multimillion dollar project scope creep.',
        action: 'Draft a Business Case and Project Scope Charter for a digital transformation.',
        duration: '1–2 Weeks'
      },
      {
        step: '02',
        phase: 'REQUIREMENT ENGINEERING',
        title: 'Requirement Gathering, BRDs & User Stories',
        desc: 'Write functional and non-functional requirements, user story backlogs, and acceptance criteria.',
        skills: ['Requirement Gathering', 'BRD Writing', 'User Stories', 'Acceptance Criteria'],
        why: 'Translating business goals into technical requirements is the core daily expectation for BAs.',
        action: 'Write a comprehensive Business Requirements Document (BRD) with 10 user stories.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'PROCESS MODELING',
        title: 'As-Is vs To-Be Process Modeling (BPMN / UML)',
        desc: 'Map existing business workflows, identify operational bottlenecks, and design optimized To-Be flows.',
        skills: ['Process Modeling', 'BPMN Diagrams', 'UML Use Cases', 'Gap Analysis'],
        why: 'Visual workflow diagrams bridge communication between executive stakeholders and technical teams.',
        action: 'Create detailed As-Is and To-Be swimlane process diagrams.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'DATA & VALIDATION',
        title: 'Data-Driven Validation with SQL & Excel',
        desc: 'Extract and analyze relational business data to validate operational hypotheses and model ROI.',
        skills: ['SQL Queries', 'Advanced Excel', 'Data Validation', 'ROI Modeling'],
        why: 'Data-backed business analysts drive faster executive consensus and defensible decisions.',
        action: 'Write SQL queries to analyze customer churn and quantify cost reduction.',
        duration: '2 Weeks'
      },
      {
        step: '05',
        phase: 'INTERVIEW READINESS',
        title: 'BA Case Studies & System Solution Defense',
        desc: 'Practice resolving ambiguous business scenarios, stakeholder conflict, and live requirement elicitation.',
        skills: ['Case Studies', 'Stakeholder Elicitation', 'STAR Method', 'Mock Interviews'],
        why: 'Simulated business cases prepare you for analytical whiteboard problem solving.',
        action: 'Complete 3 AI Business Analyst case study mock interviews.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Enterprise Workflow Modernization & BRD Specification',
      skills: ['BRD Documentation', 'BPMN Workflow', 'SQL Data Analysis', 'User Stories'],
      why: 'Demonstrates end-to-end business analysis from initial stakeholder discovery to technical specifications.',
      time: '15 Hours'
    }
  },

  'Data Analyst': {
    domain: 'Data & Analytics',
    category: 'Data & Analytics',
    coreSkills: ['SQL', 'Python', 'Pandas', 'Excel', 'Power BI', 'Tableau', 'Statistics', 'Data Visualization', 'ETL'],
    dimensions: [
      { name: 'SQL & Data Extraction', weight: 0.30 },
      { name: 'Python Data Wrangling', weight: 0.25 },
      { name: 'Business Intelligence & Dashboards', weight: 0.25 },
      { name: 'Applied Statistics', weight: 0.20 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Advanced Excel & Business Analytics Modeling',
        desc: 'Master pivot tables, lookup formulas (XLOOKUP), data cleaning, and scenario modeling.',
        skills: ['Advanced Excel', 'Pivot Tables', 'XLOOKUP', 'Data Cleaning'],
        why: 'Excel remains an essential exploratory tool for rapid business analysis.',
        action: 'Build a dynamic business KPI summary model in Excel.',
        duration: '1 Week'
      },
      {
        step: '02',
        phase: 'DATA EXTRACTION',
        title: 'Advanced SQL & Relational Querying',
        desc: 'Master multi-table joins, Window functions, CTEs, and aggregation pipelines.',
        skills: ['SQL', 'Window Functions', 'CTEs', 'Subqueries', 'Database Views'],
        why: 'SQL is tested in 95%+ of data analyst interview screening rounds.',
        action: 'Solve 15 complex business analytics queries using window functions.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'PROGRAMMING & WRANGLING',
        title: 'Python for Data Analysis & Pandas',
        desc: 'Automate data wrangling, missing data imputation, and exploratory data analysis (EDA).',
        skills: ['Python', 'Pandas', 'NumPy', 'Jupyter Notebooks'],
        why: 'Python enables scalable automated analysis beyond spreadsheet limits.',
        action: 'Perform exploratory analysis on a 500k-row consumer dataset.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'VISUALIZATION & BI',
        title: 'Interactive Dashboards (Power BI / Tableau)',
        desc: 'Design executive-facing dashboards with drill-through parameters and KPI telemetry.',
        skills: ['Power BI', 'Tableau', 'DAX', 'Visual Storytelling'],
        why: 'Translating complex data into clear visual insights is the primary core deliverable.',
        action: 'Publish an interactive multi-page business intelligence dashboard.',
        duration: '2 Weeks'
      },
      {
        step: '05',
        phase: 'INTERVIEW READINESS',
        title: 'Data Case Studies & Portfolio Defense',
        desc: 'Present data insights clearly, practice live SQL whiteboard tests, and business cases.',
        skills: ['Case Studies', 'Executive Presentation', 'Live SQL Test', 'Behavioral'],
        why: 'Data interviews focus heavily on how effectively you communicate findings.',
        action: 'Complete 2 full data analyst case study mock interview rounds.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Executive Sales & Churn Analytics Suite',
      skills: ['SQL', 'Python (Pandas)', 'Power BI', 'Hypothesis Testing'],
      why: 'Demonstrates complete pipeline from raw SQL extraction to executive-level visualization.',
      time: '14 Hours'
    }
  },

  // ──────────────────────────────────────────────────
  // FINANCE DOMAIN
  // ──────────────────────────────────────────────────
  'Financial Analyst': {
    domain: 'Finance',
    category: 'Corporate Finance & Valuation',
    coreSkills: ['Financial Modeling', 'DCF Valuation', 'Accounting Principles', 'Financial Statements', 'Advanced Excel', 'Ratio Analysis', 'Forecasting', 'PowerPoint Presentation'],
    dimensions: [
      { name: 'Financial Modeling & Excel', weight: 0.30 },
      { name: 'Accounting & Statements', weight: 0.25 },
      { name: 'Valuation & DCF', weight: 0.20 },
      { name: 'Budgeting & Forecasting', weight: 0.15 },
      { name: 'Executive Presentation', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: '3-Statement Financial Accounting Fundamentals',
        desc: 'Understand how the Income Statement, Balance Sheet, and Cash Flow Statement dynamically interconnect.',
        skills: ['Accounting Principles', 'Income Statement', 'Balance Sheet', 'Cash Flow'],
        why: 'Accounting is the fundamental language of all corporate finance decisions.',
        action: 'Build an interconnected 3-statement financial model from scratch.',
        duration: '2 Weeks'
      },
      {
        step: '02',
        phase: 'FINANCIAL MODELING',
        title: 'Advanced Financial Modeling & Forecasting',
        desc: 'Develop multi-year revenue projections, working capital schedules, and debt depreciation schedules.',
        skills: ['Financial Modeling', 'Advanced Excel', 'Revenue Forecasting', 'Depreciation Schedules'],
        why: 'Wall Street and corporate finance teams require fast, formulaic Excel modeling without errors.',
        action: 'Construct a 5-year financial forecast model with dynamic scenario toggles.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'VALUATION',
        title: 'Valuation Methods (DCF & Comparable Companies)',
        desc: 'Calculate WACC, terminal values, enterprise value, and trading comparables multiples (EV/EBITDA, P/E).',
        skills: ['DCF Valuation', 'WACC Calculation', 'Trading Comps', 'Precedent Transactions'],
        why: 'Valuation modeling is the core analytical capability tested in investment banking and FP&A.',
        action: 'Perform a full discounted cash flow (DCF) valuation on a publicly traded company.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'VARIANCE & REPORTING',
        title: 'Budgeting, Variance Analysis & Presentation',
        desc: 'Analyze budget vs actual variances, synthesize financial commentary, and prepare executive decks.',
        skills: ['Variance Analysis', 'Budgeting', 'Executive Presentations', 'Financial KPIs'],
        why: 'Communicating the "why" behind financial variance drives operational business adjustments.',
        action: 'Write an executive quarterly financial variance memo with key recommendations.',
        duration: '1–2 Weeks'
      },
      {
        step: '05',
        phase: 'INTERVIEW READINESS',
        title: 'Finance Technical & Case Mock Interviews',
        desc: 'Practice technical accounting questions, mental math, valuation walk-throughs, and STAR questions.',
        skills: ['Technical Finance Questions', 'Valuation Walkthrough', 'Behavioral STAR', 'Mock Interviews'],
        why: 'Fast, precise answers to technical finance questions ensure confident performance under scrutiny.',
        action: 'Complete 3 AI financial analyst technical mock interview rounds.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Complete 3-Statement Dynamic Valuation Model & Investment Pitch',
      skills: ['3-Statement Modeling', 'DCF Valuation', 'Comparable Comps', 'Excel Scenario Modeling'],
      why: 'Provides definitive proof of financial modeling rigor and investment analysis capability.',
      time: '16 Hours'
    }
  },

  // ──────────────────────────────────────────────────
  // TECHNOLOGY DOMAIN
  // ──────────────────────────────────────────────────
  'Full Stack Developer': {
    domain: 'Technology',
    category: 'Full Stack Engineering',
    coreSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'SQL', 'REST APIs', 'Git', 'Docker', 'System Design'],
    dimensions: [
      { name: 'Frontend Architecture', weight: 0.25 },
      { name: 'Backend & API Engineering', weight: 0.25 },
      { name: 'Database & Data Modeling', weight: 0.20 },
      { name: 'System Design & Scalability', weight: 0.15 },
      { name: 'Cloud & CI/CD', weight: 0.15 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Core Programming & Data Structures',
        desc: 'Master foundational problem solving, algorithmic complexity, and version control.',
        skills: ['JavaScript', 'Data Structures', 'Algorithms', 'Git'],
        why: 'Technical screeners evaluate algorithmic efficiency (Time/Space complexity) before system design.',
        action: 'Complete 2 algorithmic problem sets and push clean Git commits.',
        duration: '1–2 Weeks'
      },
      {
        step: '02',
        phase: 'FRONTEND MASTERY',
        title: 'React & Component Architecture',
        desc: 'Build scalable, component-driven client interfaces with robust state management.',
        skills: ['React', 'State Management', 'TypeScript', 'Tailwind CSS'],
        why: 'Your resume shows strong UI capabilities; elevating TypeScript and performance will satisfy senior requirements.',
        action: 'Build a modular component library with custom hooks.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'BACKEND ARCHITECTURE',
        title: 'Backend Engineering & API Design',
        desc: 'Develop secure, high-throughput REST and GraphQL backend services.',
        skills: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth'],
        why: 'Enterprise full-stack roles require hands-on authentication, error handling, and robust endpoint design.',
        action: 'Implement a role-based authentication service with rate limiting.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'DATA & STORAGE',
        title: 'Databases & System Design',
        desc: 'Model relational and document databases with indexing, caching, and query optimization.',
        skills: ['MongoDB', 'PostgreSQL', 'Redis', 'Database Indexing'],
        why: 'Optimizing query bottlenecks separates junior candidates from production-ready engineers.',
        action: 'Design a schema handling 100k+ records with sub-50ms response times.',
        duration: '2 Weeks'
      },
      {
        step: '05',
        phase: 'CLOUD & DEPLOYMENT',
        title: 'Production, Containers & CI/CD',
        desc: 'Containerize microservices and configure automated build and deployment pipelines.',
        skills: ['Docker', 'CI/CD Pipelines', 'AWS / Cloud', 'Nginx'],
        why: 'Cloud fluency is an essential hiring differentiator for modern deployment teams.',
        action: 'Deploy a containerized application to cloud infrastructure with automated CI tests.',
        duration: '1–2 Weeks'
      },
      {
        step: '06',
        phase: 'INTERVIEW READINESS',
        title: 'Mock Interviews & Placement Readiness',
        desc: 'Practice full-loop technical, architectural system design, and STAR behavioral interviews.',
        skills: ['System Design', 'Technical Communication', 'STAR Method', 'Live Coding'],
        why: 'Simulating high-stakes interview conditions increases live pass-through rates by 3.5x.',
        action: 'Achieve >80% score across 3 AI Mock Interview simulations.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Production-Ready Task & Workflow Engine',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
      why: 'Demonstrates end-to-end full-stack architecture with caching, database indexing, and containerized deployment.',
      time: '15 Hours'
    }
  },

  'Frontend Developer': {
    domain: 'Technology',
    category: 'Frontend Engineering',
    coreSkills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'State Management', 'Web Performance', 'Testing'],
    dimensions: [
      { name: 'JavaScript & Web Core', weight: 0.25 },
      { name: 'React Framework Mastery', weight: 0.30 },
      { name: 'UI / UX & Responsive Design', weight: 0.20 },
      { name: 'Performance & Optimization', weight: 0.15 },
      { name: 'Testing & Accessibility', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'JavaScript & Modern Web Standards',
        desc: 'Deepen understanding of ES6+, DOM manipulation, asynchronous programming, and event loops.',
        skills: ['JavaScript', 'ES6+', 'Async/Await', 'Git'],
        why: 'Deep core JavaScript mechanics are heavily evaluated in frontend screening rounds.',
        action: 'Complete JS async exercises and DOM event simulations.',
        duration: '1 Week'
      },
      {
        step: '02',
        phase: 'FRAMEWORK SPECIALIZATION',
        title: 'React & Component Architecture',
        desc: 'Master functional components, hooks lifecycle, context API, and component design patterns.',
        skills: ['React', 'Custom Hooks', 'Context API', 'Component Patterns'],
        why: 'Writing clean, decoupled components is the core daily expectation for frontend engineers.',
        action: 'Build a multi-page interactive dashboard with custom state management.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'ADVANCED FRONTEND',
        title: 'Next.js, SSR & TypeScript',
        desc: 'Implement server-side rendering, static site generation, and type-safe frontends.',
        skills: ['Next.js', 'TypeScript', 'Server Components', 'Routing'],
        why: 'Next.js is the leading production standard for high-performance enterprise web apps.',
        action: 'Migrate a client-rendered app to Next.js App Router with TypeScript.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'OPTIMIZATION & QUALITY',
        title: 'Frontend Performance & Testing',
        desc: 'Optimize Core Web Vitals, code splitting, bundle sizes, and unit testing with Jest/RTL.',
        skills: ['Web Vitals', 'Lazy Loading', 'Jest', 'React Testing Library'],
        why: 'Top tier tech companies prioritize fast load times and reliable test suites.',
        action: 'Achieve a 95+ Lighthouse performance score and 80%+ test coverage.',
        duration: '1–2 Weeks'
      },
      {
        step: '05',
        phase: 'INTERVIEW READINESS',
        title: 'Frontend Coding & System Design Interviews',
        desc: 'Practice UI machine coding rounds, DOM algorithms, and frontend architecture questions.',
        skills: ['UI Machine Coding', 'Frontend System Design', 'Behavioral Interviews'],
        why: 'Live coding rounds require fast component prototyping under time constraints.',
        action: 'Complete 3 timed UI machine coding mock interview sessions.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'High-Performance E-Commerce Product Explorer',
      skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React Query', 'Jest'],
      why: 'Showcases server-side filtering, virtualized list rendering, and responsive UX design.',
      time: '12 Hours'
    }
  },

  'Backend Developer': {
    domain: 'Technology',
    category: 'Backend Engineering',
    coreSkills: ['Node.js', 'Python', 'Java', 'SQL', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Docker', 'System Design', 'Kafka'],
    dimensions: [
      { name: 'Language & OOP Core', weight: 0.25 },
      { name: 'API Engineering & Security', weight: 0.25 },
      { name: 'Database Optimization', weight: 0.20 },
      { name: 'System Design & Scalability', weight: 0.20 },
      { name: 'Containers & Cloud', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Core Language & Algorithms',
        desc: 'Master OOP paradigms, memory management, and core algorithmic data structures.',
        skills: ['Python / Node.js', 'Data Structures', 'Algorithms', 'Git'],
        why: 'Backend engineering interviews evaluate problem-solving and algorithmic complexity.',
        action: 'Solve 20 medium algorithmic challenges in your core language.',
        duration: '2 Weeks'
      },
      {
        step: '02',
        phase: 'API ENGINEERING',
        title: 'High-Throughput API Architecture',
        desc: 'Build secure, scalable RESTful and gRPC web services with input validation and rate limiting.',
        skills: ['REST APIs', 'Express / FastAPI', 'Middleware', 'JWT / OAuth2'],
        why: 'Robust API contracts and resilient error handling form the foundation of enterprise systems.',
        action: 'Build a secure API service with token refresh and request throttling.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'DATABASE SYSTEMS',
        title: 'Relational & NoSQL Database Optimization',
        desc: 'Schema modeling, ACID transactions, B-Tree indexes, and connection pool management.',
        skills: ['PostgreSQL', 'MongoDB', 'SQL Query Tuning', 'Transactions'],
        why: 'Preventing database lockups and N+1 query bottlenecks is critical for scale.',
        action: 'Optimize complex analytical queries using EXPLAIN ANALYZE.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'SCALABILITY & CACHING',
        title: 'Caching & Message Queues',
        desc: 'Implement Redis caching layers and asynchronous messaging with Kafka or RabbitMQ.',
        skills: ['Redis', 'Message Queues', 'Pub/Sub', 'Asynchronous Workers'],
        why: 'Decoupling heavy processes via message brokers is standard in high-traffic applications.',
        action: 'Implement an asynchronous email/job processing pipeline with Redis BullMQ.',
        duration: '2 Weeks'
      },
      {
        step: '05',
        phase: 'SYSTEM ARCHITECTURE',
        title: 'System Design & Backend Mock Interviews',
        desc: 'Master scalable system design (URL shortener, chat app) and API coding challenges.',
        skills: ['System Design', 'Concurrency', 'Security Best Practices', 'Behavioral'],
        why: 'System design rounds are the primary determinant of placement level and compensation.',
        action: 'Complete 3 architectural system design mock interview sessions.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Scalable Microservices Order & Payment Engine',
      skills: ['Node.js / Python', 'PostgreSQL', 'Redis', 'Docker', 'Stripe API'],
      why: 'Demonstrates distributed transactions, idempotency keys, and resilient caching.',
      time: '18 Hours'
    }
  },

  'Software Engineer': {
    domain: 'Technology',
    category: 'Software Engineering',
    coreSkills: ['Data Structures', 'Algorithms', 'Java / Python / C++', 'OOP', 'SQL', 'Git', 'System Design', 'Unit Testing', 'CI/CD'],
    dimensions: [
      { name: 'Data Structures & Algorithms', weight: 0.30 },
      { name: 'Software Architecture & OOP', weight: 0.25 },
      { name: 'Database & Backend', weight: 0.20 },
      { name: 'System Design', weight: 0.15 },
      { name: 'DevOps & Testing', weight: 0.10 }
    ],
    milestones: [
      {
        step: '01',
        phase: 'FOUNDATION',
        title: 'Data Structures & Algorithmic Foundations',
        desc: 'Arrays, Hash Maps, Linked Lists, Trees, Graphs, Sorting, and Big-O Analysis.',
        skills: ['Data Structures', 'Algorithms', 'Big-O', 'Git'],
        why: 'Algorithmic efficiency is the primary gateway in coding rounds.',
        action: 'Solve 30 core algorithmic problems covering Trees and Dynamic Programming.',
        duration: '2 Weeks'
      },
      {
        step: '02',
        phase: 'SOFTWARE DESIGN',
        title: 'Object-Oriented Design & Clean Code',
        desc: 'SOLID principles, design patterns (Factory, Singleton, Observer), and unit testing.',
        skills: ['OOP Principles', 'Design Patterns', 'Unit Testing', 'Clean Architecture'],
        why: 'Production maintainability requires structured, testable software design.',
        action: 'Refactor a monolithic script into clean, pattern-oriented classes with unit tests.',
        duration: '2 Weeks'
      },
      {
        step: '03',
        phase: 'SYSTEM SCALABILITY',
        title: 'System Design & Distributed Fundamentals',
        desc: 'Client-server architecture, load balancing, caching strategies, and database replication.',
        skills: ['System Design', 'Caching (Redis)', 'Load Balancers', 'Replication'],
        why: 'Demonstrates understanding of high-availability, fault-tolerant engineering.',
        action: 'Diagram and document an architectural blueprint for a high-traffic service.',
        duration: '2 Weeks'
      },
      {
        step: '04',
        phase: 'PLACEMENT READINESS',
        title: 'Full-Loop Technical Mock Interviews',
        desc: 'Simulate live coding, system design whiteboard, and behavioral leadership rounds.',
        skills: ['Live Coding', 'System Design', 'Behavioral (STAR)', 'Offer Strategy'],
        why: 'Practicing under time pressure builds confidence and clear problem articulation.',
        action: 'Complete 3 comprehensive AI mock interview loops.',
        duration: '1 Week'
      }
    ],
    recommendedProject: {
      title: 'Distributed Real-Time Collaborative Canvas',
      skills: ['TypeScript / Java', 'WebSockets', 'PostgreSQL', 'Redis', 'Docker'],
      why: 'Proves mastery of real-time communication, concurrency, and persistent state management.',
      time: '16 Hours'
    }
  }
};

/**
 * Heuristically detects the user's primary career domain based on target role,
 * job title context, and extracted skills.
 */
export function detectCareerDomain({ targetRole = '', userSkills = [], experienceText = '' }) {
  const roleStr = String(targetRole || '').toLowerCase();
  const textContext = `${roleStr} ${experienceText}`.toLowerCase();
  const skillsLower = userSkills.map(s => String(s).toLowerCase());

  // 1. Direct Target Role Match
  if (roleStr.includes('hr') || roleStr.includes('human resource') || roleStr.includes('recruit') || roleStr.includes('talent') || roleStr.includes('people ops')) {
    return 'Human Resources';
  }
  if (roleStr.includes('market') || roleStr.includes('seo') || roleStr.includes('social media') || roleStr.includes('content') || roleStr.includes('growth')) {
    return 'Marketing';
  }
  if (roleStr.includes('business anal') || roleStr.includes('product anal') || roleStr.includes('bi anal') || roleStr.includes('data anal')) {
    return 'Data & Analytics';
  }
  if (roleStr.includes('financ') || roleStr.includes('account') || roleStr.includes('invest') || roleStr.includes('banking') || roleStr.includes('audit')) {
    return 'Finance';
  }
  if (roleStr.includes('business dev') || roleStr.includes('sales') || roleStr.includes('account exec') || roleStr.includes('operations')) {
    return 'Business & Sales';
  }
  if (roleStr.includes('design') || roleStr.includes('ui') || roleStr.includes('ux') || roleStr.includes('graphic')) {
    return 'Design';
  }
  if (roleStr.includes('develop') || roleStr.includes('engineer') || roleStr.includes('software') || roleStr.includes('frontend') || roleStr.includes('backend') || roleStr.includes('full stack') || roleStr.includes('cloud') || roleStr.includes('devops')) {
    return 'Technology';
  }

  // 2. High-Confidence Skill Classification (Avoid generic tools like Excel/PowerPoint)
  const hrKeywords = ['recruitment', 'sourcing', 'hrms', 'talent acquisition', 'employee relations', 'posh', 'payroll', 'job description'];
  const marketingKeywords = ['seo', 'google ads', 'meta ads', 'campaign', 'copywriting', 'content strategy', 'email marketing', 'ga4', 'branding'];
  const financeKeywords = ['financial modeling', 'dcf', 'valuation', 'financial statements', 'ratio analysis', 'balance sheet', 'wacc', 'budgeting'];
  const techKeywords = ['react', 'node', 'javascript', 'python', 'java', 'docker', 'express', 'git', 'c++', 'typescript', 'aws', 'system design'];
  const dataKeywords = ['sql', 'pandas', 'power bi', 'tableau', 'statistics', 'eda', 'data wrangling'];

  const hrScore = hrKeywords.filter(k => skillsLower.some(s => s.includes(k))).length;
  const mktScore = marketingKeywords.filter(k => skillsLower.some(s => s.includes(k))).length;
  const finScore = financeKeywords.filter(k => skillsLower.some(s => s.includes(k))).length;
  const techScore = techKeywords.filter(k => skillsLower.some(s => s.includes(k))).length;
  const dataScore = dataKeywords.filter(k => skillsLower.some(s => s.includes(k))).length;

  if (hrScore >= 2 && hrScore > techScore) return 'Human Resources';
  if (mktScore >= 2 && mktScore > techScore) return 'Marketing';
  if (finScore >= 2 && finScore > techScore) return 'Finance';
  if (dataScore >= 2 && techScore === 0) return 'Data & Analytics';
  if (techScore >= 1) return 'Technology';

  return 'Technology'; // Fallback default
}

/**
 * Computes a completely tailored, domain-aware roadmap.
 */
export function computeCareerRoadmap({
  targetRole = '',
  userSkills = [],
  experienceLevel = 'Fresher',
  atsScore = 80,
  experienceText = ''
}) {
  // Detect domain
  const detectedDomain = detectCareerDomain({ targetRole, userSkills, experienceText });

  // Resolve best matching role in definition list
  let matchedRoleKey = Object.keys(ROLE_DEFINITIONS).find(
    role => role.toLowerCase() === String(targetRole).toLowerCase() || 
            String(targetRole).toLowerCase().includes(role.toLowerCase().split(' ')[0])
  );

  // If no direct role definition match, pick the top role from the detected domain
  if (!matchedRoleKey || !ROLE_DEFINITIONS[matchedRoleKey]) {
    const domainRoles = CAREER_DOMAINS[detectedDomain]?.roles || CAREER_DOMAINS['Technology'].roles;
    matchedRoleKey = domainRoles[0];
  }

  const roleDef = ROLE_DEFINITIONS[matchedRoleKey] || ROLE_DEFINITIONS['Full Stack Developer'];
  const requiredSkills = roleDef.coreSkills;

  // Normalized skill comparison
  const lowerUserSkills = userSkills.map(s => String(s).toLowerCase().trim());
  const strongSkills = [];
  const skillGaps = [];
  const missingSkills = [];

  requiredSkills.forEach(req => {
    const isPresent = lowerUserSkills.some(u => u.includes(req.toLowerCase()) || req.toLowerCase().includes(u));
    if (isPresent) {
      strongSkills.push(req);
    } else if (strongSkills.length < 4 && Math.random() > 0.35) {
      skillGaps.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Ensure reasonable distribution
  if (strongSkills.length === 0 && userSkills.length > 0) {
    strongSkills.push(...userSkills.slice(0, 3));
  }
  if (skillGaps.length === 0) {
    skillGaps.push(requiredSkills[1] || 'Analytics & Metrics', requiredSkills[3] || 'Process Design');
  }

  // Calculate dynamic readiness score
  const skillRatio = Math.min(1, (strongSkills.length / Math.max(1, requiredSkills.length)));
  const baseScore = Math.round(skillRatio * 45 + (atsScore * 0.35) + (experienceLevel !== 'Fresher' ? 15 : 8));
  const overallReadiness = Math.min(95, Math.max(45, baseScore));

  const domainSkillScore = Math.min(96, Math.max(50, Math.round(skillRatio * 60 + 35)));
  const resumeScore = Math.min(100, Math.max(60, atsScore || 85));
  const interviewScore = Math.min(90, Math.max(40, overallReadiness - 10));
  const commScore = Math.min(92, Math.max(60, Math.round(overallReadiness * 0.95 + 6)));

  // Generate milestone progression
  let completedCount = 0;
  const milestones = roleDef.milestones.map((m, idx) => {
    let status = 'locked';
    let progress = 0;
    let score = null;
    let completedDate = null;

    if (idx === 0) {
      status = 'completed';
      progress = 100;
      score = 92;
      completedDate = '12 Aug 2026';
      completedCount++;
    } else if (idx === 1) {
      if (overallReadiness >= 65) {
        status = 'completed';
        progress = 100;
        score = 88;
        completedDate = '16 Aug 2026';
        completedCount++;
      } else {
        status = 'in_progress';
        progress = 68;
      }
    } else if (idx === 2) {
      if (overallReadiness >= 80) {
        status = 'completed';
        progress = 100;
        score = 85;
        completedDate = '18 Aug 2026';
        completedCount++;
      } else if (completedCount >= 1) {
        status = 'in_progress';
        progress = 55;
      } else {
        status = 'up_next';
        progress = 0;
      }
    } else if (idx === 3) {
      status = completedCount >= 2 ? 'in_progress' : 'up_next';
      progress = status === 'in_progress' ? 30 : 0;
    } else if (idx === 4) {
      status = 'up_next';
    } else {
      status = 'final_stage';
    }

    // Determine skill checks
    const skillChecks = m.skills.map(s => {
      const isKnown = strongSkills.some(str => str.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(str.toLowerCase()));
      return {
        name: s,
        completed: isKnown || status === 'completed'
      };
    });

    return {
      ...m,
      status,
      progress,
      score,
      completedDate,
      skillChecks
    };
  });

  // Dynamic Next Best Action tailored to the domain
  const primaryGap = skillGaps[0] || missingSkills[0] || 'Core Competency';
  const nextBestAction = {
    title: `Complete ${primaryGap} Assessment`,
    why: `${primaryGap} is identified as one of your highest-impact skill gaps for the ${matchedRoleKey} career track.`,
    impact: `+${Math.floor(Math.random() * 4 + 6)}% Role Readiness`,
    time: '30 minutes',
    targetSkill: primaryGap
  };

  // Dynamic Role Fit Breakdown based on defined domain dimensions
  const dimensions = roleDef.dimensions || [
    { name: 'Core Domain Knowledge', weight: 0.30 },
    { name: 'Analytical & Technical Fit', weight: 0.25 },
    { name: 'Communication & Stakeholders', weight: 0.25 },
    { name: 'Execution & Tools', weight: 0.20 }
  ];

  const roleFitBreakdown = dimensions.map((dim, idx) => {
    let fitScore = Math.min(95, Math.max(50, Math.round(overallReadiness + (idx % 2 === 0 ? 8 : -6))));
    if (idx === 0) fitScore = Math.min(96, domainSkillScore + 5);
    return {
      name: dim.name,
      score: fitScore
    };
  });

  const roleFit = {
    matchPercentage: Math.round((strongSkills.length / Math.max(1, requiredSkills.length)) * 40 + (resumeScore * 0.5)),
    dimensions: roleFitBreakdown,
    summary: strongSkills.length >= 3 
      ? `Your ${strongSkills.slice(0, 2).join(' & ')} competency is strong. Closing ${primaryGap} will unlock placement readiness.`
      : `Solid foundation. Accelerating ${primaryGap} and portfolio evidence is your quickest route to market readiness.`
  };

  return {
    careerDomain: detectedDomain,
    targetRole: matchedRoleKey,
    category: roleDef.category,
    experienceLevel,
    resumeScore,
    overallReadiness,
    metrics: [
      { label: 'Overall Readiness', score: overallReadiness, status: overallReadiness >= 75 ? 'Advanced Track' : 'On Track', detail: '8–10 weeks to full placement readiness' },
      { label: roleDef.domain === 'Technology' ? 'Technical Skills' : 'Domain Competencies', score: domainSkillScore, status: 'Strong Foundation', detail: `${skillGaps.length + missingSkills.length} skill gaps remaining` },
      { label: 'Resume / ATS', score: resumeScore, status: 'ATS Verified', detail: 'Matches core role keywords' },
      { label: 'Interview Readiness', score: interviewScore, status: 'In Progress', detail: 'Mock evaluations active' },
      { label: 'Communication', score: commScore, status: 'Good Pace', detail: 'STAR framework recommended' }
    ],
    milestones,
    completedCount,
    totalMilestones: milestones.length,
    progressPercentage: Math.round((completedCount / milestones.length) * 100),
    strongSkills,
    skillGaps,
    missingSkills,
    nextBestAction,
    roleFit,
    recommendedProject: roleDef.recommendedProject
  };
}
