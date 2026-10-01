/**
 * PREPRIA Course Curriculum Generator & Builder
 * Generates academic, multi-module course curricula with 7–12 modules per course,
 * 3–6 lessons per module, interactive checkpoints, practicals, capstones, and final exams.
 */

export const createLesson = ({
  id,
  title,
  type = "READING",
  duration = "12 min",
  durationMinutes = 12,
  requiredDurationSeconds = 60,
  objective,
  coreConcepts,
  realWorldExample,
  practicalExample,
  codeSnippet,
  codeExplanation,
  commonMistakes = [],
  takeaways = [],
  quiz = null,
  practicalTask = null
}) => {
  return {
    id,
    title,
    type,
    duration,
    durationMinutes,
    requiredDurationSeconds,
    required: true,
    objective: objective || `Master the foundational and practical mechanics of ${title}.`,
    content: coreConcepts || `In this lesson, we explore ${title} and its real-world implementation patterns across enterprise workflows.`,
    coreConcepts: coreConcepts || `Detailed architectural and operational principles of ${title}.`,
    realWorldExample: realWorldExample || `Enterprise applications leverage ${title} to ensure high reliability, scalability, and security.`,
    practicalExample: practicalExample || `Step-by-step implementation guide and verification workflow for ${title}.`,
    codeSnippet,
    codeExplanation,
    commonMistakes: commonMistakes.length > 0 ? commonMistakes : [
      "Skipping boundary condition checks and validation rules",
      "Failing to handle asynchronous errors and network timeouts",
      "Overlooking security isolation and access permissions"
    ],
    takeaways: takeaways.length > 0 ? takeaways : [
      `Always follow standardized best practices when implementing ${title}`,
      "Validate configurations across staging environments before production rollouts",
      "Monitor operational metrics and error rates continuously"
    ],
    quiz,
    practicalTask
  };
};

export const generateFinalAssessmentQuestions = (id, title, domain, existingQuestions = []) => {
  const base = [
    { id: `fa-${id}-1`, question: `What is the primary architectural principle emphasized in ${title}?`, options: ["Building modular, well-tested, and scalable solutions following industry best practices.", "Writing all logic in a single file to minimize imports.", "Avoiding abstractions to keep code simple.", "Using only deprecated APIs for backward compatibility."], correctIndex: 0, explanation: `${title} emphasizes modular, tested, and scalable architecture as a foundational principle.` },
    { id: `fa-${id}-2`, question: `How should error handling be implemented across ${title} workflows?`, options: ["Catch all errors silently and log nothing.", "Only handle errors in production, not in development.", "Implement structured error handling with proper logging, user-friendly messages, and recovery strategies.", "Let the browser/runtime handle all errors automatically."], correctIndex: 2, explanation: "Structured error handling with logging and recovery strategies ensures reliability and debuggability." },
    { id: `fa-${id}-3`, question: `What is the recommended testing strategy for ${title}?`, options: ["Write tests only after bugs are reported by users.", "Implement a testing pyramid with unit, integration, and end-to-end tests.", "Only write unit tests — integration tests are unnecessary.", "Testing is optional for experienced developers."], correctIndex: 1, explanation: "The testing pyramid provides comprehensive coverage at different levels of abstraction." },
    { id: `fa-${id}-4`, question: `When should performance optimization be considered in ${title}?`, options: ["Only after the application is deployed to production.", "Performance is not important for modern hardware.", "Only when users explicitly complain about slowness.", "During the design phase, measured throughout development, and monitored in production."], correctIndex: 3, explanation: "Performance should be considered from design through production with continuous monitoring." },
    { id: `fa-${id}-5`, question: `What is the role of documentation in professional ${domain} workflows?`, options: ["Comprehensive documentation ensures knowledge transfer, onboarding efficiency, and operational consistency.", "Documentation is only for junior developers.", "Documentation should only cover API endpoints.", "Written documentation is obsolete with modern IDEs."], correctIndex: 0, explanation: "Documentation is critical for team scalability, onboarding, and maintaining operational knowledge." },
    { id: `fa-${id}-6`, question: `How should security be approached in ${title}?`, options: ["Security should be an afterthought, added only if there's a breach.", "Security is only relevant for financial applications.", "Security should be integrated at every layer — from authentication to data encryption to access controls.", "Using HTTPS alone is sufficient for all security needs."], correctIndex: 2, explanation: "Defense-in-depth security integrates protections at every layer of the application stack." },
    { id: `fa-${id}-7`, question: `What is the best approach to managing technical debt in ${domain}?`, options: ["Ignore it — rewrites will eventually fix everything.", "Track, prioritize, and systematically address technical debt alongside feature development.", "Technical debt only applies to legacy systems.", "Refactoring should never be done once code is in production."], correctIndex: 1, explanation: "Systematic management of technical debt prevents accumulation and maintains development velocity." },
    { id: `fa-${id}-8`, question: `How should teams collaborate effectively on ${title} projects?`, options: ["Each developer should work in isolation to avoid conflicts.", "Only senior developers should review code.", "Pair programming is the only valid collaboration method.", "Use version control, code reviews, consistent coding standards, and regular communication."], correctIndex: 3, explanation: "Effective collaboration combines version control, reviews, standards, and communication." },
    { id: `fa-${id}-9`, question: `What is the importance of monitoring in production ${domain} systems?`, options: ["Continuous monitoring with alerting enables proactive issue detection and rapid incident response.", "Monitoring is only needed during initial deployment.", "Monitoring consumes too many resources to be practical.", "Log files alone are sufficient for production monitoring."], correctIndex: 0, explanation: "Production monitoring with alerting is essential for maintaining system reliability and SLAs." },
    { id: `fa-${id}-10`, question: `How should configuration management be handled in ${title}?`, options: ["Hardcode all values directly in the application source code.", "Configuration should be the same across all environments.", "Use environment-specific configuration with secrets management and version control.", "Store all configuration in a shared spreadsheet."], correctIndex: 2, explanation: "Environment-specific configuration with secrets management ensures security and flexibility." },
    { id: `fa-${id}-11`, question: `What is the recommended deployment strategy for ${domain} applications?`, options: ["Deploy only on Fridays to have the weekend to fix issues.", "Use automated CI/CD pipelines with staged rollouts and automated rollback capabilities.", "Manual FTP uploads are the most reliable deployment method.", "Deploy all changes at once in large batches for efficiency."], correctIndex: 1, explanation: "Automated CI/CD with staged rollouts minimizes risk and enables rapid, reliable deployments." },
    { id: `fa-${id}-12`, question: `Why are code reviews important in ${title} development?`, options: ["Code reviews are only needed for junior developers' code.", "Automated linting eliminates the need for code reviews.", "Code reviews slow down development and should be avoided.", "They catch bugs early, enforce standards, share knowledge, and improve code quality."], correctIndex: 3, explanation: "Code reviews provide multiple benefits beyond bug detection, including knowledge sharing and standards enforcement." },
    { id: `fa-${id}-13`, question: `How should data integrity be ensured in ${domain} systems?`, options: ["Validate data at every layer — input, business logic, and storage — with appropriate constraints.", "Data validation is only necessary at the database level.", "Trust that users will always provide valid data.", "Data integrity is only important for regulated industries."], correctIndex: 0, explanation: "Multi-layer validation ensures data integrity regardless of the input source." },
    { id: `fa-${id}-14`, question: `What is the role of automation in ${title}?`, options: ["Automation should replace all human decision-making.", "Only large organizations benefit from automation.", "Automation reduces repetitive tasks, minimizes human error, and enables consistent, scalable operations.", "Automation is too complex to justify the investment."], correctIndex: 2, explanation: "Automation provides consistent, scalable operations while freeing teams to focus on higher-value work." },
    { id: `fa-${id}-15`, question: `How should backward compatibility be managed in ${domain}?`, options: ["Breaking changes should be deployed without notice.", "Use versioning, deprecation notices, and migration guides to manage transitions smoothly.", "Backward compatibility is not important in agile development.", "Simply maintain all old versions forever."], correctIndex: 1, explanation: "Versioning with deprecation policies enables smooth transitions while maintaining trust with consumers." },
    { id: `fa-${id}-16`, question: `What principle should guide scalability decisions in ${title}?`, options: ["Always optimize for maximum scale from day one.", "Scalability is only relevant for companies with millions of users.", "Vertical scaling is always preferable to horizontal scaling.", "Design for current needs with clear extension points, then scale based on measured demand."], correctIndex: 3, explanation: "Pragmatic scalability design balances current needs with future growth based on measured demand." },
    { id: `fa-${id}-17`, question: `How should incidents be managed in production ${domain} environments?`, options: ["Follow a structured incident response process with blameless post-mortems and corrective actions.", "Blame the developer who caused the incident immediately.", "Only document incidents that cause revenue loss.", "Incidents should be handled by whoever notices them first, without process."], correctIndex: 0, explanation: "Blameless post-mortems with corrective actions improve system reliability and team culture." },
    { id: `fa-${id}-18`, question: `What is the significance of accessibility in ${title}?`, options: ["Accessibility only matters for government websites.", "Screen readers handle accessibility automatically.", "Accessibility ensures all users, including those with disabilities, can effectively use the product.", "Accessibility compliance is too expensive to implement."], correctIndex: 2, explanation: "Accessibility is both an ethical responsibility and a legal requirement that broadens the user base." },
    { id: `fa-${id}-19`, question: `How should knowledge transfer be handled in ${domain} teams?`, options: ["Knowledge should be kept by individual experts to maintain job security.", "Document processes, conduct knowledge sharing sessions, and maintain runbooks for operational continuity.", "Knowledge transfer is only needed when someone leaves the company.", "Verbal communication is sufficient for knowledge transfer."], correctIndex: 1, explanation: "Systematic knowledge transfer reduces bus-factor risk and ensures operational continuity." },
    { id: `fa-${id}-20`, question: `What is the final success criterion for mastering ${title}?`, options: ["Memorizing all syntax and API signatures.", "Passing all certification exams with perfect scores.", "Having 10+ years of experience in the field.", "Being able to independently design, implement, test, deploy, and maintain production-quality solutions."], correctIndex: 3, explanation: "True mastery is demonstrated by independently delivering production-quality solutions end-to-end." }
  ];

  return [...existingQuestions, ...base.filter(b => !existingQuestions.some(eq => eq.id === b.id))].slice(0, 20);
};

export const createModule = ({
  id,
  order,
  title,
  description,
  lessons = [],
  checkpointQuiz = null,
  externalResources = []
}) => {
  const moduleLessons = [...lessons];
  
  // If checkpoint quiz provided, ensure it is the final lesson in the module
  if (checkpointQuiz) {
    moduleLessons.push({
      id: `${id}-quiz`,
      title: `${title} — Checkpoint Assessment`,
      type: "QUIZ",
      duration: "10 min",
      durationMinutes: 10,
      requiredDurationSeconds: 30,
      required: true,
      passingScore: 70,
      objective: `Validate your conceptual and practical mastery of ${title}.`,
      content: `Test your understanding across all key topics covered in ${title}. A score of at least 70% is required to complete this module and unlock the next.`,
      quiz: checkpointQuiz
    });
  }

  return {
    id,
    order,
    title,
    description,
    items: moduleLessons,
    lessons: moduleLessons,
    externalResources
  };
};
