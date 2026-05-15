// interviewEngine.js
// Universal Career Intelligence System for Technical & Non-Technical Roles

const ROLE_DEFINITIONS = [
  // TECH ROLES
  {
    name: "Full Stack Developer",
    domain: "technical",
    category: "web",
    coreSkills: ["react", "node", "express", "mongodb", "javascript", "typescript", "fullstack", "aws"],
    softSkills: ["problem solving", "leadership", "communication"]
  },
  {
    name: "Data Scientist",
    domain: "technical",
    category: "data",
    coreSkills: ["python", "ml", "pandas", "machine learning", "data science", "ai", "sql", "statistics"],
    softSkills: ["analytical thinking", "communication"]
  },
  {
    name: "Frontend Engineer",
    domain: "technical",
    category: "web",
    coreSkills: ["react", "vue", "angular", "css", "html", "javascript", "tailwind", "ui/ux"],
    softSkills: ["problem solving", "creativity"]
  },

  // NON-TECH ROLES
  {
    name: "Cabin Crew / Air Hostess",
    domain: "non-technical",
    category: "aviation",
    coreSkills: ["customer service", "communication", "safety awareness", "hospitality", "travel"],
    softSkills: ["confidence", "grooming", "adaptability", "empathy"]
  },
  {
    name: "HR Executive",
    domain: "non-technical",
    category: "business",
    coreSkills: ["recruitment", "people management", "onboarding"],
    softSkills: ["communication", "empathy", "listening"]
  },
  {
    name: "Sales Executive",
    domain: "non-technical",
    category: "business",
    coreSkills: ["negotiation", "client handling", "b2b", "sales"],
    softSkills: ["confidence", "persuasion", "communication"]
  },
  {
    name: "Teacher",
    domain: "non-technical",
    category: "education",
    coreSkills: ["subject knowledge", "lesson planning", "mentoring"],
    softSkills: ["communication", "patience", "leadership"]
  },
  {
    name: "Financial Analyst",
    domain: "non-technical",
    category: "finance",
    coreSkills: ["reconciliation", "finance", "excel", "vlookup", "accounting", "banking"],
    softSkills: ["analytical thinking", "attention to detail", "communication"]
  }
];

export const detectUserDomain = (user) => {
  const techCount = user.technicalSkills?.length || 0;
  const softCount = user.softSkills?.length || 0;
  
  if (techCount === 0 && softCount === 0) return "mixed";
  if (techCount > softCount) return "technical";
  if (softCount > techCount) return "non-technical";
  return "mixed";
};

const calculateScore = (user, role) => {
  let score = 0;
  const techSkills = user.technicalSkills || [];
  const softSkills = user.softSkills || [];
  
  // Combine extracted array strings safely
  const combinedUserSkills = [...techSkills, ...softSkills].map(s => s.toLowerCase());

  role.coreSkills.forEach(skill => {
    // Exact or partial subset check
    if (combinedUserSkills.some(s => s.includes(skill) || skill.includes(s))) {
      score += 15;
    }
  });

  role.softSkills.forEach(skill => {
    if (combinedUserSkills.some(s => s.includes(skill) || skill.includes(s))) {
      score += 10;
    }
  });

  return score;
};

export const suggestRoles = (profile) => {
  const prefs = profile?.preferences || JSON.parse(localStorage.getItem('userPreferences') || '{}');
  
  // Create an artificial User object combining extracted Profile data and Preferences
  const techStackPref = (prefs.techStack || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s);
  
  // Fallbacks map natively extracted skills if technical/soft categories aren't present yet on older resumes
  const rawSkills = profile?.skills || [];
  
  // Map older raw skills heuristics if necessary
  const pseudoTech = profile?.technicalSkills || rawSkills.filter(s => ['react','node','python','excel','sql','java'].some(k => s.toLowerCase().includes(k)));
  const pseudoSoft = profile?.softSkills || rawSkills.filter(s => ['communication','leadership','management','confidence','empathy'].some(k => s.toLowerCase().includes(k)));

  const user = {
    technicalSkills: [...new Set([...pseudoTech, ...techStackPref])],
    softSkills: pseudoSoft
  };

  const domain = detectUserDomain(user);
  const targetRole = prefs.targetRole;

  let scored = ROLE_DEFINITIONS.map(role => ({
    ...role,
    title: role.name, // compatibility
    score: calculateScore(user, role),
    match: Math.min(95, calculateScore(user, role) + 30) // normalized map to match % expected by UI
  }));

  // Special Handling (Aviation / Air Hostess Scenario)
  const userSoftStr = user.softSkills.map(s => s.toLowerCase());
  if (userSoftStr.includes("communication") && userSoftStr.includes("customer service")) {
    const aviationIndex = scored.findIndex(r => r.name === "Cabin Crew / Air Hostess");
    if (aviationIndex !== -1) {
      scored[aviationIndex].score += 30; // Boost aviation
      scored[aviationIndex].match = 95;
    }
  }

  // Filter & Sort
  scored = scored
    .filter(role => role.score > 0 || (user.technicalSkills.length === 0 && user.softSkills.length === 0))
    .sort((a, b) => b.score - a.score);

  // If no skills whatsoever
  if (user.technicalSkills.length === 0 && user.softSkills.length === 0 && !targetRole) {
    scored[0].match = 85; 
    scored[1].match = 70;
    scored[2].match = 65;
  }

  // Handle explicit targetRole overriding top slot
  if (targetRole) {
    const existingIndex = scored.findIndex(r => r.title.toLowerCase() === targetRole.toLowerCase());
    if (existingIndex !== -1) {
      const tr = scored.splice(existingIndex, 1)[0];
      tr.match = 95;
      scored.unshift(tr);
    } else {
      scored.unshift({ title: targetRole, category: 'custom', domain: 'mixed', match: 95, coreSkills: techStackPref, softSkills: ['Goal-oriented'] });
    }
  }

  // Format explicitly for the UI (inject fallback `.skills` array mapping for the UI badges)
  const formatted = scored.map(r => ({
    ...r,
    skills: [...(r.coreSkills || []), ...(r.softSkills || [])].slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1))
  }));

  const topMatches = formatted.slice(0, 4).map((r, idx) => ({ ...r, highlight: idx === 0 }));
  return topMatches;
};
