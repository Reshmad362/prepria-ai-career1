import { createLesson, createModule } from './courseBuilder';

const generateCheckpointQuestions = (courseId, mIdx, mTemplate, domain, topics) => {
  const t = topics || [];
  const mTitle = mTemplate.title;
  const qPrefix = `q-${courseId}-m${mIdx + 1}`;

  return [
    {
      id: `${qPrefix}-1`,
      question: `What is the primary benefit of mastering ${mTitle} in ${domain}?`,
      options: [
        "It establishes scalable, repeatable, and verified best practices.",
        "It removes the need for quality assurance and testing.",
        "It replaces core foundational domain concepts.",
        "It disables logging and compliance requirements."
      ],
      correctIndex: 0,
      explanation: `Mastering ${mTitle} provides structured, verified methods for achieving high-performance results.`
    },
    {
      id: `${qPrefix}-2`,
      question: `How should teams validate implementations of ${mTitle}?`,
      options: [
        "By assuming success without monitoring.",
        "By deploying straight to production without peer review.",
        "By running automated tests, measuring key metrics, and validating against business objectives.",
        "By ignoring edge cases."
      ],
      correctIndex: 2,
      explanation: "Continuous verification, metric tracking, and testing ensure production reliability and prevent regressions."
    },
    {
      id: `${qPrefix}-3`,
      question: `Which of the following is a common mistake when working with ${t[0] || mTitle}?`,
      options: [
        "Following the official documentation step by step.",
        "Skipping prerequisite validation and environment dependency checks.",
        "Writing comprehensive unit tests before deployment.",
        "Conducting thorough code reviews with team members."
      ],
      correctIndex: 1,
      explanation: "Skipping validation steps leads to unreliable deployments and hard-to-debug production failures."
    },
    {
      id: `${qPrefix}-4`,
      question: `What is the recommended approach when implementing ${t[1] || 'key concepts'} in a production environment?`,
      options: [
        "Deploy directly to production without any staging environment testing.",
        "Disable all monitoring to reduce overhead costs.",
        "Use only manual processes and avoid any automation.",
        "Test in an isolated staging environment, monitor metrics, then promote to production."
      ],
      correctIndex: 3,
      explanation: "Staging environment testing with monitoring ensures reliability before production promotion."
    },
    {
      id: `${qPrefix}-5`,
      question: `Why is documentation important when implementing ${mTitle}?`,
      options: [
        "It ensures knowledge transfer, reduces onboarding time, and creates reproducible procedures.",
        "Documentation is never needed for professional workflows.",
        "It helps marketing teams write blog posts about the product.",
        "It is only required by external auditors and has no internal value."
      ],
      correctIndex: 0,
      explanation: "Documentation enables knowledge transfer, reduces bus-factor risk, and ensures operational consistency."
    },
    {
      id: `${qPrefix}-6`,
      question: `When troubleshooting issues related to ${t[2] || mTitle}, what should be the first step?`,
      options: [
        "Immediately restart all services without investigation.",
        "Delete the entire configuration and start from scratch.",
        "Ignore the issue and wait for it to resolve itself.",
        "Check logs, review recent changes, and reproduce the issue in a safe environment."
      ],
      correctIndex: 3,
      explanation: "Systematic troubleshooting with log analysis and change review prevents destructive guesswork."
    },
    {
      id: `${qPrefix}-7`,
      question: `What role does continuous improvement play in ${domain} workflows related to ${mTitle}?`,
      options: [
        "It is unnecessary once a system is deployed to production.",
        "It ensures systems evolve with changing requirements, security patches, and performance optimizations.",
        "It only applies during the initial development phase.",
        "It is exclusively the responsibility of management, not engineers."
      ],
      correctIndex: 1,
      explanation: "Continuous improvement ensures systems remain secure, performant, and aligned with evolving business needs."
    }
  ];
};

/**
 * Domain-specific module definitions for all 6 categories,
 * guaranteeing 7 to 12 structured modules per course, 3–6 lessons per module.
 */

export const generateDomainModules = (courseId, courseTitle, domain, subcategory) => {
  const isDevOps = domain === "DevOps & Cloud";
  const isFrontend = domain === "Frontend Engineering";
  const isBackend = domain === "Backend Engineering";
  const isHR = domain === "Human Resources";
  const isMarketing = domain === "Marketing";
  const isData = domain === "Data & Analytics";

  let moduleTemplates = [];

  if (isDevOps) {
    moduleTemplates = [
      {
        title: "1. Cloud Architecture & Infrastructure Primitives",
        description: "Cloud service models, Linux virtualization, networking topologies, and security boundaries.",
        topics: ["Cloud Service Models (IaaS, PaaS, Serverless)", "Linux Namespaces & Process Scheduling", "VPC Networking & Subnetting", "IAM Least Privilege & Security Policies"]
      },
      {
        title: "2. Source Control, Trunk-Based Git & Collaboration",
        description: "Branching strategies, Git hooks, conventional commits, and automated pull request workflows.",
        topics: ["Trunk-Based Development vs GitFlow", "Interactive Rebasing & Conflict Resolution", "Pre-Commit Hooks & Linting in CI", "GitHub Branch Protection Rules"]
      },
      {
        title: "3. Containerization & Multi-Stage Image Builds",
        description: "Docker internals, multi-stage compilation, Distroless images, and image security.",
        topics: ["Linux cgroups & Memory Isolation", "Optimizing Layer Caching in Dockerfiles", "Multi-Stage Builds & Distroless Runtimes", "Container Vulnerability Scanning with Trivy"]
      },
      {
        title: "4. Continuous Integration & Test Automation",
        description: "CI runners, matrix testing, artifact caching, and automated test reports.",
        topics: ["CI Pipeline Triggering & Event Pipelines", "Dependency Caching & Performance Acceleration", "Unit & Integration Test Execution", "Publishing Container Images to ECR/GHCR"]
      },
      {
        title: "5. Continuous Delivery & Zero-Downtime Deployments",
        description: "Blue-Green deployments, Canary traffic shifting, and Application Load Balancer target groups.",
        topics: ["Blue-Green vs Rolling vs Canary Strategies", "Traffic Shifting Algorithms & Health Checks", "Automated Rollback on Error Rate Spikes", "Managing Environment Configuration & Secrets"]
      },
      {
        title: "6. Infrastructure as Code (IaC) & Cloud Automation",
        description: "Declarative infrastructure, Terraform state locking, AWS CDK, and drift detection.",
        topics: ["Declarative IaC vs Imperative Scripts", "Remote State Storage & Mutex Locking in S3/DynamoDB", "Modular Reusable Infrastructure Components", "Automated Drift Detection & Remediation"]
      },
      {
        title: "7. Observability, Logging & SRE Metrics",
        description: "Prometheus metrics, Grafana dashboards, centralized logging, and SLO error budgets.",
        topics: ["The Three Pillars of Observability (Metrics, Logs, Traces)", "PromQL Queries & Real-Time Alertmanager Triggers", "Distributed Tracing with OpenTelemetry", "SRE Error Budgets & Blameless Post-Mortems"]
      },
      {
        title: "8. Enterprise Production Capstone & Architecture",
        description: "End-to-end resilient cloud architecture deployment with automated rollback and monitoring.",
        topics: ["Capstone Architecture Specification", "Deploying the Multi-Tier Cloud System", "Executing Chaos Latency Tests & Validating Resilience"]
      }
    ];
  } else if (isFrontend) {
    moduleTemplates = [
      {
        title: "1. Web Standards, Semantic HTML5 & Modern Layouts",
        description: "Semantic hierarchy, CSS Grid, Flexbox, and responsive mobile-first architecture.",
        topics: ["Semantic HTML5 & Accessibility Trees", "CSS Grid 2D Matrices vs Flexbox 1D Flow", "CSS Custom Properties & Dynamic Theming", "Fluid Typography & Responsive Breakpoints"]
      },
      {
        title: "2. Modern JavaScript ES6+ & Asynchronous Mechanics",
        description: "Event Loop, microtasks vs macrotasks, Promises, async/await, and closures.",
        topics: ["Event Loop, Microtasks & Call Stack Ordering", "Promises, Async/Await & Error Boundaries", "Closures, Lexical Scope & Memoization", "Modern Array Pipelines (map, filter, reduce)"]
      },
      {
        title: "3. Component Architecture & React Primitives",
        description: "JSX, Virtual DOM diffing, props vs state, and React component lifecycles.",
        topics: ["Virtual DOM Reconciliation & Fiber Trees", "State Immutability & Pure Functions", "Custom Hooks for Logic Reuse", "Controlled vs Uncontrolled Forms"]
      },
      {
        title: "4. State Management & Server Cache Synchronization",
        description: "Atomic global state (Zustand), Redux Toolkit, and asynchronous server caching.",
        topics: ["Context API Bottlenecks & Selector Subscriptions", "Atomic Stores with Zustand", "Redux Toolkit Slices & Thunks", "TanStack Query Cache Invalidation"]
      },
      {
        title: "5. Type Safety with TypeScript in UI Applications",
        description: "Generics, Discriminated Unions, utility types, and typing React component props.",
        topics: ["Generics in Reusable UI Components", "Discriminated Unions for UI State Modeling", "Utility Types (Partial, Pick, Omit, Record)", "Strict TypeScript Compiler Configurations"]
      },
      {
        title: "6. Performance Optimization & Core Web Vitals",
        description: "LCP, INP, CLS optimization, bundle code splitting, and memory profiling.",
        topics: ["Taming Core Web Vitals (LCP, INP, CLS)", "Route & Component Code Splitting with React.lazy", "Optimizing Interaction to Next Paint (INP)", "Chrome DevTools Flame Graphs & Memory Leaks"]
      },
      {
        title: "7. Automated UI Testing & Accessibility (a11y)",
        description: "Jest, React Testing Library, Mock Service Worker (MSW), and WCAG 2.2 AA standards.",
        topics: ["Testing User Interactions with React Testing Library", "Mock Service Worker (MSW) Network Mocking", "Keyboard Navigation & Focus Traps in Modals", "Automated Accessibility Audits with axe-core"]
      },
      {
        title: "8. Enterprise Next.js App Router Capstone",
        description: "Server Components, Server Actions, parallel routes, and full production deployment.",
        topics: ["React Server Components vs Client Boundaries", "Type-Safe Server Actions & Mutations", "Deploying Enterprise Dashboard Capstone"]
      }
    ];
  } else if (isBackend) {
    moduleTemplates = [
      {
        title: "1. Backend Primitives & Asynchronous Node.js",
        description: "Client-server protocol, HTTP/1.1 vs HTTP/2, libuv event loop phases, and Streams.",
        topics: ["HTTP Methods, Status Codes & Idempotency", "libuv Event Loop Phases (Timers, Poll, Check)", "Buffer & Stream Pipelines with Backpressure", "Worker Threads for CPU-Intensive Workloads"]
      },
      {
        title: "2. Modular REST API Architecture & Validation",
        description: "Controller-Service-Repository pattern, middleware chains, and Zod schema validation.",
        topics: ["Layered Controller-Service-Repository Architecture", "Express & Fastify Middleware Chains", "Request Validation with Zod Schemas", "Centralized 4-Parameter Error Handling"]
      },
      {
        title: "3. Database Architecture & Relational PostgreSQL",
        description: "ACID transactions, relational normalization (3NF), row-level locks, and Prisma ORM.",
        topics: ["ACID Guarantees & Transaction Isolation Levels", "Row-Level Locking (SELECT FOR UPDATE)", "Prisma Schema Modeling & Migrations", "JSONB Columns & GIN Indexing"]
      },
      {
        title: "4. SQL Query Optimization & Performance Tuning",
        description: "EXPLAIN ANALYZE, B-Tree indexes, composite leftmost prefix rules, and N+1 query elimination.",
        topics: ["Reading Query Plans with EXPLAIN ANALYZE", "B-Tree Indexes & Covering Index Only Scans", "The Leftmost Prefix Rule in Composite Indexes", "Eliminating the N+1 Query Bottleneck"]
      },
      {
        title: "5. Authentication, JWT & OAuth2 Security",
        description: "Argon2 password hashing, short-lived JWTs, HttpOnly cookies, and RBAC authorization.",
        topics: ["Argon2 / Bcrypt Password Hashing Best Practices", "Access Tokens vs HttpOnly Refresh Tokens", "Preventing XSS & CSRF Vulnerabilities", "Role-Based Access Control (RBAC) Middleware"]
      },
      {
        title: "6. In-Memory Caching & Distributed Locks (Redis)",
        description: "Cache-Aside pattern, TTL expiration, cache stampede prevention, and Redlock.",
        topics: ["Cache-Aside, Write-Through & Write-Back Patterns", "Solving the Cache Stampede (Thundering Herd)", "Redis Sorted Sets for Real-Time Leaderboards", "Atomic Distributed Locks with Redlock"]
      },
      {
        title: "7. Event-Driven Architecture & Message Queues",
        description: "RabbitMQ AMQP exchanges, Apache Kafka partitioned commit logs, and Dead Letter Queues.",
        topics: ["Message Brokers vs Event Streaming Platforms", "Kafka Partitions, Consumer Groups & Offsets", "Designing Idempotent Message Consumers", "Dead Letter Queues (DLQ) & Retry Backoff"]
      },
      {
        title: "8. Scalable Microservices System Design Capstone",
        description: "Consistent Hashing, CAP theorem, database sharding, and high-throughput API gateway.",
        topics: ["CAP Theorem & Database Sharding Strategies", "Consistent Hashing in Distributed Clusters", "Deploying the Scalable Backend Capstone"]
      }
    ];
  } else if (isHR) {
    moduleTemplates = [
      {
        title: "1. Strategic HRM & Job Architecture",
        description: "Aligning human capital with business strategy, job analyses, and competency frameworks.",
        topics: ["Strategic Role of HR in Modern Enterprises", "Conducting Comprehensive Job Analyses", "Writing Competency-Based Job Descriptions", "Establishing Organizational Job Grading Levels"]
      },
      {
        title: "2. Talent Acquisition & Multi-Channel Sourcing",
        description: "Proactive candidate pipelines, employee referral programs, and channel yield analysis.",
        topics: ["Outbound Talent Sourcing vs Reactive Job Posts", "High-Converting Employee Referral Programs", "Recruitment Channel Yield Ratios & Cost-Per-Hire", "Campus & Graduate Hiring Strategies"]
      },
      {
        title: "3. LinkedIn Recruiter & Boolean Sourcing Mastery",
        description: "Boolean search operators (AND/OR/NOT), InMail copywriting, and passive talent engagement.",
        topics: ["Complex Boolean Search String Construction", "Authoring High-Converting InMail Outreach", "Filtering Passive Candidate Talent Pools", "Candidate Pipeline Nurturing in ATS"]
      },
      {
        title: "4. Structured Interviewing & Candidate Assessment",
        description: "Competency-based behavioral interviews (STAR), scoring rubrics, and mitigating cognitive bias.",
        topics: ["The STAR Methodology (Situation, Task, Action, Result)", "Standardized 5-Point Scoring Rubrics", "Mitigating Interviewer Bias (Halo Effect, Similarity Bias)", "Designing Validated Work Sample Tests"]
      },
      {
        title: "5. Employee Onboarding & 30-60-90 Day Success",
        description: "Pre-boarding workflows, Day 1 orientations, buddy programs, and probation milestones.",
        topics: ["Pre-Boarding Engagement & Paperwork Automation", "Structuring 30-60-90 Day Milestone Check-Ins", "The Onboarding Buddy System for Cultural Integration", "Probation Review Scorecards & Governance"]
      },
      {
        title: "6. Performance Management & OKR Goal Setting",
        description: "Continuous feedback cycles, OKRs, 360-degree reviews, and calibration sessions.",
        topics: ["Cascading OKRs from Executive to Department Levels", "Conducting Fair Performance Calibration Sessions", "Continuous 360-Degree Feedback Reviews", "Structuring Legal Performance Improvement Plans (PIPs)"]
      },
      {
        title: "7. Compensation, Benefits & HR Compliance",
        description: "Salary benchmarking, compa-ratios, total rewards, POSH Act compliance, and labor laws.",
        topics: ["Designing Salary Bands & Calculating Compa-Ratios", "Total Rewards, Equity (ESOPs) & Merit Matrices", "Workplace POSH Compliance & ICC Investigation Protocols", "Statutory Labor Records & Regulatory Audits"]
      },
      {
        title: "8. People Analytics & Retention Modeling Capstone",
        description: "Calculating annualized attrition rates, eNPS pulse surveys, and executive HR dashboards.",
        topics: ["Annualized Voluntary vs Involuntary Attrition Rates", "eNPS Sentiment Analysis & Stay Interviews", "Executive People Analytics Capstone Dashboard"]
      }
    ];
  } else if (isMarketing) {
    moduleTemplates = [
      {
        title: "1. Strategic Marketing & Value Proposition Design",
        description: "4Ps marketing mix, STP segmentation, Value Proposition Canvas, and buyer personas.",
        topics: ["The 4Ps Marketing Mix Framework", "Segmentation, Targeting & Positioning (STP)", "Value Proposition Canvas (Pain Relievers & Gains)", "Constructing Quantitative Buyer Personas"]
      },
      {
        title: "2. Consumer Behaviour & Persuasion Psychology",
        description: "Cialdini's 6 principles of influence, loss aversion, price anchoring, and decision journeys.",
        topics: ["System 1 vs System 2 Thinking in Buying Decisions", "Cialdini's 6 Principles of Influence", "Loss Aversion & Price Anchoring Strategies", "Mapping the 5-Stage Consumer Decision Journey"]
      },
      {
        title: "3. Content Marketing & Inbound Lead Generation",
        description: "Pillar-and-cluster content architecture, PAS copywriting formulas, and lead magnets.",
        topics: ["Pillar-and-Cluster Subject Authority Architecture", "Problem-Agitate-Solution (PAS) Copywriting", "High-Converting Lead Magnets & Opt-in Forms", "Content Distribution Across Channels"]
      },
      {
        title: "4. Search Engine Optimization (SEO) Masterclass",
        description: "On-page search intent, technical crawl optimization, schema markup, and link building.",
        topics: ["Search Intent Classification (Informational vs Transactional)", "Technical SEO, Canonicalization & robots.txt", "Structured Data with JSON-LD Schema Markup", "Off-Page Digital PR & High-Authority Backlinks"]
      },
      {
        title: "5. Search Engine Marketing (Google Ads & PPC)",
        description: "Ad Rank formula, Quality Score optimization, keyword match types, and smart bidding.",
        topics: ["The Ad Rank Formula & Maximizing Quality Score", "Exact, Phrase & Broad Keyword Match Types", "Negative Keyword Architecture to Eliminate Waste", "Target CPA & Target ROAS Bidding Strategies"]
      },
      {
        title: "6. Performance Marketing & Paid Social (Meta Ads)",
        description: "Meta Conversions API (CAPI), Advantage+ campaigns, lookalike audiences, and creative testing.",
        topics: ["Server-Side Tracking with Meta Conversions API (CAPI)", "Advantage+ Prospecting & Lookalike Audiences", "Diagnosing & Overcoming Creative Ad Fatigue", "Structuring Scalable Paid Social Funnels"]
      },
      {
        title: "7. Marketing Analytics, Attribution & GA4",
        description: "Google Analytics 4 event data model, GTM triggers, and multi-touch attribution.",
        topics: ["GA4 Event-Based Tracking & Parameter Models", "Google Tag Manager (GTM) Custom Triggers", "First Touch vs Last Touch vs Data-Driven Attribution", "Building Funnel Exploration Drop-Off Reports"]
      },
      {
        title: "8. Omnichannel Go-To-Market Growth Capstone",
        description: "Self-reinforcing growth loops, Media Mix Modeling (MMM), and annual campaign orchestration.",
        topics: ["Growth Loops vs Traditional Linear Funnels", "Media Mix Modeling (MMM) Budget Allocation", "Executing the Integrated GTM Launch Capstone"]
      }
    ];
  } else {
    // Data & Analytics
    moduleTemplates = [
      {
        title: "1. Data Literacy, Lifecycle & Business Metrics",
        description: "Descriptive vs diagnostic vs predictive analytics, data types, and data governance.",
        topics: ["The 4 Types of Analytics (Descriptive to Prescriptive)", "Structured vs Unstructured Data Governance", "Data Quality Audits & Access Control Policies", "Translating Business Questions into Analytical Queries"]
      },
      {
        title: "2. Advanced Excel for Business Analytics",
        description: "XLOOKUP, dynamic arrays, Power Query automated ETL, Pivot Tables, and What-If analysis.",
        topics: ["XLOOKUP vs Legacy VLOOKUP Lookups", "Automated Data Cleaning with Power Query M", "Multi-Metric Pivot Tables & Slicers", "What-If Analysis: Goal Seek & Scenario Manager"]
      },
      {
        title: "3. SQL Fundamentals & Relational Querying",
        description: "SELECT, WHERE, GROUP BY, HAVING, INNER/LEFT joins, and subquery aggregations.",
        topics: ["Relational Database Joins (INNER, LEFT, FULL)", "WHERE vs HAVING Filtering Mechanics", "Aggregate Calculations (SUM, AVG, COUNT, ROUND)", "Subqueries & Correlated Subqueries"]
      },
      {
        title: "4. Advanced SQL Analytics & Window Functions",
        description: "ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG, CTEs, and cohort retention queries.",
        topics: ["Row-Level Window Functions (ROW_NUMBER vs RANK)", "LEAD and LAG for Time-Series Comparisons", "Common Table Expressions (CTEs) for Modular SQL", "Calculating Customer Cohort Retention Rates in SQL"]
      },
      {
        title: "5. Python for Data Analysis (NumPy & Pandas)",
        description: "DataFrames, vectorization, loc/iloc indexing, missing data imputation, and groupby.",
        topics: ["Vectorized Operations vs Slow Python Loops", "DataFrame Indexing: loc vs iloc", "Split-Apply-Combine with df.groupby()", "Data Cleaning, Outlier Detection & IQR Bounds"]
      },
      {
        title: "6. Statistical Inference & A/B Testing Mathematics",
        description: "Normal distributions, Central Limit Theorem, hypothesis testing (z-scores, p-values), and t-tests.",
        topics: ["Descriptive Statistics & Skewed Distributions", "The Central Limit Theorem in Sample Sizing", "Hypothesis Testing, Alpha & p-value Interpretation", "Calculating A/B Test Statistical Significance"]
      },
      {
        title: "7. Business Intelligence & Power BI / Tableau",
        description: "Star Schema data modeling, DAX CALCULATE(), Level of Detail (LOD) expressions, and storytelling.",
        topics: ["Star Schema Data Modeling (Facts & Dimensions)", "DAX CALCULATE() & Time Intelligence (YoY, YTD)", "Tableau Level of Detail (FIXED) Expressions", "Edward Tufte's Data-Ink Ratio & Chart Selection"]
      },
      {
        title: "8. Predictive Analytics & Machine Learning Capstone",
        description: "Linear & Logistic Regression, Decision Trees, XGBoost, and executive dashboard delivery.",
        topics: ["Evaluating Classification (Precision, Recall, ROC-AUC)", "Train-Test Splits & Regularization", "Deploying the Executive Analytics Capstone"]
      }
    ];
  }

  // Build real modules with 3–4 lessons each
  return moduleTemplates.map((mTemplate, mIdx) => {
    const lessons = mTemplate.topics.map((topic, lIdx) => {
      const isPractical = lIdx === 2 || lIdx === 3;
      return createLesson({
        id: `${courseId}-m${mIdx + 1}-l${lIdx + 1}`,
        title: topic,
        type: isPractical ? "PRACTICAL" : "READING",
        duration: "15 min",
        durationMinutes: 15,
        requiredDurationSeconds: 60,
        objective: `Master the principles, real-world context, and implementation of ${topic} within ${courseTitle}.`,
        coreConcepts: `Comprehensive in-depth exploration of ${topic}. Understanding these principles is essential for high-performance operational execution in ${domain}.`,
        realWorldExample: `In production enterprise environments, teams utilize ${topic} to eliminate errors, optimize workflows, and maintain compliance standards.`,
        practicalExample: `Detailed hands-on guide and step-by-step verification checklist for applying ${topic} in real project scenarios.`,
        commonMistakes: [
          `Applying ${topic} without verifying prerequisite environment dependencies`,
          "Ignoring edge-case error states and unexpected boundary inputs",
          "Failing to document standard operational procedures for team members"
        ],
        takeaways: [
          `Always test and benchmark ${topic} against clear criteria`,
          "Adhere to standardized industry best practices and security guidelines",
          "Continuously review metrics to detect and prevent regressions"
        ],
        practicalTask: isPractical ? {
          scenario: `Apply the principles of ${topic} to a real-world scenario in ${courseTitle}.`,
          instructions: [
            `Analyze the given ${topic} requirements specification`,
            "Implement the required changes adhering to industry best practices",
            "Verify the solution against the expected output criteria"
          ],
          expectedResult: `Successfully completed and verified implementation of ${topic}.`
        } : null
      });
    });

    return createModule({
      id: `${courseId}-mod-${mIdx + 1}`,
      order: mIdx + 1,
      title: mTemplate.title,
      description: mTemplate.description,
      lessons,
      checkpointQuiz: {
        questions: generateCheckpointQuestions(courseId, mIdx, mTemplate, domain, mTemplate.topics)
      },
      externalResources: [
        { title: `${mTemplate.title} Reference Guide`, url: "https://prepria.ai", provider: "PREPRIA Academic Hub" },
        { title: "Industry Deep Dive & Whitepaper", url: "https://coursera.org", provider: "Verified Resource" }
      ]
    });
  });
};
