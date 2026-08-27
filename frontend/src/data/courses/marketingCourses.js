import { generateDomainModules } from './curriculumFactory';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const createMarketingCourse = ({
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
  category: "Marketing",
  subcategory,
  level,
  duration,
  estimatedHours,
  priority,
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact: careerImpact || { readinessBoost: "+11%", skillCoverageBoost: "+15%" },
  passingScore: 70,
  modules: generateDomainModules(id, title, "Marketing", subcategory),
  finalAssessment: {
    id: `${id}-final`,
    title: `${title} — Final Comprehensive Exam`,
    type: "FINAL_ASSESSMENT",
    duration: "30 min",
    passingScore: 70,
    description: `Demonstrate complete conceptual, analytical, and tactical mastery of ${title}.`,
    questions: generateFinalAssessmentQuestions(id, title, "Marketing")
  },
  capstoneProject: {
    id: `${id}-proj`,
    title: `${title} — Full Go-To-Market Growth Capstone`,
    description: `Architect, launch, and measure an omnichannel growth marketing campaign applying all principles mastered in ${title}.`,
    requirements: [
      "Develop quantitative Buyer Personas and Value Proposition Canvas",
      "Author an integrated SEO keyword cluster and Google Ads PPC strategy",
      "Construct a GA4 conversion tracking and multi-touch attribution measurement dashboard"
    ],
    timeHours: "14 Hours",
    status: "Not Started"
  }
});

export const marketingCourses = [
  createMarketingCourse({
    id: "mkt-101",
    title: "Digital Growth Marketing & Campaign Analytics",
    subcategory: "Growth Marketing",
    level: "Intermediate",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Plan and execute multichannel growth campaigns across SEO, Google Ads, Meta Ads Manager, GA4 analytics, and conversion rate optimization.",
    skillsGained: ["Digital Marketing", "SEO Strategy", "Google Ads", "GA4", "Copywriting", "CRO"],
    careerRoles: ["Marketing Executive", "Digital Marketing Specialist", "Growth Manager"],
    whyRecommended: "Core growth strategy and performance marketing skills for marketing and growth career paths."
  }),
  createMarketingCourse({
    id: "mkt-102",
    title: "Marketing Fundamentals & Value Proposition Design",
    subcategory: "Marketing Primitives",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Understand the 4Ps of Marketing (Product, Price, Place, Promotion), STP marketing, Value Proposition Canvas, and customer lifecycle funnels.",
    skillsGained: ["Marketing Fundamentals", "4Ps Marketing Mix", "STP Framework", "Value Proposition Canvas", "Customer Lifecycle"],
    careerRoles: ["Marketing Associate", "Brand Specialist", "Product Marketing Associate"],
    whyRecommended: "Foundational marketing framework bridging customer psychology with product positioning."
  }),
  createMarketingCourse({
    id: "mkt-103",
    title: "Consumer Behaviour & Buyer Psychology",
    subcategory: "Consumer Psychology",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Understand psychological drivers of purchase decisions: cognitive biases (loss aversion, social proof, anchoring, scarcity), decision journey mapping, and behavioral economics.",
    skillsGained: ["Consumer Behaviour", "Buyer Psychology", "Loss Aversion", "Social Proof", "Behavioral Economics", "Decision Journey"],
    careerRoles: ["Marketing Specialist", "UX Researcher", "Brand Strategist"],
    whyRecommended: "Understanding cognitive biases enables ethical persuasion and higher marketing conversion rates."
  }),
  createMarketingCourse({
    id: "mkt-104",
    title: "Market Research & Competitive Intelligence",
    subcategory: "Market Research",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Conduct primary and secondary research: survey design, customer interviews, TAM/SAM/SOM market sizing, Porter's Five Forces, and competitive benchmarking matrices.",
    skillsGained: ["Market Research", "TAM / SAM / SOM", "Competitive Analysis", "Survey Design", "Porter's Five Forces", "User Interviews"],
    careerRoles: ["Market Research Analyst", "Product Marketing Specialist", "Growth Strategist"],
    whyRecommended: "Accurate market sizing and competitor intelligence prevent launching products nobody wants."
  }),
  createMarketingCourse({
    id: "mkt-105",
    title: "Brand Management & Brand Equity Architecture",
    subcategory: "Brand Management",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Build enduring corporate brands: Keller's Brand Equity Model, Brand Identity Prism, brand architecture (House of Brands vs Branded House), and tone of voice guidelines.",
    skillsGained: ["Brand Management", "Brand Equity", "Keller's Model", "Brand Architecture", "Brand Guidelines", "Tone of Voice"],
    careerRoles: ["Brand Manager", "Marketing Communications Lead", "Creative Director"],
    whyRecommended: "Strong brand equity commands pricing power and lowers customer churn."
  }),
  createMarketingCourse({
    id: "mkt-106",
    title: "Digital Marketing Fundamentals & Multi-Channel Strategy",
    subcategory: "Digital Marketing",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Explore the modern digital marketing ecosystem: Owned vs Earned vs Paid media, full-funnel customer acquisition, digital channels, and conversion metrics (CTR, CPC, CPA, ROAS).",
    skillsGained: ["Digital Marketing", "Paid vs Owned vs Earned", "CTR / CPC / CPA / ROAS", "Multi-Channel Strategy", "Digital Funnels"],
    careerRoles: ["Digital Marketing Specialist", "Marketing Coordinator", "Growth Associate"],
    whyRecommended: "Essential introduction connecting all modern digital marketing channels and performance metrics."
  }),
  createMarketingCourse({
    id: "mkt-107",
    title: "Social Media Marketing & Organic Community Growth",
    subcategory: "Social Media",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Grow organic social channels: LinkedIn thought leadership, Instagram visual storytelling, YouTube video SEO, X thread hooks, content calendars, and community moderation.",
    skillsGained: ["Social Media Marketing", "Content Calendars", "Community Management", "Influencer Partnerships", "Social Analytics"],
    careerRoles: ["Social Media Specialist", "Community Manager", "Content Strategist"],
    whyRecommended: "Organic social media builds brand authority and drives zero-CAC customer trust."
  }),
  createMarketingCourse({
    id: "mkt-108",
    title: "Content Marketing & Inbound Lead Generation",
    subcategory: "Content Marketing",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Drive compounding inbound traffic: Pillar-and-Cluster content architecture, lead magnets, copywriting frameworks (AIDA, PAS), content distribution, and SEO blogging.",
    skillsGained: ["Content Marketing", "Pillar-and-Cluster", "Lead Magnets", "Copywriting (AIDA/PAS)", "Inbound Marketing", "Lead Nurturing"],
    careerRoles: ["Content Marketing Manager", "Inbound Marketing Lead", "Copywriter"],
    whyRecommended: "Inbound content marketing generates 3x more leads than traditional outbound marketing at 62% lower cost."
  }),
  createMarketingCourse({
    id: "mkt-109",
    title: "Search Engine Optimization (SEO) Masterclass",
    subcategory: "SEO",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master organic search rankings: On-Page SEO (search intent, internal linking), Technical SEO (XML sitemaps, robots.txt, Core Web Vitals, canonical tags, schema markup), and link building.",
    skillsGained: ["SEO", "Technical SEO", "On-Page SEO", "Off-Page SEO", "Schema Markup", "Core Web Vitals", "Keyword Research"],
    careerRoles: ["SEO Specialist", "SEO Manager", "Content Strategist"],
    whyRecommended: "Organic search engine traffic delivers compounding, high-intent customer acquisition with zero ongoing ad spend."
  }),
  createMarketingCourse({
    id: "mkt-110",
    title: "Search Engine Marketing (Google Ads & PPC Campaigns)",
    subcategory: "Paid Search",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master paid search marketing: Google Ads Search, Responsive Search Ads (RSAs), Quality Score optimization, Ad Rank formula, match types, negative keywords, and smart bidding.",
    skillsGained: ["Google Ads", "PPC", "Quality Score", "Ad Rank", "Keyword Match Types", "Negative Keywords", "Target ROAS Bidding"],
    careerRoles: ["PPC Specialist", "Google Ads Manager", "Performance Marketer"],
    whyRecommended: "Google Search Ads capture immediate transactional intent at the exact moment customers search."
  }),
  createMarketingCourse({
    id: "mkt-111",
    title: "Email Marketing, Automation & CRM (HubSpot & Klaviyo)",
    subcategory: "Email Marketing",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Design high-converting email lifecycle workflows: Welcome series, abandoned cart recovery, re-engagement campaigns, list segmentation, deliverability (SPF, DKIM, DMARC), and A/B testing.",
    skillsGained: ["Email Marketing", "Marketing Automation", "HubSpot / Klaviyo", "Email Deliverability", "SPF / DKIM / DMARC", "List Segmentation"],
    careerRoles: ["Email Marketing Specialist", "Lifecycle Marketing Manager", "CRM Manager"],
    whyRecommended: "Email marketing delivers the highest ROI of any digital channel ($36 return for every $1 spent)."
  }),
  createMarketingCourse({
    id: "mkt-112",
    title: "Marketing Analytics & Attribution Modeling (Google Analytics 4)",
    subcategory: "Marketing Analytics",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master Google Analytics 4 (GA4): Event-based data models, Google Tag Manager (GTM) custom triggers, conversion tracking, Exploration reports, and Multi-Touch Attribution models.",
    skillsGained: ["Google Analytics 4 (GA4)", "Google Tag Manager (GTM)", "Marketing Attribution", "Event Tracking", "Exploration Reports", "Conversion Rate"],
    careerRoles: ["Marketing Analytics Manager", "Performance Analyst", "Digital Strategist"],
    whyRecommended: "GA4 is the global standard for tracking user web behavior and measuring marketing attribution."
  }),
  createMarketingCourse({
    id: "mkt-113",
    title: "Performance Marketing & Paid Social (Meta Ads Manager)",
    subcategory: "Paid Social",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Scale customer acquisition with Meta Ads: Meta Conversions API (CAPI), Advantage+ campaigns, Custom Audiences, Lookalike Audiences, creative ad fatigue, and ROAS optimization.",
    skillsGained: ["Meta Ads Manager", "Conversions API (CAPI)", "Lookalike Audiences", "Ad Creative Fatigue", "Paid Social", "ROAS Optimization"],
    careerRoles: ["Performance Marketer", "Media Buyer", "Growth Marketer"],
    whyRecommended: "Meta Ads is the primary demand generation channel for direct-to-consumer and B2B growth."
  }),
  createMarketingCourse({
    id: "mkt-114",
    title: "Product Marketing (PMM) & Go-To-Market (GTM) Strategy",
    subcategory: "Product Marketing",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    description: "Launch products that win: Go-To-Market (GTM) launches, buyer persona research, sales enablement battlecards, competitive win-loss analysis, feature positioning, and pricing tier design.",
    skillsGained: ["Product Marketing", "Go-To-Market (GTM)", "Sales Enablement", "Battlecards", "Win-Loss Analysis", "Pricing Strategy"],
    careerRoles: ["Product Marketing Manager (PMM)", "Director of Product Marketing", "Growth Lead"],
    whyRecommended: "PMM connects product engineering with sales and customer acquisition channels."
  }),
  createMarketingCourse({
    id: "mkt-115",
    title: "Integrated Marketing Campaigns & Brand Growth Loops",
    subcategory: "Campaign Strategy",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "26 Hours",
    description: "Architect high-impact omnichannel marketing campaigns: Growth Loops (viral, content, paid loops), Media Mix Modeling (MMM), brand-performance integration, and annual CMO growth orchestration.",
    skillsGained: ["Growth Loops", "Integrated Marketing", "Media Mix Modeling", "Brand Performance", "Omnichannel Campaigns", "CMO Strategy"],
    careerRoles: ["VP of Marketing", "Chief Marketing Officer (CMO)", "Head of Growth"],
    whyRecommended: "Highest level strategic marketing leadership connecting brand equity with scalable performance growth loops."
  })
];
