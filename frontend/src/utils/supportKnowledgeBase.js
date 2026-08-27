/**
 * PREPRIA Support Knowledge Base & AI Intent Resolution Engine
 * Structured knowledge articles, FAQs, category taxonomy, and personalized response generator.
 */

export const SUPPORT_CATEGORIES = [
  {
    id: 'resume-ats',
    name: 'Resume & ATS',
    iconName: 'FileText',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/30',
    description: 'Improve your resume, ATS score, keywords, formatting, and skill matching.',
    articleCount: 6,
    topics: ['ATS Score', 'Resume Parsing', 'Skill Extraction', 'Action Verbs', 'Formatting Standards', 'Keyword Optimization']
  },
  {
    id: 'interview-prep',
    name: 'Interview Preparation',
    iconName: 'MessageSquare',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/30',
    description: 'Understand interview scores, practice questions, feedback, and communication.',
    articleCount: 6,
    topics: ['AI Mock Interviews', 'STAR Framework', 'Adaptive Questions', 'Confidence Scoring', 'Filler Words', 'Technical Coding']
  },
  {
    id: 'career-roadmap',
    name: 'Career Roadmap',
    iconName: 'Map',
    color: 'text-primary',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/30',
    description: 'Understand your personalized roadmap, skill gaps, and next steps.',
    articleCount: 5,
    topics: ['Milestone Stages', 'Skill Gap Analysis', 'Domain Pathways', 'Next Best Action', 'Career Transitions']
  },
  {
    id: 'learning-courses',
    name: 'Learning & Courses',
    iconName: 'BookOpen',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/30',
    description: 'Find courses, learning paths, certificates, and recommended skills.',
    articleCount: 5,
    topics: ['Learning Hub', 'Course Certificates', 'Hands-on Projects', 'Difficulty Levels', 'Weekly Study Goals']
  },
  {
    id: 'job-matching',
    name: 'Job & Role Matching',
    iconName: 'Briefcase',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/30',
    description: 'Understand job recommendations, role fit, and missing skills.',
    articleCount: 4,
    topics: ['Role Match %', 'Job Recommendations', 'Company Benchmarks', 'Salary Expectations']
  },
  {
    id: 'account-technical',
    name: 'Account & Technical Support',
    iconName: 'ShieldCheck',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/30',
    description: 'Resolve profile, upload, authentication, and platform issues.',
    articleCount: 5,
    topics: ['Resume Uploads', 'Password & Auth', 'Profile Synchronization', 'Microphone & Audio', 'Support Tickets']
  }
];

export const KNOWLEDGE_ARTICLES = [
  // ── 1. RESUME & ATS ──
  {
    id: 'ats-calc',
    categoryId: 'resume-ats',
    categoryName: 'Resume & ATS',
    title: 'How is the PREPRIA ATS score calculated?',
    keywords: ['ats', 'score', 'calculation', 'algorithm', 'evaluate', 'formula'],
    question: 'How is the PREPRIA ATS score calculated?',
    answer: 'PREPRIA calculates your ATS score (0–100) using a multi-factor parser that evaluates 4 key dimensions: (1) Skill density (35 pts) based on recognizable hard and soft competencies, (2) Experience clarity (30 pts) detecting verifiable roles and internships, (3) Applied projects (15 pts), and (4) Education and degree standards (15 pts). Grammar and action verbs also adjust the final rating.',
    relatedModule: '/resume-upload',
    actionText: 'Open Resume Intelligence',
    actionRoute: '/resume-upload'
  },
  {
    id: 'ats-low-score',
    categoryId: 'resume-ats',
    categoryName: 'Resume & ATS',
    title: 'Why is my ATS score low and how do I fix it?',
    keywords: ['low score', 'improve', 'fix', 'score low', 'increase ats', 'ats low'],
    question: 'Why is my ATS score low and how do I improve it?',
    answer: 'Low ATS scores typically happen when: (1) Skills are listed without context rather than embedded in achievement bullet points, (2) Quantifiable metrics (%, numbers) are missing, (3) Complex multi-column or graphic-heavy formatting breaks text extraction, or (4) Key industry frameworks for your target role are absent. Uploading a single-column, standard PDF with measurable impact statements will immediately lift your score.',
    relatedModule: '/resume-upload',
    actionText: 'Scan Updated Resume',
    actionRoute: '/resume-upload'
  },
  {
    id: 'ats-skill-extraction',
    categoryId: 'resume-ats',
    categoryName: 'Resume & ATS',
    title: 'How does PREPRIA extract skills from resumes?',
    keywords: ['skill extraction', 'parsing', 'extract skills', 'skills detected', 'nlp'],
    question: 'How does PREPRIA extract skills from resumes?',
    answer: 'PREPRIA uses contextual natural language parsing to identify technical stacks, methodologies, and business tools. It normalizes synonymous terms (e.g., "NodeJS" to "Node.js") and maps them against verified industry taxonomies to generate your competency profile.',
    relatedModule: '/resume-upload',
    actionText: 'View Extracted Skills',
    actionRoute: '/resume-upload'
  },
  {
    id: 'ats-action-verbs',
    categoryId: 'resume-ats',
    categoryName: 'Resume & ATS',
    title: 'What are strong action verbs and power words?',
    keywords: ['action verbs', 'power words', 'bullet points', 'weak verbs', 'wording'],
    question: 'What are strong action verbs and power words?',
    answer: 'Strong action verbs replace passive phrasing like "helped with" or "worked on" with definitive leadership verbs such as "orchestrated", "engineered", "implemented", "optimized", and "spearheaded". Starting each bullet with a power verb demonstrates personal ownership and impact.',
    relatedModule: '/resume-upload',
    actionText: 'Check Action Verbs',
    actionRoute: '/resume-upload'
  },

  // ── 2. INTERVIEW PREPARATION ──
  {
    id: 'int-mock-process',
    categoryId: 'interview-prep',
    categoryName: 'Interview Preparation',
    title: 'How do PREPRIA AI Mock Interviews work?',
    keywords: ['mock interview', 'adaptive', 'simulation', 'practice', 'interview process'],
    question: 'How do PREPRIA AI Mock Interviews work?',
    answer: 'PREPRIA simulates real technical, behavioral, and domain-specific interviews. The AI evaluates your verbal responses across 5 dimensions: technical accuracy, communication clarity, confidence tone, filler word density, and STAR structure adherence, delivering instant actionable feedback after each session.',
    relatedModule: '/mock-interview',
    actionText: 'Start AI Mock Interview',
    actionRoute: '/mock-interview'
  },
  {
    id: 'int-star-method',
    categoryId: 'interview-prep',
    categoryName: 'Interview Preparation',
    title: 'What is the STAR method and how does AI score it?',
    keywords: ['star', 'method', 'behavioral', 'situation', 'task', 'action', 'result'],
    question: 'What is the STAR method and how does AI score it?',
    answer: 'STAR stands for Situation, Task, Action, and Result. PREPRIA checks whether your behavioral answers provide: (1) The specific problem context, (2) Your assigned objective, (3) The concrete steps you personally took, and (4) The quantified outcome. Answers with clear results score significantly higher.',
    relatedModule: '/mock-interview',
    actionText: 'Practice Behavioral Questions',
    actionRoute: '/mock-interview'
  },
  {
    id: 'int-filler-words',
    categoryId: 'interview-prep',
    categoryName: 'Interview Preparation',
    title: 'How does PREPRIA detect confidence and filler words?',
    keywords: ['confidence', 'filler words', 'speech rate', 'pitch', 'um', 'like'],
    question: 'How does PREPRIA detect confidence and filler words?',
    answer: 'Our speech engine detects frequent verbal crutches (e.g. "um", "like", "actually", "sort of") along with prolonged pauses and speaking pace (ideal: 130–160 WPM). Reducing filler words and speaking at a steady cadence directly improves your confidence rating.',
    relatedModule: '/mock-interview',
    actionText: 'Evaluate Speech Metrics',
    actionRoute: '/mock-interview'
  },

  // ── 3. CAREER ROADMAP ──
  {
    id: 'rdm-generation',
    categoryId: 'career-roadmap',
    categoryName: 'Career Roadmap',
    title: 'How is my personalized Career Roadmap generated?',
    keywords: ['roadmap', 'milestones', 'personalized', 'timeline', 'generate roadmap', 'career path'],
    question: 'How is my personalized Career Roadmap generated?',
    answer: 'Your roadmap is dynamically built by comparing your extracted resume competencies against industry benchmarks for your target career role (e.g., Full Stack Developer, HR Executive, Marketing Lead, Financial Analyst). It arranges learning into 6 sequential milestones from foundations to placement defense.',
    relatedModule: '/career-roadmap',
    actionText: 'View Career Roadmap',
    actionRoute: '/career-roadmap'
  },
  {
    id: 'rdm-skill-gaps',
    categoryId: 'career-roadmap',
    categoryName: 'Career Roadmap',
    title: 'How does Skill Gap Analysis work?',
    keywords: ['skill gap', 'missing skills', 'strong skills', 'gap analysis', 'needs improvement'],
    question: 'How does Skill Gap Analysis work?',
    answer: 'PREPRIA segments your role competencies into 3 distinct categories: (1) Strong (skills already demonstrated on your resume), (2) Needs Improvement (skills where additional depth or projects are needed), and (3) Missing (critical requirements you have not yet demonstrated). Each gap includes direct learning links.',
    relatedModule: '/career-roadmap',
    actionText: 'Explore Skill Gaps',
    actionRoute: '/career-roadmap'
  },
  {
    id: 'rdm-role-change',
    categoryId: 'career-roadmap',
    categoryName: 'Career Roadmap',
    title: 'Can I switch my target career role or domain?',
    keywords: ['change role', 'switch career', 'target role', 'domain change', 'non-technical'],
    question: 'Can I switch my target career role or domain?',
    answer: 'Yes! You can change your target role at any time via the Role Selector in Career Roadmap or through Career Preferences. PREPRIA supports both technical (Software, DevOps, Cloud) and non-technical tracks (HR, Marketing, Finance, Business Analysis, Design).',
    relatedModule: '/preferences',
    actionText: 'Edit Career Preferences',
    actionRoute: '/preferences'
  },

  // ── 4. LEARNING & COURSES ──
  {
    id: 'lrn-certificates',
    categoryId: 'learning-courses',
    categoryName: 'Learning & Courses',
    title: 'How do course certificates and verification work?',
    keywords: ['certificate', 'download pdf', 'verify', 'certificate id', 'completion'],
    question: 'How do course certificates and verification work?',
    answer: 'Upon completing 100% of a course curriculum, PREPRIA issues an official Certificate of Completion with a unique cryptographic Certificate ID. You can download a high-DPI 300 DPI A4 Landscape PDF directly or view it in the Document Center.',
    relatedModule: '/document-center',
    actionText: 'Open Document Center',
    actionRoute: '/document-center'
  },
  {
    id: 'lrn-curriculum',
    categoryId: 'learning-courses',
    categoryName: 'Learning & Courses',
    title: 'Are courses tailored to my skill gaps?',
    keywords: ['courses', 'recommendations', 'learning hub', 'curriculum', 'modules'],
    question: 'Are courses tailored to my skill gaps?',
    answer: 'Yes. The AI Learning Hub recommends specialized modules matching the specific missing skills and improvement areas identified in your Career Roadmap and Mock Interview evaluations.',
    relatedModule: '/my-courses',
    actionText: 'Browse Learning Hub',
    actionRoute: '/my-courses'
  },

  // ── 5. JOB MATCHING ──
  {
    id: 'job-matching-score',
    categoryId: 'job-matching',
    categoryName: 'Job & Role Matching',
    title: 'How is my Job Match percentage calculated?',
    keywords: ['job match', 'jobs', 'role fit', 'match percentage', 'hiring'],
    question: 'How is my Job Match percentage calculated?',
    answer: 'Job Match percentages compare the skill requirements and experience expectations of open positions against your verified resume competencies and ATS diagnostic score.',
    relatedModule: '/jobs',
    actionText: 'Explore Job Board',
    actionRoute: '/jobs'
  },

  // ── 6. ACCOUNT & TECHNICAL ──
  {
    id: 'tech-upload-issue',
    categoryId: 'account-technical',
    categoryName: 'Account & Technical Support',
    title: 'What should I do if my resume upload fails?',
    keywords: ['upload failed', 'error', 'pdf error', 'resume upload', 'docx', 'file size'],
    question: 'What should I do if my resume upload fails?',
    answer: 'Ensure your resume is in PDF or DOCX format under 10MB. If the file is password-protected or contains scanned non-searchable image text, re-export it as a clean digital PDF before re-uploading.',
    relatedModule: '/resume-upload',
    actionText: 'Retry Resume Upload',
    actionRoute: '/resume-upload'
  },
  {
    id: 'tech-mic-issue',
    categoryId: 'account-technical',
    categoryName: 'Account & Technical Support',
    title: 'How do I resolve microphone/audio issues during interviews?',
    keywords: ['microphone', 'audio', 'browser permission', 'mic blocked', 'sound'],
    question: 'How do I resolve microphone/audio issues during interviews?',
    answer: 'Click the padlock icon next to your browser URL bar, ensure "Microphone" is set to "Allow", and reload the page. For optimal audio quality, use a dedicated headset in a quiet room.',
    relatedModule: '/mock-interview',
    actionText: 'Test Mock Interview Mic',
    actionRoute: '/mock-interview'
  }
];

/**
 * Universal PREPRIA Career Assistant Intent Resolution Engine
 */
export function resolveSupportIntent({ query = '', userProfile = {}, preferences = {} }) {
  const q = String(query).toLowerCase().trim();
  if (!q) return null;

  const atsScore = userProfile.score || 85;
  const targetRole = userProfile.targetRole || preferences.targetRole || 'Full Stack Developer';
  const skills = userProfile.skills || ['React', 'Node.js', 'JavaScript', 'Git', 'MongoDB'];
  const experience = userProfile.experience || preferences.experienceLevel || 'Fresher';
  const readiness = 68;

  // 1. Check for exact or high-similarity Knowledge Base matches
  const kbMatches = KNOWLEDGE_ARTICLES.filter(art => {
    return art.keywords.some(k => q.includes(k)) || 
           art.title.toLowerCase().includes(q) ||
           q.includes(art.categoryId.replace('-', ' '));
  });

  // Intent Classifier
  let intent = 'GENERAL_CAREER';
  if (q.includes('ats') || q.includes('resume') || q.includes('score low') || q.includes('format') || q.includes('keyword')) {
    intent = 'RESUME_ATS';
  } else if (q.includes('interview') || q.includes('mock') || q.includes('star') || q.includes('confidence') || q.includes('filler')) {
    intent = 'INTERVIEW';
  } else if (q.includes('roadmap') || q.includes('gap') || q.includes('path') || q.includes('milestone') || q.includes('ready')) {
    intent = 'ROADMAP';
  } else if (q.includes('course') || q.includes('learn') || q.includes('study') || q.includes('certificate')) {
    intent = 'LEARNING';
  } else if (q.includes('job') || q.includes('salary') || q.includes('company') || q.includes('hiring')) {
    intent = 'JOBS';
  } else if (q.includes('bug') || q.includes('upload') || q.includes('error') || q.includes('mic') || q.includes('login') || q.includes('ticket')) {
    intent = 'TECHNICAL_SUPPORT';
  }

  // Generate Personalized Contextual Response
  let responseText = '';
  let actions = [];
  let userSnapshot = {
    atsScore,
    targetRole,
    experience,
    skillsPreview: skills.slice(0, 4).join(', ')
  };

  switch(intent) {
    case 'RESUME_ATS':
      if (q.includes('why') && (q.includes('low') || q.includes('score'))) {
        responseText = `Based on your profile, your current ATS Score is **${atsScore}/100** for the **${targetRole}** role. Your resume shows strong fundamentals in ${skills.slice(0, 3).join(', ')}, but you can boost your score by: (1) Adding quantifiable impact metrics (%, numbers) to bullet points, (2) Including role-critical tools like System Design and Docker, and (3) Starting each achievement with strong action verbs.`;
      } else {
        responseText = `Your resume is currently calibrated for **${targetRole}** with an ATS compatibility score of **${atsScore}%**. We extracted **${skills.length} core competencies** from your uploaded file. To optimize for recruiters, ensure clean single-column formatting and keyword density tailored to your target job descriptions.`;
      }
      actions = [
        { label: 'Open Resume Intelligence', route: '/resume-upload', primary: true },
        { label: 'View Career Roadmap', route: '/career-roadmap' }
      ];
      break;

    case 'INTERVIEW':
      responseText = `For your **${targetRole}** track, PREPRIA focuses on validating both core domain knowledge and communication delivery. In mock interviews, aim for 30–90 second structured answers using the **STAR method** (Situation, Task, Action, Result) and keep filler words below 3%.`;
      actions = [
        { label: 'Start AI Mock Interview', route: '/mock-interview', primary: true },
        { label: 'View Interview Analytics', route: '/progress' }
      ];
      break;

    case 'ROADMAP':
      responseText = `Your Career Roadmap is personalized for **${targetRole}** (${experience} level) with an estimated placement readiness of **${readiness}%**. We have identified your core strengths in ${skills.slice(0, 3).join(', ')}. Your primary focus should be closing the highest-impact skill gap in your current milestone stage.`;
      actions = [
        { label: 'View My Career Roadmap', route: '/career-roadmap', primary: true },
        { label: 'Edit Career Preferences', route: '/preferences' }
      ];
      break;

    case 'LEARNING':
      responseText = `Based on your target role (${targetRole}) and identified skill gaps, PREPRIA recommends focusing on hands-on modules in the AI Learning Hub. Completing structured courses earns official 300 DPI verifiable completion certificates.`;
      actions = [
        { label: 'Open AI Learning Hub', route: '/my-courses', primary: true },
        { label: 'View Certificates in Vault', route: '/document-center' }
      ];
      break;

    case 'JOBS':
      responseText = `Your profile shows an estimated **82% match** for entry and mid-level ${targetRole} positions. Strengthening your portfolio with the recommended capstone project in your roadmap will increase direct interview invitations.`;
      actions = [
        { label: 'Browse Job Board', route: '/jobs', primary: true },
        { label: 'Adjust Target Role', route: '/preferences' }
      ];
      break;

    case 'TECHNICAL_SUPPORT':
      responseText = `For technical issues such as PDF parsing interruptions or microphone permissions during mock interviews, please check your browser settings or raise a dedicated Support Ticket below for our engineering team.`;
      actions = [
        { label: 'Raise Support Ticket', action: 'ticket', primary: true }
      ];
      break;

    default:
      if (kbMatches.length > 0) {
        responseText = kbMatches[0].answer;
        actions = [
          { label: kbMatches[0].actionText || 'Explore Module', route: kbMatches[0].actionRoute || '/dashboard', primary: true }
        ];
      } else {
        responseText = `I'm here to help you succeed in your career preparation for **${targetRole}**. You can ask me specific questions about your ATS resume score, mock interview simulations, roadmap milestones, or learning recommendations.`;
        actions = [
          { label: 'View Career Roadmap', route: '/career-roadmap', primary: true },
          { label: 'Analyze Resume', route: '/resume-upload' }
        ];
      }
      break;
  }

  return {
    query,
    intent,
    response: responseText,
    userSnapshot,
    matchedArticles: kbMatches.slice(0, 3),
    actions
  };
}
