import { generateDomainModules } from './curriculumFactory';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const createHRCourse = ({
  id,
  title,
  subcategory,
  level = "Intermediate",
  duration = "6 Weeks",
  estimatedHours = "18 Hours",
  priority = "STANDARD",
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact
}) => ({
  id,
  title,
  category: "Human Resources",
  subcategory,
  level,
  duration,
  estimatedHours,
  priority,
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact: careerImpact || { readinessBoost: "+10%", skillCoverageBoost: "+15%" },
  passingScore: 70,
  modules: generateDomainModules(id, title, "Human Resources", subcategory),
  finalAssessment: {
    id: `${id}-final`,
    title: `${title} — Final Comprehensive Exam`,
    type: "FINAL_ASSESSMENT",
    duration: "30 min",
    passingScore: 70,
    description: `Demonstrate complete conceptual, legal, and operational mastery of ${title}.`,
    questions: generateFinalAssessmentQuestions(id, title, "Human Resources")
  },
  capstoneProject: {
    id: `${id}-proj`,
    title: `${title} — Strategic People Operations Capstone`,
    description: `Design and deliver an end-to-end strategic HR initiative applying all principles mastered in ${title}.`,
    requirements: [
      "Develop competency-based role descriptions and structured candidate scoring rubrics",
      "Author an interactive 30-60-90 day employee onboarding journey map",
      "Construct a workforce retention analytics model with eNPS action plans"
    ],
    timeHours: "12 Hours",
    status: "Not Started"
  }
});

export const hrCourses = [
  createHRCourse({
    id: "hr-101",
    title: "Strategic HR Management & People Analytics",
    subcategory: "Strategic HR",
    level: "Intermediate",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Master full-lifecycle employee management, talent acquisition pipelines, POSH compliance, HRMS systems, and data-driven attrition modeling.",
    skillsGained: ["Recruitment", "HR Analytics", "HRMS Software", "Employee Relations", "Workplace Compliance", "Talent Acquisition"],
    careerRoles: ["HR Executive", "Talent Acquisition Specialist", "HR Analyst", "People Operations"],
    whyRecommended: "Core competencies for Human Resources and Talent Acquisition career pathways."
  }),
  createHRCourse({
    id: "hr-102",
    title: "Human Resource Management Fundamentals",
    subcategory: "HR Primitives",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Understand the core functions of human resource management: job analysis, recruitment, compensation, performance appraisals, workplace safety, and labor relations.",
    skillsGained: ["HR Management", "Job Analysis", "Job Descriptions", "Labor Relations", "HR Operations"],
    careerRoles: ["HR Assistant", "HR Generalist", "People Operations Associate"],
    whyRecommended: "Foundational course covering the complete corporate HR lifecycle and governance."
  }),
  createHRCourse({
    id: "hr-103",
    title: "Talent Acquisition Fundamentals & Sourcing Channels",
    subcategory: "Recruitment",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Explore recruitment sourcing channels: job boards, campus hiring, employee referral programs, recruitment agencies, and recruitment marketing.",
    skillsGained: ["Talent Sourcing", "Job Boards", "Employee Referrals", "Campus Hiring", "Recruitment Marketing"],
    careerRoles: ["Talent Acquisition Specialist", "Recruiter", "Sourcer"],
    whyRecommended: "Learn to build multi-channel inbound and outbound candidate sourcing funnels."
  }),
  createHRCourse({
    id: "hr-104",
    title: "LinkedIn Recruitment Strategies & Boolean Search",
    subcategory: "Recruitment",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master advanced candidate sourcing on LinkedIn: Boolean search syntax, LinkedIn Recruiter filters, InMail copywriting, and talent pipelining.",
    skillsGained: ["LinkedIn Recruiter", "Boolean Search", "InMail Copywriting", "Passive Talent Sourcing", "Talent Pipelining"],
    careerRoles: ["Technical Recruiter", "Senior Talent Acquisition Specialist", "Executive Sourcer"],
    whyRecommended: "LinkedIn is the dominant professional network for recruiting high-demand passive talent."
  }),
  createHRCourse({
    id: "hr-105",
    title: "Structured Interviewing & Candidate Assessment (STAR)",
    subcategory: "Interviewing",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master competency-based interviewing: STAR methodology (Situation, Task, Action, Result), eliminating interviewer bias, scoring rubrics, and work sample tests.",
    skillsGained: ["Structured Interviewing", "STAR Method", "Behavioral Interviewing", "Scoring Rubrics", "Unconscious Bias Mitigation"],
    careerRoles: ["Talent Acquisition Specialist", "HRBP", "Hiring Manager"],
    whyRecommended: "Structured interviews are 2.5x more predictive of candidate performance than unstructured conversations."
  }),
  createHRCourse({
    id: "hr-106",
    title: "Employer Branding & Recruitment Marketing",
    subcategory: "Employer Brand",
    level: "Intermediate",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Build an attractive talent brand: Employee Value Proposition (EVP), Glassdoor/LinkedIn reputation management, careers page optimization, and candidate experience audits.",
    skillsGained: ["Employer Branding", "EVP Development", "Candidate Experience", "Reputation Management", "Recruitment Marketing"],
    careerRoles: ["Employer Brand Manager", "Talent Acquisition Lead", "HR Communications Specialist"],
    whyRecommended: "Strong employer branding attracts top inbound talent and lowers corporate agency spend."
  }),
  createHRCourse({
    id: "hr-107",
    title: "Employee Onboarding & 30-60-90 Day Experience",
    subcategory: "Employee Lifecycle",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Design structured employee onboarding workflows: pre-boarding communication, Day 1 orientation, buddy systems, 30-60-90 day milestone check-ins, and probation review frameworks.",
    skillsGained: ["Employee Onboarding", "30-60-90 Day Plan", "Pre-boarding", "Buddy Programs", "Retention Strategies"],
    careerRoles: ["HR Generalist", "People Operations Associate", "HR Manager"],
    whyRecommended: "Effective onboarding improves new hire 3-year retention rates by 69%."
  }),
  createHRCourse({
    id: "hr-108",
    title: "Performance Management & OKR Goal Setting",
    subcategory: "Performance",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Design modern continuous performance management systems: OKRs (Objectives & Key Results), SMART goals, 360-degree feedback, performance calibration meetings, and PIPs.",
    skillsGained: ["Performance Management", "OKRs", "SMART Goals", "360-Degree Feedback", "Performance Calibration", "PIPs"],
    careerRoles: ["HRBP", "People Operations Manager", "HR Generalist"],
    whyRecommended: "Shifting from annual appraisal reviews to continuous agile feedback cycles drives business execution."
  }),
  createHRCourse({
    id: "hr-109",
    title: "Learning & Development (L&D) Program Architecture",
    subcategory: "L&D",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Design corporate training ecosystems: Training Needs Analysis (TNA), Kirkpatrick 4-Level Training Evaluation Model, LMS platforms, career progression ladders, and leadership development.",
    skillsGained: ["Learning & Development", "Training Needs Analysis (TNA)", "Kirkpatrick Model", "Career Ladders", "LMS Administration", "Upskilling"],
    careerRoles: ["L&D Manager", "Corporate Trainer", "Talent Development Specialist"],
    whyRecommended: "Continuous internal upskilling is the most cost-effective way to close critical skill gaps."
  }),
  createHRCourse({
    id: "hr-110",
    title: "Compensation, Benefits & Total Rewards Strategy",
    subcategory: "Compensation",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Design competitive compensation structures: salary benchmarking, salary bands (min, mid, max), compa-ratio analysis, ESOPs and equity compensation, annual merit cycles, and statutory benefits.",
    skillsGained: ["Compensation & Benefits", "Compa-Ratio", "Salary Banding", "Total Rewards", "ESOPs / Equity", "Merit Cycles"],
    careerRoles: ["Compensation Analyst", "Total Rewards Manager", "HRBP"],
    whyRecommended: "Mastery of salary benchmarking and compa-ratios prevents salary compression and employee turnover."
  }),
  createHRCourse({
    id: "hr-111",
    title: "HR Analytics Fundamentals & Headcount Modeling",
    subcategory: "HR Analytics",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Analyze workforce data: calculating Turnover / Attrition Rate, Time-to-Fill, Cost-per-Hire, Revenue-per-Employee, Headcount forecasting in Excel, and executive HR dashboard design.",
    skillsGained: ["HR Analytics", "Headcount Modeling", "Attrition Rate", "Excel for HR", "Workforce Planning", "HR Metrics"],
    careerRoles: ["HR Analyst", "People Analytics Specialist", "HR Operations Lead"],
    whyRecommended: "Data-driven HR professionals influence executive boardroom decisions using quantitative workforce models."
  }),
  createHRCourse({
    id: "hr-112",
    title: "Employee Engagement, Culture & Retention Strategies",
    subcategory: "Employee Engagement",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Build high-retention corporate cultures: eNPS pulse surveys, drivers of employee burnout, recognition programs, stay interviews, and psychological safety.",
    skillsGained: ["Employee Engagement", "eNPS Surveys", "Retention Strategies", "Stay Interviews", "Psychological Safety", "Culture"],
    careerRoles: ["Employee Experience Manager", "Culture Specialist", "HRBP"],
    whyRecommended: "Engaged teams produce 21% higher profitability and 59% lower voluntary turnover."
  }),
  createHRCourse({
    id: "hr-113",
    title: "HR Compliance, Labor Laws & Workplace POSH",
    subcategory: "Compliance",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Navigate employment legal standards: POSH (Prevention of Sexual Harassment) Act compliance, Internal Complaints Committee (ICC) protocols, labor codes, and statutory audits.",
    skillsGained: ["HR Compliance", "POSH Act", "Labor Laws", "Internal Complaints Committee (ICC)", "Workplace Ethics", "Statutory Compliance"],
    careerRoles: ["HR Compliance Officer", "HR Generalist", "HR Operations Lead"],
    whyRecommended: "Essential compliance knowledge safeguarding organizations from legal liability and ethical breaches."
  }),
  createHRCourse({
    id: "hr-114",
    title: "Strategic Human Resource Management (SHRM)",
    subcategory: "Strategic HR",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    description: "Align human capital with corporate strategy: Ulrich HR Business Partner model, workforce succession planning, mergers & acquisitions HR integration, and change management.",
    skillsGained: ["Strategic HR", "Ulrich HR Model", "Succession Planning", "Change Management", "HR Business Partnering", "M&A HR Integration"],
    careerRoles: ["Chief People Officer (CPO)", "VP of Human Resources", "Senior HR Business Partner"],
    whyRecommended: "Prepares senior HR professionals for executive leadership and strategic workforce transformations."
  }),
  createHRCourse({
    id: "hr-115",
    title: "People Analytics & Data-Driven HR Modeling",
    subcategory: "People Analytics",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "26 Hours",
    description: "Advanced quantitative workforce analytics: Predictive Attrition modeling with Python/Logistic Regression, Organizational Network Analysis (ONA), Employee Lifetime Value, and pay equity regressions.",
    skillsGained: ["People Analytics", "Predictive Attrition", "Python for HR", "Organizational Network Analysis", "Pay Equity Analysis", "ELTV"],
    careerRoles: ["Head of People Analytics", "Senior HR Analyst", "Workforce Strategy Consultant"],
    whyRecommended: "Advanced predictive data science applied to human capital decision-making and retention modeling."
  })
];
