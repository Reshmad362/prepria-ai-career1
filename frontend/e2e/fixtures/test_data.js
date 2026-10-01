/**
 * PREPRIA Phase 21 — Deterministic E2E Test Fixtures
 * Explicitly labeled as test-only fixtures isolated from real user data.
 */

export const E2E_USER_A = {
  id: 'usr-e2e-cand-a',
  email: 'e2e_candidate_a@prepria.test',
  password: 'Password123!@#',
  name: 'Candidate Alpha (E2E Test)',
  role: 'candidate',
  targetRole: 'Full Stack Developer',
  extractedSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
  atsScore: 82
};

export const E2E_USER_B = {
  id: 'usr-e2e-cand-b',
  email: 'e2e_candidate_b@prepria.test',
  password: 'Password456!@#',
  name: 'Candidate Beta (E2E Test)',
  role: 'candidate',
  targetRole: 'DevOps Engineer',
  extractedSkills: ['Linux', 'Git', 'AWS'],
  atsScore: 68
};

export const E2E_COURSE_FIXTURE = {
  id: 'react-essentials',
  title: 'React 19 & Modern Frontend Architecture',
  lessonId: 'm1_l1',
  lessonTitle: '1.1 React 19 Core Fundamentals & Server Components',
  minDwellSeconds: 60
};

export const E2E_INTERVIEW_SESSION_FIXTURE = {
  id: 'sess-e2e-eval-01',
  role: 'Full Stack Developer',
  targetRole: 'Full Stack Developer',
  score: 85,
  overallScore: 85,
  dimensions: {
    technicalKnowledge: 85,
    problemSolving: 80,
    communication: 90,
    roleKnowledge: 85,
    confidence: 85
  },
  weakSkills: ['Docker', 'Microservices'],
  strongSkills: ['React', 'JavaScript'],
  questions: [
    {
      id: 'q1',
      question: 'Explain state management techniques in modern React 19.',
      topic: 'React State Management',
      userAnswer: 'I use useActionState, useOptimistic, and React Context or Redux Toolkit for complex global state trees.',
      score: 90,
      feedback: 'Excellent explanation of modern React 19 state patterns.'
    },
    {
      id: 'q2',
      question: 'How do you structure Docker multi-stage builds for container optimization?',
      topic: 'Docker Containerization',
      userAnswer: 'I need to review Docker multi-stage build patterns further.',
      score: 45,
      feedback: 'Candidate identified an area for improvement in container build optimization.'
    }
  ]
};
