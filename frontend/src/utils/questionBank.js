// questionBank.js

const QUESTION_BANK = {
  technical: [
    { type: "Technical", focus: "Architecture", text: "Can you describe a time when you had to design a scalable architecture from scratch?" },
    { type: "Technical", focus: "Debugging", text: "Walk me through your debugging process when you encounter a critical bug in production." },
    { type: "Technical", focus: "Optimization", text: "How do you approach optimizing the performance of an application?" },
    { type: "Technical", focus: "Code Quality", text: "In your opinion, what are the most important practices for maintaining clean, readable codebase?" }
  ],
  behavioral: [
    { type: "Behavioral", focus: "Conflict", text: "Tell me about a time you had a disagreement with a team member. How did you resolve it?" },
    { type: "Behavioral", focus: "Leadership", text: "Describe a situation where you had to take lead on a project with little to no guidance." },
    { type: "Behavioral", focus: "Failure", text: "Can you share an experience where a project you were working on failed? What did you learn?" }
  ],
  scenario: [
    { type: "Scenario", focus: "Deadlines", text: "You have two days left until a major deadline and a critical feature breaks. What do you do?" },
    { type: "Scenario", focus: "Prioritization", text: "Imagine you're given three high-priority tasks by different managers. How do you decide what to work on first?" }
  ]
};

export const generateLocalQuestions = (role, difficulty, count = 5) => {
  // Combine all categories to create a varied interview
  const available = [
    ...QUESTION_BANK.technical,
    ...QUESTION_BANK.behavioral,
    ...QUESTION_BANK.scenario
  ];
  
  // Shuffle array simply
  const shuffled = available.sort(() => 0.5 - Math.random());
  
  // Pick requested amount
  const selected = shuffled.slice(0, count);
  
  // Map to the structure expected by InterviewScreen
  return selected.map(q => ({
    question: q.text,
    type: q.type,
    difficulty: difficulty || 'medium'
  }));
};
