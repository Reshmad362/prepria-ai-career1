import { generateDomainModules } from './curriculumFactory';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const createFrontendCourse = ({
  id,
  title,
  subcategory,
  level = "Intermediate",
  duration = "8 Weeks",
  estimatedHours = "24 Hours",
  priority = "STANDARD",
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact
}) => ({
  id,
  title,
  category: "Frontend Engineering",
  subcategory,
  level,
  duration,
  estimatedHours,
  priority,
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact: careerImpact || { readinessBoost: "+10%", skillCoverageBoost: "+14%" },
  passingScore: 70,
  modules: generateDomainModules(id, title, "Frontend Engineering", subcategory),
  finalAssessment: {
    id: `${id}-final`,
    title: `${title} — Final Comprehensive Exam`,
    type: "FINAL_ASSESSMENT",
    duration: "30 min",
    passingScore: 70,
    description: `Demonstrate complete conceptual, architectural, and practical mastery of ${title}.`,
    questions: generateFinalAssessmentQuestions(id, title, "Frontend Engineering")
  },
  capstoneProject: {
    id: `${id}-proj`,
    title: `${title} — Production Capstone Application`,
    description: `Architect and deploy an enterprise-grade web application applying all principles mastered in ${title}.`,
    requirements: [
      "Implement fully accessible component architecture complying with WCAG 2.2 AA",
      "Achieve 95+ score on Google Lighthouse Web Vitals metrics",
      "Write automated integration tests covering critical user journeys"
    ],
    timeHours: "14 Hours",
    status: "Not Started"
  }
});

export const frontendCourses = [
  createFrontendCourse({
    id: "fe-101",
    title: "HTML5 & Web Fundamentals",
    subcategory: "Web Standards",
    level: "Beginner",
    duration: "4 Weeks",
    estimatedHours: "12 Hours",
    description: "Learn semantic HTML5 elements, accessibility tree construction, ARIA landmarks, SEO meta tags, and web document rendering mechanics.",
    skillsGained: ["HTML5", "Semantic HTML", "Web Accessibility", "SEO Meta Tags", "Form Validation"],
    careerRoles: ["Frontend Developer", "UI Developer", "Web Developer"],
    whyRecommended: "Foundational markup skills required for clean web development and SEO compliance."
  }),
  createFrontendCourse({
    id: "fe-102",
    title: "CSS3 Fundamentals & Responsive Design",
    subcategory: "Styling & Layout",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "16 Hours",
    description: "Master the CSS Box Model, Flexbox, CSS Grid layout systems, custom properties (variables), media queries, mobile-first design, and animations.",
    skillsGained: ["CSS3", "Flexbox", "CSS Grid", "Responsive Design", "CSS Variables", "Transitions & Animations"],
    careerRoles: ["Frontend Developer", "UI/UX Developer", "Web Designer"],
    whyRecommended: "Essential styling foundation for creating fluid responsive layouts on mobile, tablet, and desktop screens."
  }),
  createFrontendCourse({
    id: "fe-103",
    title: "JavaScript Fundamentals & Logic",
    subcategory: "JavaScript Core",
    level: "Beginner",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master JavaScript data types, scope (lexical, block, global), closures, arrays and higher-order functions (map, filter, reduce), control flow, and error handling.",
    skillsGained: ["JavaScript", "Higher-Order Functions", "Closures", "Array Methods", "Scope", "Error Handling"],
    careerRoles: ["Frontend Developer", "Full Stack Developer", "Software Engineer"],
    whyRecommended: "Core programming language powering modern web applications and UI frameworks."
  }),
  createFrontendCourse({
    id: "fe-104",
    title: "Modern JavaScript ES6+ & Async Programming",
    subcategory: "JavaScript Core",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Deep dive into ES modules, destructuring, rest/spread, Promises, async/await, the Event Loop, microtasks vs macrotasks, and fetch API.",
    skillsGained: ["ES6+", "Async/Await", "Promises", "Event Loop", "Microtasks", "Fetch API", "Modules"],
    careerRoles: ["Frontend Developer", "Full Stack Developer"],
    whyRecommended: "Essential asynchronous programming patterns for fetching API data and managing non-blocking UI interactions."
  }),
  createFrontendCourse({
    id: "fe-105",
    title: "DOM Manipulation & Modern Browser Web APIs",
    subcategory: "Browser APIs",
    level: "Intermediate",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Master direct DOM manipulation, event delegation, bubbling/capturing, IntersectionObserver, ResizeObserver, Web Storage, and Service Workers.",
    skillsGained: ["DOM Manipulation", "Event Delegation", "IntersectionObserver", "IndexedDB", "Web Storage", "Service Workers"],
    careerRoles: ["Frontend Developer", "Web Performance Engineer"],
    whyRecommended: "Understanding browser internals is crucial for high-performance UI optimization."
  }),
  createFrontendCourse({
    id: "fe-106",
    title: "Git & GitHub Workflows for Frontend Teams",
    subcategory: "Version Control",
    level: "Beginner",
    duration: "4 Weeks",
    estimatedHours: "12 Hours",
    description: "Learn version control tailored for UI teams: managing design tokens, resolving merge conflicts in package-lock.json, pull request reviews, and preview deployments.",
    skillsGained: ["Git", "GitHub PRs", "Merge Conflicts", "Vercel Previews", "npm package-lock"],
    careerRoles: ["Frontend Developer", "UI Engineer"],
    whyRecommended: "Collaborative Git practices tailored for frontend CI preview deployments."
  }),
  createFrontendCourse({
    id: "fe-107",
    title: "React Fundamentals & Component Architecture",
    subcategory: "React",
    level: "Beginner",
    duration: "7 Weeks",
    estimatedHours: "20 Hours",
    description: "Master React JSX syntax, functional components, props vs state, useState, useEffect lifecycles, conditional rendering, forms, and custom hooks.",
    skillsGained: ["React", "JSX", "useState", "useEffect", "Custom Hooks", "Component Design"],
    careerRoles: ["React Developer", "Frontend Developer", "Full Stack Developer"],
    whyRecommended: "React is the most widely demanded frontend framework worldwide."
  }),
  createFrontendCourse({
    id: "tech-101",
    title: "Advanced React.js & Next.js Patterns",
    subcategory: "Next.js & Architecture",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Master React 19 Server Components, Next.js App Router, atomic state management, server cache revalidation, and Web Vitals performance optimization.",
    skillsGained: ["React", "Next.js", "Server Components", "State Management", "TypeScript", "Performance", "Zustand"],
    careerRoles: ["Senior Frontend Developer", "Full Stack Developer", "UI Architect"],
    whyRecommended: "React and Next.js are foundational competencies for modern frontend and full-stack engineering tracks."
  }),
  createFrontendCourse({
    id: "fe-108",
    title: "React State Management (Zustand & Redux Toolkit)",
    subcategory: "State Management",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Compare global state solutions: Zustand atomic stores, Redux Toolkit slices, selectors, Immer immutability, middleware, and DevTools debugging.",
    skillsGained: ["Zustand", "Redux Toolkit", "State Management", "Selectors", "Immer", "Async Thunks"],
    careerRoles: ["React Developer", "Frontend Engineer", "Full Stack Developer"],
    whyRecommended: "Essential for managing complex enterprise state across large collaborative applications."
  }),
  createFrontendCourse({
    id: "fe-109",
    title: "TypeScript for Frontend Developers",
    subcategory: "TypeScript",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master TypeScript type safety in React: interfaces, union types, generics, utility types (Partial, Pick, Omit, Record), typing React props and events, and strict compiler configurations.",
    skillsGained: ["TypeScript", "Generics", "Type Narrowing", "React Props Typing", "Utility Types", "tsconfig"],
    careerRoles: ["Frontend Developer", "Full Stack Developer", "TypeScript Engineer"],
    whyRecommended: "TypeScript is standard in 90%+ of professional React codebases for compile-time safety."
  }),
  createFrontendCourse({
    id: "fe-110",
    title: "Next.js & Modern React Architecture",
    subcategory: "Next.js & Architecture",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    description: "Deep dive into Next.js App Router: Dynamic Route segments, Parallel Routes, Intercepting Routes, Server Actions, Middleware, SSG, and Edge Rendering.",
    skillsGained: ["Next.js", "Server Actions", "Parallel Routes", "Intercepting Routes", "Edge Runtime", "SSG / SSR"],
    careerRoles: ["Full Stack Developer", "Senior Frontend Developer", "Next.js Architect"],
    whyRecommended: "Next.js is the premier React production framework for modern full-stack web applications."
  }),
  createFrontendCourse({
    id: "fe-111",
    title: "Frontend Performance Optimization & Core Web Vitals",
    subcategory: "Performance",
    level: "Advanced",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Optimize Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS). Master bundle analysis, code splitting, dynamic imports, font optimization, and memory profiling.",
    skillsGained: ["Core Web Vitals", "LCP / INP / CLS", "Bundle Splitting", "Dynamic Imports", "Chrome DevTools Profiling", "Font Optimization"],
    careerRoles: ["Web Performance Engineer", "Senior Frontend Engineer"],
    whyRecommended: "Google uses Core Web Vitals for search rankings; fast sites drastically improve conversion rates."
  }),
  createFrontendCourse({
    id: "fe-112",
    title: "Frontend Testing with Jest & React Testing Library",
    subcategory: "Testing",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Write robust, maintainable tests: unit testing pure functions, integration testing React components with user-event, mocking API calls with Mock Service Worker (MSW), and End-to-End testing with Playwright.",
    skillsGained: ["Jest", "React Testing Library", "Mock Service Worker (MSW)", "Playwright", "Integration Testing", "TDD"],
    careerRoles: ["Frontend Developer", "QA Automation Engineer", "Full Stack Developer"],
    whyRecommended: "Automated testing guarantees that UI refactoring does not break critical user checkout flows."
  }),
  createFrontendCourse({
    id: "fe-113",
    title: "Web Accessibility (a11y) & Inclusive Design",
    subcategory: "Accessibility",
    level: "Intermediate",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Master WCAG 2.2 AA compliance standards, keyboard navigation (focus traps, roving tabindex), ARIA attributes, color contrast ratios, screen reader testing, and automated axe audits.",
    skillsGained: ["Web Accessibility", "WCAG 2.2", "ARIA", "Keyboard Navigation", "Screen Reader Testing", "axe-core"],
    careerRoles: ["Accessibility Specialist", "Frontend Developer", "UI Engineer"],
    whyRecommended: "Legal compliance (ADA/EAA) and ethical imperative ensuring applications work for all users."
  }),
  createFrontendCourse({
    id: "fe-114",
    title: "Advanced Frontend Architecture & Design Patterns",
    subcategory: "Architecture",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "26 Hours",
    description: "Architect scalable frontend applications: Micro-Frontends (Module Federation), Monorepos (Turborepo), Clean Architecture in UI, Design Token systems, and Enterprise State Orchestration.",
    skillsGained: ["Micro-Frontends", "Module Federation", "Turborepo", "Monorepos", "Clean Architecture", "Design Systems"],
    careerRoles: ["Staff Frontend Engineer", "Principal UI Architect", "Lead Software Engineer"],
    whyRecommended: "Prepares senior engineers to lead multi-team frontend architecture and monorepo scaling."
  })
];
