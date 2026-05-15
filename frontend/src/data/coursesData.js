export const coursesData = [
    // --- TECH COURSES ---
    { 
        id: "tech-101", 
        title: "Advanced React.js & Next.js Patterns", 
        category: "Frontend", 
        domain: "tech",
        level: "Advanced", 
        duration: "8 Weeks", 
        description: "Master React.js and Next.js, focusing on Server-Side Rendering (SSR), Static Site Generation (SSG), and state management architectures.",
        modules: [
            { 
                title: "Next.js Architecture", 
                duration: 60,
                content: {
                    text: "Next.js provides hybrid static & server rendering, TypeScript support, smart bundling, and route pre-fetching out of the box.",
                    bullets: ["App Router vs Pages Router", "Server Components", "Data fetching (SSR vs SSG)"],
                    example: "export default async function Page() { const data = await fetch('api'); return <div>{data.title}</div>; }"
                }
            },
            { 
                title: "Advanced State Management", 
                duration: 90, 
                content: {
                    text: "Managing complex state at scale using tools like Zustand, Redux Toolkit, or Context + Reducers.",
                    bullets: ["When to use Context vs Redux", "Atomic state with Jotai", "Server state with React Query"],
                    example: "const useStore = create((set) => ({ bears: 0, increasePopulation: () => set((state) => ({ bears: state.bears + 1 })) }))"
                }
            }
        ]
    },
    { 
        id: "tech-102", 
        title: "Distributed Systems & Microservices", 
        category: "Backend", 
        domain: "tech",
        level: "Advanced", 
        duration: "10 Weeks", 
        description: "Design and implement scalable microservices architectures using Go and Node.js.",
        modules: [
            { 
                title: "Microservices Architecture", 
                duration: 120, 
                content: {
                    text: "Microservices structure an application as a collection of loosely coupled, independently deployable services.",
                    bullets: ["Domain-Driven Design (DDD)", "API Gateways", "Service Discovery"],
                    example: "Decomposing a monolithic e-commerce app into Orders, Inventory, and User services."
                }
            },
            { 
                title: "Event-Driven Communication", 
                duration: 150, 
                content: {
                    text: "Using message brokers like Kafka or RabbitMQ to decouple services and ensure fault tolerance.",
                    bullets: ["Publish/Subscribe pattern", "Event Sourcing", "CQRS (Command Query Responsibility Segregation)"],
                    example: "Publishing an 'OrderCreated' event to an exchange that the Inventory service listens to."
                }
            }
        ]
    },
    {
        id: "tech-103",
        title: "Docker & Kubernetes Mastery",
        category: "DevOps",
        domain: "tech",
        level: "Intermediate",
        duration: "8 Weeks",
        description: "Containerize applications and orchestrate them using Kubernetes for high availability.",
        modules: [
            {
                title: "Docker Fundamentals",
                duration: 90,
                content: {
                    text: "Docker allows you to package an application with all of its dependencies into a standardized unit for software development.",
                    bullets: ["Images and Containers", "Writing efficient Dockerfiles", "Multi-stage builds"],
                    example: "FROM node:alpine\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nCMD [\"node\", \"index.js\"]"
                }
            },
            {
                title: "Kubernetes Orchestration",
                duration: 120,
                content: {
                    text: "Kubernetes automates deployment, scaling, and management of containerized applications.",
                    bullets: ["Pods and Deployments", "Services and Ingress", "ConfigMaps and Secrets"],
                    example: "kubectl apply -f deployment.yaml to spin up 3 replicas of the frontend service."
                }
            }
        ]
    },
    { 
        id: "tech-104", 
        title: "Machine Learning with Python", 
        category: "AI / Machine Learning", 
        domain: "tech",
        level: "Beginner", 
        duration: "10 Weeks", 
        description: "Introduction to supervised and unsupervised learning algorithms using scikit-learn and pandas.",
        modules: [
            { 
                title: "Supervised Learning Algorithms", 
                duration: 90, 
                content: {
                    text: "Supervised learning uses labeled datasets to train algorithms to classify data or predict outcomes accurately.",
                    bullets: ["Linear Regression", "Logistic Regression", "Random Forests"],
                    example: "model = RandomForestClassifier()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)"
                }
            }
        ]
    },
    {
        id: "tech-105",
        title: "Data Science & Data Wrangling",
        category: "Data Science",
        domain: "tech",
        level: "Intermediate",
        duration: "8 Weeks",
        description: "Analyze, clean, and visualize complex datasets to extract actionable business insights.",
        modules: [
            {
                title: "Exploratory Data Analysis (EDA)",
                duration: 90,
                content: {
                    text: "EDA is the process of analyzing data sets to summarize their main characteristics, often using visual methods.",
                    bullets: ["Handling missing values", "Outlier detection", "Correlation matrices"],
                    example: "import seaborn as sns\nsns.heatmap(df.corr(), annot=True)"
                }
            }
        ]
    },

    // --- EMERGING CAREERS ---
    {
        id: "emerg-401",
        title: "Generative AI & LLM Integration",
        category: "Generative AI",
        domain: "emerging",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Learn how to build applications powered by Large Language Models using LangChain and OpenAI APIs.",
        modules: [
            {
                title: "RAG (Retrieval-Augmented Generation)",
                duration: 120,
                content: {
                    text: "RAG optimizes the output of an LLM, referencing an authoritative knowledge base outside of its training data sources before generating a response.",
                    bullets: ["Vector Databases (Pinecone, Chroma)", "Embeddings", "Chunking strategies"],
                    example: "Retrieving top-k semantic matches from a vector DB and injecting them into the LLM prompt context."
                }
            }
        ]
    },
    {
        id: "emerg-402",
        title: "Advanced Prompt Engineering",
        category: "Prompt Engineering",
        domain: "emerging",
        level: "Beginner",
        duration: "4 Weeks",
        description: "Master the art of crafting precise, effective prompts to extract the best outputs from AI models.",
        modules: [
            {
                title: "Few-Shot Prompting & Chain of Thought",
                duration: 60,
                content: {
                    text: "Providing examples (few-shot) and forcing the model to explain its reasoning (chain of thought) drastically improves accuracy.",
                    bullets: ["Zero-shot vs Few-shot", "Chain of Thought (CoT) prompting", "System prompts & persona formatting"],
                    example: "Prompt: 'Let's think step by step to solve this math problem: 1. First, we calculate...'"
                }
            }
        ]
    },
    {
        id: "emerg-403",
        title: "AI Product Management",
        category: "AI Product Management",
        domain: "emerging",
        level: "Advanced",
        duration: "8 Weeks",
        description: "Lead the development of AI-driven products from ideation to deployment, balancing model metrics with user value.",
        modules: [
            {
                title: "Evaluating AI Models for Production",
                duration: 90,
                content: {
                    text: "Understand the trade-offs between latency, cost, and accuracy when choosing models for a product.",
                    bullets: ["Precision vs Recall", "Model fine-tuning vs RAG", "Handling hallucinations in UI"],
                    example: "Deciding whether to use GPT-4 (high latency/cost) or fine-tune a smaller Llama model for a specific text classification task."
                }
            }
        ]
    },

    // --- CREATIVE & DESIGN ---
    {
        id: "creat-501",
        title: "Advanced UI/UX Design with Figma",
        category: "UI/UX Design",
        domain: "creative",
        level: "Intermediate",
        duration: "8 Weeks",
        description: "Create stunning, accessible, and highly-converting user interfaces using Figma.",
        modules: [
            {
                title: "Design Systems & Components",
                duration: 120,
                content: {
                    text: "A design system maintains visual consistency across products and speeds up the design and development processes.",
                    bullets: ["Atomic Design methodology", "Figma Variants and Auto-layout", "Design Tokens"],
                    example: "Creating a master button component with variants for Primary, Secondary, Hover, and Disabled states."
                }
            },
            {
                title: "User Journey Mapping",
                duration: 90,
                content: {
                    text: "Visualizing the process a user goes through to accomplish a goal.",
                    bullets: ["Identifying friction points", "Persona creation", "Wireframing user flows"],
                    example: "Mapping the checkout flow of an e-commerce site to reduce cart abandonment."
                }
            }
        ]
    },
    {
        id: "creat-502",
        title: "Social Media Strategy & Content Creation",
        category: "Social Media Management",
        domain: "creative",
        level: "Beginner",
        duration: "6 Weeks",
        description: "Grow an audience and build brand authority across LinkedIn, Twitter/X, and Instagram.",
        modules: [
            {
                title: "Content Calendars & Analytics",
                duration: 60,
                content: {
                    text: "Consistency and data-driven adjustments are key to organic social media growth.",
                    bullets: ["Batch creating content", "Analyzing engagement metrics", "Platform-specific algorithms"],
                    example: "Using a tool like Buffer or Notion to schedule 3 weeks of LinkedIn posts optimized for 9 AM Tuesday publishing."
                }
            }
        ]
    },
    {
        id: "creat-503",
        title: "Video Editing for Creators",
        category: "Video Editing",
        domain: "creative",
        level: "Beginner",
        duration: "4 Weeks",
        description: "Master Premiere Pro and DaVinci Resolve to create engaging, highly-retained video content.",
        modules: [
            {
                title: "Timeline & Cuts",
                duration: 60,
                content: {
                    text: "Understanding pacing is the most important skill for an editor.",
                    bullets: ["J-Cuts and L-Cuts", "Color grading basics", "Audio mixing"],
                    example: "Using a J-Cut to bring in the audio of the next scene before the video transitions."
                }
            }
        ]
    },

    // --- NON-TECH COURSES ---
    {
        id: "non-tech-201",
        title: "Financial Modeling & Valuation",
        category: "Finance",
        domain: "finance",
        level: "Advanced",
        duration: "8 Weeks",
        description: "Build robust financial models in Excel to forecast revenues and value companies using DCF analysis.",
        modules: [
            {
                title: "Discounted Cash Flow (DCF)",
                duration: 120,
                content: {
                    text: "A valuation method used to estimate the value of an investment based on its expected future cash flows.",
                    bullets: ["Calculating WACC (Weighted Average Cost of Capital)", "Projecting Free Cash Flows", "Terminal Value calculation"],
                    example: "Discounting 5 years of projected cash flows to their present value to determine if a stock is undervalued."
                }
            }
        ]
    },
    {
        id: "fin-1",
        title: "Investment Banking Basics",
        category: "Finance",
        domain: "finance",
        level: "Beginner",
        duration: "4 Weeks",
        description: "An introduction to the world of investment banking, M&A, and capital markets.",
        modules: [
            {
                title: "Intro to M&A",
                duration: 90,
                content: {
                    text: "Mergers and acquisitions (M&A) is a general term that refers to the consolidation of companies or assets.",
                    bullets: ["Buy-side vs Sell-side", "The deal lifecycle", "Pitchbooks"],
                    example: "Creating a pitchbook for a prospective sell-side client."
                }
            }
        ]
    },
    {
        id: "fin-2",
        title: "Corporate Finance Essentials",
        category: "Finance",
        domain: "finance",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Learn how to manage capital, evaluate investments, and make strategic financial decisions.",
        modules: [
            {
                title: "Capital Budgeting",
                duration: 60,
                content: {
                    text: "Capital budgeting is the process a business undertakes to evaluate potential major projects or investments.",
                    bullets: ["NPV and IRR", "Payback period", "Risk analysis"],
                    example: "Calculating the Net Present Value of a proposed factory expansion."
                }
            }
        ]
    },
    {
        id: "non-tech-202",
        title: "Product Lifecycle Management",
        category: "Product Management",
        domain: "business",
        level: "Intermediate",
        duration: "8 Weeks",
        description: "Learn to manage a product from ideation, user research, roadmapping, to launch and iteration.",
        modules: [
            {
                title: "User Research & Ideation",
                duration: 120,
                content: {
                    text: "Validating problems before building solutions is crucial to product success.",
                    bullets: ["Conducting user interviews", "Creating user personas", "Defining the problem statement"],
                    example: "Interviewing 10 potential customers to understand their pain points before designing a new feature."
                }
            },
            {
                title: "Prioritization Frameworks",
                duration: 90,
                content: {
                    text: "Deciding what to build next is the hardest part of product management. Frameworks remove bias.",
                    bullets: ["RICE Framework (Reach, Impact, Confidence, Effort)", "MoSCoW Method", "Kano Model"],
                    example: "Scoring a new integration feature high on Reach and Impact, but low on Confidence, delaying it for further research."
                }
            }
        ]
    },
    {
        id: "hr-1",
        title: "Recruitment Fundamentals",
        category: "Human Resources (HR)",
        domain: "business",
        level: "Beginner",
        duration: "4 Weeks",
        description: "Learn how to source, screen, and interview candidates effectively.",
        modules: [
            {
                title: "Sourcing & Screening",
                duration: 90,
                content: {
                    text: "Identifying the right talent starts with effective sourcing and screening.",
                    bullets: ["Writing job descriptions", "Boolean search", "Resume screening"],
                    example: "Using Boolean search strings on LinkedIn to find specialized software engineers."
                }
            }
        ]
    },
    {
        id: "hr-2",
        title: "Employee Engagement Strategies",
        category: "Human Resources (HR)",
        domain: "business",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Discover techniques to boost morale, retain top talent, and build a strong company culture.",
        modules: [
            {
                title: "Retention & Culture",
                duration: 60,
                content: {
                    text: "A strong company culture is the best retention tool.",
                    bullets: ["Employee feedback loops", "Recognition programs", "Work-life balance initiatives"],
                    example: "Implementing a peer-to-peer recognition system using Slack."
                }
            }
        ]
    },
    {
        id: "non-tech-203",
        title: "B2B Sales & Negotiation Mastery",
        category: "Sales",
        domain: "business",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Master complex B2B sales cycles, objection handling, and closing enterprise deals.",
        modules: [
            {
                title: "The MEDDIC Sales Process",
                duration: 90,
                content: {
                    text: "MEDDIC is a B2B sales methodology utilized to qualify complex enterprise sales opportunities.",
                    bullets: ["Metrics & Economic Buyer", "Decision Criteria & Process", "Identifying the Pain and Champion"],
                    example: "Ensuring you have identified the internal 'Champion' who will sell the product to the executive team on your behalf."
                }
            }
        ]
    },
    {
        id: "mkt-1",
        title: "Digital Marketing Basics",
        category: "Marketing",
        domain: "business",
        level: "Beginner",
        duration: "4 Weeks",
        description: "A comprehensive introduction to online marketing, from PPC to social media.",
        modules: [
            {
                title: "Introduction to PPC",
                duration: 60,
                content: {
                    text: "Pay-per-click advertising is a model where advertisers pay a fee each time their ad is clicked.",
                    bullets: ["Google Ads basics", "Keyword match types", "Ad copywriting"],
                    example: "Setting up a Google Search campaign targeting long-tail keywords for a SaaS product."
                }
            }
        ]
    },
    {
        id: "mkt-2",
        title: "SEO & Content Strategy",
        category: "Marketing",
        domain: "business",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Learn how to rank high on Google and create content that drives organic traffic.",
        modules: [
            {
                title: "On-Page SEO",
                duration: 90,
                content: {
                    text: "On-page SEO is the practice of optimizing individual web pages to rank higher.",
                    bullets: ["Title tags and meta descriptions", "Header structures", "Keyword density"],
                    example: "Optimizing an article's H1 and H2 tags to include target keywords naturally."
                }
            }
        ]
    },

    // --- SOFT SKILLS COURSES ---
    {
        id: "soft-301",
        title: "Executive Communication & Persuasion",
        category: "Communication",
        domain: "soft-skills",
        level: "Intermediate",
        duration: "4 Weeks",
        description: "Communicate effectively with leadership, handle pushback, and present data-driven narratives.",
        modules: [
            {
                title: "Bottom-Line Up Front (BLUF)",
                duration: 60,
                content: {
                    text: "BLUF is the practice of beginning a message with its key information rather than burying it in details.",
                    bullets: ["Structuring emails for executives", "Summarizing complex data", "The Pyramid Principle"],
                    example: "Instead of detailing the 3-month project process, starting an email with: 'Recommendation: Approve $50k budget for Q3 marketing to increase leads by 15%.'"
                }
            }
        ]
    },
    {
        id: "soft-302",
        title: "Mastering Interview Skills",
        category: "Interview Skills",
        domain: "soft-skills",
        level: "Beginner",
        duration: "3 Weeks",
        description: "Learn how to present yourself confidently, tackle behavioral questions, and negotiate salary.",
        modules: [
            {
                title: "The STAR Method",
                duration: 60,
                content: {
                    text: "The STAR method is a structured manner of responding to behavioral interview questions.",
                    bullets: ["Situation: Context of the challenge", "Task: Your specific responsibility", "Action: How you solved it", "Result: The quantifiable outcome"],
                    example: "Result: 'By refactoring the database queries, I reduced page load times by 40%, increasing conversions by 5%.'"
                }
            }
        ]
    },
    {
        id: "soft-303",
        title: "Conflict Resolution & Emotional Intelligence",
        category: "Emotional Intelligence",
        domain: "soft-skills",
        level: "Beginner",
        duration: "5 Weeks",
        description: "De-escalate workplace conflicts, manage stress, and build high-trust relationships with colleagues.",
        modules: [
            {
                title: "Active Listening & Empathy",
                duration: 90,
                content: {
                    text: "Understanding the emotional subtext behind a colleague's words prevents miscommunication.",
                    bullets: ["Identifying emotional triggers", "Non-violent communication (NVC)", "Reflective listening techniques"],
                    example: "Responding with 'It sounds like you felt frustrated when the deadline was moved up without warning' instead of 'Just work faster.'"
                }
            }
        ]
    },
    {
        id: "soft-ct-1",
        title: "Critical Thinking Fundamentals",
        category: "Critical Thinking",
        domain: "soft-skills",
        level: "Beginner",
        duration: "3 Weeks",
        description: "Learn how to objectively analyze information, evaluate evidence, and form reasoned judgments.",
        modules: [
            {
                title: "Introduction to Logic",
                duration: 60,
                content: {
                    text: "Logic is the systematic study of the form of valid inference and reason.",
                    bullets: ["Deductive vs Inductive reasoning", "Identifying cognitive biases", "Constructing valid arguments"],
                    example: "Analyzing a news article to identify underlying assumptions and logical fallacies."
                }
            }
        ]
    },
    {
        id: "soft-ct-2",
        title: "Decision Making & Logic",
        category: "Critical Thinking",
        domain: "soft-skills",
        level: "Intermediate",
        duration: "4 Weeks",
        description: "Develop robust frameworks for making complex decisions under uncertainty.",
        modules: [
            {
                title: "Decision Frameworks",
                duration: 90,
                content: {
                    text: "Using structured frameworks removes emotion and bias from complex decisions.",
                    bullets: ["Decision matrices", "Cost-benefit analysis", "Scenario planning"],
                    example: "Using a weighted decision matrix to choose between three competing software vendors."
                }
            }
        ]
    },
    {
        id: "soft-ct-3",
        title: "Analytical Reasoning Skills",
        category: "Critical Thinking",
        domain: "soft-skills",
        level: "Advanced",
        duration: "4 Weeks",
        description: "Master the ability to break down complex problems into manageable components and identify core drivers.",
        modules: [
            {
                title: "Root Cause Analysis",
                duration: 90,
                content: {
                    text: "Identifying the fundamental reason a problem occurred is essential for preventing recurrence.",
                    bullets: ["The 5 Whys technique", "Fishbone diagrams", "Fault tree analysis"],
                    example: "Applying the 5 Whys to understand why a recent product deployment failed."
                }
            }
        ]
    },
    {
        id: "soft-ps-1",
        title: "Public Speaking Basics",
        category: "Public Speaking",
        domain: "soft-skills",
        level: "Beginner",
        duration: "3 Weeks",
        description: "Overcome stage fright and learn the fundamentals of delivering clear, engaging presentations.",
        modules: [
            {
                title: "Overcoming Anxiety",
                duration: 60,
                content: {
                    text: "Speech anxiety is common, but it can be managed with specific techniques.",
                    bullets: ["Breathing exercises", "Visualization", "Preparation strategies"],
                    example: "Practicing controlled breathing techniques before stepping onto a stage."
                }
            }
        ]
    },
    {
        id: "soft-ps-2",
        title: "Confidence & Stage Presence",
        category: "Public Speaking",
        domain: "soft-skills",
        level: "Intermediate",
        duration: "4 Weeks",
        description: "Command the room using body language, vocal variety, and commanding stage presence.",
        modules: [
            {
                title: "Mastering Body Language",
                duration: 90,
                content: {
                    text: "Non-verbal communication often speaks louder than the words you say.",
                    bullets: ["Eye contact", "Purposeful movement", "Hand gestures"],
                    example: "Recording yourself giving a speech and analyzing your hand gestures and posture."
                }
            }
        ]
    },
    {
        id: "soft-ps-3",
        title: "Storytelling for Impact",
        category: "Public Speaking",
        domain: "soft-skills",
        level: "Advanced",
        duration: "5 Weeks",
        description: "Learn how to weave compelling narratives into your presentations to emotionally engage and persuade your audience.",
        modules: [
            {
                title: "The Hero's Journey",
                duration: 120,
                content: {
                    text: "Structuring your presentation as a narrative makes your message memorable.",
                    bullets: ["The classic narrative arc", "Building tension", "The resolution"],
                    example: "Structuring a sales pitch as a story where the client is the hero and your product is the magical tool."
                }
            }
        ]
    },
    // --- ADDITIONAL TECH / EMERGING COURSES (PHASE 3) ---
    {
        id: "cloud-1",
        title: "AWS Cloud Fundamentals",
        category: "Cloud Computing",
        domain: "tech",
        level: "Beginner",
        duration: "4 Weeks",
        description: "Learn the basics of Amazon Web Services, including EC2, S3, and IAM.",
        modules: [{ title: "AWS Core Services", duration: 90, content: { text: "Introduction to compute and storage on AWS.", bullets: ["EC2", "S3", "VPC"], example: "Deploying a static website to an S3 bucket." } }]
    },
    {
        id: "cloud-2",
        title: "Azure & GCP Deployment",
        category: "Cloud Computing",
        domain: "tech",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Compare and deploy applications across Microsoft Azure and Google Cloud Platform.",
        modules: [{ title: "Multi-Cloud Strategies", duration: 120, content: { text: "Managing resources across different cloud providers.", bullets: ["Azure VMs", "GCP Compute Engine", "Networking"], example: "Creating a load balancer in GCP." } }]
    },
    {
        id: "cloud-3",
        title: "Cloud Architecture Design",
        category: "Cloud Computing",
        domain: "tech",
        level: "Advanced",
        duration: "8 Weeks",
        description: "Design highly available, fault-tolerant, and scalable systems in the cloud.",
        modules: [{ title: "System Design for Cloud", duration: 120, content: { text: "Designing for failure and scale.", bullets: ["Auto-scaling groups", "Disaster recovery", "Microservices"], example: "Architecting a globally distributed application." } }]
    },
    {
        id: "mlops-1",
        title: "MLOps Basics",
        category: "MLOps",
        domain: "emerging",
        level: "Intermediate",
        duration: "6 Weeks",
        description: "Learn how to bridge the gap between machine learning model development and production.",
        modules: [{ title: "Introduction to MLOps", duration: 90, content: { text: "Applying DevOps principles to Machine Learning.", bullets: ["Model versioning", "Data drift", "CI/CD for ML"], example: "Setting up a DVC pipeline for tracking datasets." } }]
    },
    {
        id: "mlops-2",
        title: "Model Deployment with Docker",
        category: "MLOps",
        domain: "emerging",
        level: "Advanced",
        duration: "6 Weeks",
        description: "Containerize ML models and deploy them as scalable APIs using Docker and FastAPI.",
        modules: [{ title: "Containerizing Models", duration: 120, content: { text: "Packaging models for consistent execution.", bullets: ["Writing Dockerfiles for ML", "Exposing REST APIs", "Handling large weights"], example: "Building a Docker image containing a PyTorch model and an API." } }]
    },
    {
        id: "de-1",
        title: "Data Engineering Fundamentals",
        category: "Data Engineering",
        domain: "emerging",
        level: "Beginner",
        duration: "5 Weeks",
        description: "Understand data warehouses, data lakes, and batch vs streaming pipelines.",
        modules: [{ title: "Data Storage Architectures", duration: 90, content: { text: "Where and how to store massive amounts of data.", bullets: ["Data Lakes vs Warehouses", "Columnar formats (Parquet)", "Cloud storage"], example: "Comparing Redshift and S3 for different analytical workloads." } }]
    },
    {
        id: "de-2",
        title: "ETL Pipelines with Airflow",
        category: "Data Engineering",
        domain: "emerging",
        level: "Intermediate",
        duration: "8 Weeks",
        description: "Build robust, scheduled data pipelines using Apache Airflow.",
        modules: [{ title: "Writing DAGs", duration: 120, content: { text: "Directed Acyclic Graphs define how tasks are executed.", bullets: ["Operators", "Scheduling", "Error handling"], example: "Writing a Python DAG that extracts data from an API daily." } }]
    }
];

// --- DYNAMIC AUTO-FILL FOR MISSING COURSES (PHASE 4 & 5) ---
const filterGroups = {
    "Tech": ["Frontend", "Backend", "Full Stack", "AI / Machine Learning", "Data Science", "Cloud Computing", "Cyber Security", "DevOps", "Software Engineering", "Mobile App Development", "Game Development", "Blockchain / Web3", "IoT (Internet of Things)"],
    "Non-Tech": ["Finance", "Accounting", "Investment Banking", "Business & Management", "Human Resources (HR)", "Marketing", "Digital Marketing", "Sales", "Product Management", "Operations Management", "Supply Chain Management", "Consulting", "Entrepreneurship", "Business Analytics"],
    "Creative": ["UI/UX Design", "Graphic Design", "Video Editing", "Animation", "Content Creation", "Social Media Management", "Branding"],
    "Emerging": ["Generative AI", "Prompt Engineering", "AI Product Management", "Data Engineering", "MLOps", "Cyber Forensics", "AR/VR Development", "Robotics"],
    "Soft Skills": ["Communication", "Interview Skills", "Resume Building", "Public Speaking", "Leadership", "Time Management", "Critical Thinking", "Problem Solving", "Negotiation Skills", "Emotional Intelligence"]
};

// Flatten to get all subcategories
const allSubCategories = Object.values(filterGroups).flat();

// Map categories to domains
const getDomainForCategory = (category) => {
    if (filterGroups["Tech"].includes(category)) return "tech";
    if (filterGroups["Non-Tech"].includes(category)) {
        if (["Finance", "Accounting", "Investment Banking"].includes(category)) return "finance";
        return "business";
    }
    if (filterGroups["Creative"].includes(category)) return "creative";
    if (filterGroups["Emerging"].includes(category)) return "emerging";
    if (filterGroups["Soft Skills"].includes(category)) return "soft-skills";
    return "tech"; // fallback
};

// Check for missing courses
const categoryCounts = {};
coursesData.forEach(course => {
    categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
});

const missingCategories = allSubCategories.filter(sub => (categoryCounts[sub] || 0) < 2);
console.log("Empty or underpopulated categories:", missingCategories);

if (missingCategories.length > 0) {
    let autoId = 1;
    missingCategories.forEach(category => {
        const domain = getDomainForCategory(category);
        const count = categoryCounts[category] || 0;
        const needed = 2 - count;
        
        for (let i = 0; i < needed; i++) {
            coursesData.push({
                id: `auto-${domain}-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${autoId++}`,
                title: `${category} Fundamentals ${count + i + 1}`,
                category: category,
                domain: domain,
                level: (count + i) === 0 ? "Beginner" : "Intermediate",
                duration: "4 Weeks",
                description: `Comprehensive introduction to ${category}. Learn the fundamental concepts and practical applications needed to excel in this field.`,
                modules: [
                    {
                        title: `Introduction to ${category}`,
                        duration: 90,
                        content: {
                            text: `Learn the core concepts and principles of ${category}.`,
                            bullets: ["Understanding the basics", "Key methodologies", "Practical applications"],
                            example: `Applying ${category} concepts to solve real-world industry challenges.`
                        }
                    }
                ]
            });
        }
    });
}

// --- DYNAMIC MODULE PADDING (PHASE 1) ---
// Ensure every course has at least 8 modules by padding context-aware modules
coursesData.forEach(course => {
    if (!course.modules) course.modules = [];
    
    // Minimum 8 modules
    while (course.modules.length < 8) {
        const count = course.modules.length + 1;
        let title, text, bullets, example, useCases, practicalTasks, visuals, tip, warning, keyConcept;
        
        switch (count) {
            case 1:
                title = `Introduction to ${course.category}`;
                text = `Welcome to the foundational module for ${course.category}. In this comprehensive introduction, we will cover the core principles, historical context, and modern relevance of this field. You will explore why ${course.title} is critical in today's industry landscape. We will also discuss the mindset required to master these concepts and outline the journey ahead. Expect to build a strong mental model that will serve as the scaffolding for more advanced topics later in the course. Understanding these basics thoroughly ensures you won't struggle when we introduce complex architectures and fast-paced workflows.`;
                bullets = [
                    `Understanding the core mechanics of ${course.title}`,
                    "Setting up your environment and initial tools correctly",
                    "Recognizing common industry standards and pitfalls",
                    "Establishing a baseline vocabulary for the field"
                ];
                example = `Example: Analyzing a basic workflow diagram in ${course.category} to identify inputs and outputs.`;
                useCases = ["Onboarding new team members", "Setting up a greenfield project", "Evaluating whether a technology fits a business need"];
                practicalTasks = ["Install necessary tools and verify your environment.", "Write a 'Hello World' equivalent for this domain.", "Draft a one-page summary of the core concepts."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80", caption: "Setting up your environment for success." }
                ];
                tip = "Always review the official documentation before diving into complex tutorials.";
                keyConcept = "The foundational concepts form the basis of every advanced architecture you will encounter.";
                break;
            case 2:
                title = `Architecture & Design Patterns`;
                text = `Moving beyond the basics, this module delves into the structural patterns and architectural decisions that define professional-grade work in ${course.category}. We will examine how to organize your work for scalability, maintainability, and team collaboration. You will learn about standard design patterns, anti-patterns to avoid, and the trade-offs involved in various architectural choices. By the end of this module, you should be able to look at a complex system and understand its underlying blueprint. We will also touch upon how these patterns have evolved over time and where the industry is heading.`;
                bullets = [
                    "Identifying and applying standard design patterns",
                    "Structuring projects for long-term maintainability",
                    "Understanding the trade-offs in architectural decisions",
                    "Refactoring poorly structured legacy work"
                ];
                example = `Example: Refactoring a monolithic structure into modular, reusable components.`;
                useCases = ["Scaling a prototype to a production system", "Auditing an existing architecture", "Planning a major feature expansion"];
                practicalTasks = ["Draw a diagram of your intended architecture.", "Identify 3 anti-patterns in a provided sample.", "Create a reusable component/template."];
                visuals = [
                    { type: "diagram", src: "https://images.unsplash.com/photo-1507238692092-57362ce58f14?w=800&q=80", caption: "A scalable architectural blueprint." },
                    { type: "image", src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80", caption: "Refactoring legacy code into clean modules." }
                ];
                warning = "Avoid over-engineering. Only apply complex design patterns when the problem genuinely requires them.";
                keyConcept = "Design patterns are reusable solutions to commonly occurring problems, not strict rules.";
                break;
            case 3:
                title = `Advanced Techniques & Optimization`;
                text = `Now that you have a solid architectural foundation, it is time to focus on optimization and advanced techniques. In this module, we explore how to squeeze the maximum performance out of your work in ${course.category}. We will cover profiling, identifying bottlenecks, and implementing targeted optimizations. You will also learn advanced features of your tools that are typically only used by senior practitioners. Mastery here means the difference between a solution that 'just works' and one that is robust, efficient, and highly polished. We will analyze real-world case studies of systems that failed under pressure and how they were fixed.`;
                bullets = [
                    "Profiling and identifying performance bottlenecks",
                    "Implementing advanced features and edge-case handling",
                    "Writing highly optimized, clean deliverables",
                    "Understanding the underlying mechanics of your tools"
                ];
                example = `Example: Reducing processing time by 40% using advanced optimization strategies.`;
                useCases = ["Fixing performance regressions", "Handling high-load scenarios", "Optimizing for resource-constrained environments"];
                practicalTasks = ["Profile a sample workload and identify the slowest part.", "Apply an optimization technique to speed it up.", "Document the before/after metrics."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", caption: "Analyzing performance metrics and data." }
                ];
                tip = "Optimization should be data-driven. Always profile before you optimize.";
                warning = "Premature optimization is the root of all evil. Focus on correctness first.";
                break;
            case 4:
                title = `State Management & Deep Systems`;
                text = `Managing state and complex system interactions is often the most challenging aspect of ${course.category}. This module is dedicated to mastering how data, state, and context flow through your applications or workflows. We will explore different methodologies for managing complex, interconnected data, ensuring consistency, and avoiding synchronization bugs. You will learn how to design systems that are predictable and easy to debug, even when handling massive amounts of information. We will also discuss the concept of a 'single source of truth' and how to maintain it across distributed components.`;
                bullets = [
                    "Designing predictable state management flows",
                    "Handling asynchronous operations and side effects",
                    "Ensuring data consistency across complex systems",
                    "Debugging difficult synchronization issues"
                ];
                example = `Example: Implementing a robust state machine to handle complex user interactions.`;
                useCases = ["Managing multi-step user wizards", "Syncing local changes with a remote server", "Handling real-time collaborative features"];
                practicalTasks = ["Build a complex state machine for a specific scenario.", "Write tests to verify state transitions.", "Debug a provided application with a race condition."];
                visuals = [
                    { type: "diagram", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", caption: "Visualizing complex state transitions." }
                ];
                keyConcept = "Maintain a single source of truth to avoid conflicting data states.";
                break;
            case 5:
                title = `Testing, QA & Reliability`;
                text = `Reliability is non-negotiable for professional work. This module focuses on testing strategies, Quality Assurance (QA), and building resilient systems in ${course.category}. We will cover unit testing, integration testing, end-to-end testing, and automated QA pipelines. You will learn how to write testable work from the start, rather than treating testing as an afterthought. We will also discuss strategies for handling unexpected failures gracefully and ensuring your deliverables meet strict quality standards before they ever reach the end user.`;
                bullets = [
                    "Implementing comprehensive testing strategies",
                    "Writing testable and modular code/components",
                    "Automating QA processes and pipelines",
                    "Designing for graceful degradation and error handling"
                ];
                example = `Example: Setting up an automated test suite that catches regressions before deployment.`;
                useCases = ["Preparing a major release", "Refactoring critical systems safely", "Ensuring compliance with industry standards"];
                practicalTasks = ["Write unit tests for core functionality.", "Set up a basic CI/CD pipeline step for automated testing.", "Implement a graceful error boundary/fallback."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", caption: "Automated testing and QA pipelines in action." }
                ];
                tip = "Test behavior, not implementation details.";
                break;
            case 6:
                title = `Deployment, Delivery & Scaling`;
                text = `Getting your work into the hands of users efficiently and safely is the focus of this module. We will explore deployment strategies, continuous delivery, and scaling considerations for ${course.category}. You will learn how to package your deliverables, manage environments (development, staging, production), and automate the release process. We will also delve into strategies for scaling your solutions to handle increased demand, including load balancing, caching, and infrastructure considerations. Preparing for 'Day 2' operations is crucial for long-term success.`;
                bullets = [
                    "Automating deployment and delivery pipelines",
                    "Managing multiple environments configuration",
                    "Strategies for zero-downtime deployments",
                    "Scaling architecture to meet growing demand"
                ];
                example = `Example: Automating a multi-stage deployment pipeline using modern CI/CD tools.`;
                useCases = ["Launching a new product", "Handling viral traffic spikes", "Rolling back a problematic release safely"];
                practicalTasks = ["Deploy a sample project to a staging environment.", "Configure environment variables securely.", "Simulate a traffic spike and observe system behavior."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", caption: "Scaling infrastructure to a global audience." }
                ];
                warning = "Never hardcode secrets or environment variables in your source code.";
                keyConcept = "Continuous Delivery enables faster, more reliable feature releases.";
                break;
            case 7:
                title = `Real-World Case Studies`;
                text = `Theory is essential, but analyzing real-world applications solidifies your understanding. In this module, we dissect successful and failed projects related to ${course.category}. We will look at how leading companies solved complex problems, the architecture they chose, and the mistakes they made along the way. By studying these case studies, you will develop an intuition for what works in practice and what to avoid. We will extract actionable insights that you can apply directly to your own work, bridging the gap between textbook knowledge and industry reality.`;
                bullets = [
                    "Analyzing architecture choices of leading tech companies",
                    "Understanding the root causes of major system failures",
                    "Extracting best practices from successful projects",
                    "Applying theoretical knowledge to messy, real-world constraints"
                ];
                example = `Example: Deconstructing how a major platform handled a 10x traffic surge during a global event.`;
                useCases = ["Defending architectural decisions in interviews", "Avoiding common pitfalls in new projects", "Benchmarking your work against industry leaders"];
                practicalTasks = ["Write a post-mortem analysis for a provided failure scenario.", "Present a summary of a chosen case study.", "Identify one lesson you can apply to your current project."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80", caption: "Analyzing complex real-world data and case studies." }
                ];
                tip = "The best way to learn is to study the failures of highly successful companies.";
                break;
            default:
                title = `Mastery & Capstone Project ${count - 7}`;
                text = `This is the culmination of your journey in ${course.category}. It is time to synthesize everything you have learned by completing a comprehensive, hands-on capstone project. This module requires you to integrate concepts from all previous modules—architecture, state management, testing, and deployment—into a single, polished deliverable. You will work through the entire lifecycle, from planning and design to execution and final review. This project is designed to be portfolio-ready and demonstrate your mastery of the subject to potential employers or clients.`;
                bullets = [
                    "End-to-end execution of a complex project",
                    "Integrating multiple advanced concepts into a single solution",
                    "Conducting a thorough performance and security review",
                    "Preparing documentation and a presentation for your work"
                ];
                example = `Example: Delivering a full-fledged, production-ready solution integrating all course concepts.`;
                useCases = ["Building a standout portfolio piece", "Simulating a real-world client engagement", "Final preparation for technical interviews"];
                practicalTasks = ["Draft a project proposal and architecture document.", "Execute the project adhering to industry best practices.", "Record a demo video presenting your final solution."];
                visuals = [
                    { type: "image", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", caption: "Putting it all together into a final capstone project." },
                    { type: "image", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", caption: "Presenting your final work." }
                ];
                keyConcept = "True mastery is demonstrated by synthesizing disparate concepts into a cohesive solution.";
                break;
        }
        
        course.modules.push({
            id: `mod-${course.id}-${count}`,
            title: title,
            duration: 60 * (count + 1), // e.g. 120s, 180s... Note: timer lock might just use 20s.
            content: {
                text: text,
                bullets: bullets,
                example: example,
                useCases: useCases,
                practicalTasks: practicalTasks,
                visuals: visuals,
                tip: tip,
                warning: warning,
                keyConcept: keyConcept
            }
        });
    }
});

// Post-processing to convert all 'content' objects into 'sections' arrays
coursesData.forEach(course => {
    if (course.modules) {
        course.modules.forEach(module => {
            if (module.content && !module.sections) {
                const sections = [];
                if (module.content.keyConcept) sections.push({ type: "keyConcept", content: module.content.keyConcept });
                if (module.content.warning) sections.push({ type: "warning", content: module.content.warning });
                if (module.content.tip) sections.push({ type: "tip", content: module.content.tip });
                if (module.content.text) sections.push({ type: "text", content: module.content.text });
                if (module.content.visuals && module.content.visuals.length > 0) {
                    sections.push({ type: "image", src: module.content.visuals[0].src, caption: module.content.visuals[0].caption });
                }
                if (module.content.bullets && module.content.bullets.length > 0) sections.push({ type: "bullets", items: module.content.bullets });
                if (module.content.visuals && module.content.visuals.length > 1) {
                    sections.push({ type: "image", src: module.content.visuals[1].src, caption: module.content.visuals[1].caption });
                }
                if (module.content.example) sections.push({ type: "example", content: module.content.example });
                if (module.content.useCases && module.content.useCases.length > 0) sections.push({ type: "useCases", items: module.content.useCases });
                if (module.content.practicalTasks && module.content.practicalTasks.length > 0) sections.push({ type: "practicalTasks", items: module.content.practicalTasks });
                
                module.sections = sections;
            }
        });
    }
});
