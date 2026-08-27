/**
 * PREPRIA Career Opportunity Intelligence & Matching Engine
 * Connects job requirements with user resume, target career role, extracted skills,
 * skill gaps, 3-pillar readiness (Resume, Skills, Interview), and preparation paths.
 */

import { coursesData } from '../data/coursesData';

/**
 * Calculates genuine skill overlap, missing gaps, and explainable match breakdown
 */
export const calculateJobAnalysis = (job, {
  userSkills = [],
  targetRole = '',
  experienceLevel = 'Fresher',
  atsScore = 85,
  interviewScore = null,
  workPreference = 'Remote'
}) => {
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const allJobSkills = [...reqSkills, ...prefSkills];

  const userSkillsLower = new Set((userSkills || []).map(s => String(s).toLowerCase().trim()));

  const matchedSkills = [];
  const missingSkills = [];

  // Match required skills
  reqSkills.forEach(req => {
    const rLow = req.toLowerCase().trim();
    let isMatched = false;

    // Check exact or partial inclusion
    for (const uSkill of userSkillsLower) {
      if (
        uSkill === rLow ||
        uSkill.includes(rLow) ||
        rLow.includes(uSkill) ||
        uSkill.replace(/[^a-z0-9]/g, '') === rLow.replace(/[^a-z0-9]/g, '')
      ) {
        isMatched = true;
        break;
      }
    }

    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Calculate Base Match Percentage
  const skillRatio = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) : 0.5;
  let matchPercentage = Math.round(skillRatio * 100);

  // Apply Role Alignment Boost
  let roleAligned = false;
  if (targetRole) {
    const tr = targetRole.toLowerCase();
    const jt = (job.title || '').toLowerCase();
    const jc = (job.category || '').toLowerCase();
    const jd = (job.domain || '').toLowerCase();

    if (jt.includes(tr) || tr.includes(jt)) {
      matchPercentage += 6;
      roleAligned = true;
    } else if (tr.split(' ').some(w => w.length > 3 && jt.includes(w))) {
      matchPercentage += 4;
      roleAligned = true;
    } else if (jc.includes(tr) || jd.includes(tr)) {
      matchPercentage += 2;
      roleAligned = true;
    }
  }

  // Bound match percentage between realistic 35% and 98%
  matchPercentage = Math.max(35, Math.min(98, matchPercentage));

  // 3-Pillar Readiness Model
  const resumeReadiness = Math.round(Math.min(98, Math.max(50, (atsScore * 0.6) + (skillRatio * 40))));
  const skillsReadiness = Math.round(Math.min(98, Math.max(35, skillRatio * 100)));
  const interviewReadiness = interviewScore 
    ? Math.round(interviewScore)
    : Math.round(Math.min(95, Math.max(45, (skillsReadiness * 0.75) + 15)));

  const overallReadiness = Math.round(
    (resumeReadiness * 0.35) + (skillsReadiness * 0.45) + (interviewReadiness * 0.20)
  );

  // Explainable Checklist Breakdown
  const checklist = [];
  checklist.push({
    type: 'success',
    text: `${matchedSkills.length} of ${reqSkills.length} required skills matched`
  });

  const expAligned = (job.experienceLevel || '').toLowerCase().includes(experienceLevel.toLowerCase()) ||
    (experienceLevel === 'Fresher' && job.experienceLevel === 'Entry Level') ||
    (experienceLevel !== 'Fresher' && job.experienceLevel !== 'Entry Level');

  if (expAligned) {
    checklist.push({ type: 'success', text: `Experience level aligned (${job.experienceLevel})` });
  } else {
    checklist.push({ type: 'neutral', text: `Target role level: ${job.experienceLevel}` });
  }

  if (workPreference && (job.workType || '').toLowerCase() === workPreference.toLowerCase()) {
    checklist.push({ type: 'success', text: `Preferred work type matched (${job.workType})` });
  } else {
    checklist.push({ type: 'neutral', text: `Work type: ${job.workType}` });
  }

  if (missingSkills.length > 0) {
    checklist.push({ type: 'warning', text: `${missingSkills.slice(0, 2).join(' & ')} is a primary skill gap` });
  }

  // Dynamic AI Recommendation Text
  let aiRecommendation = '';
  if (missingSkills.length === 0) {
    aiRecommendation = `Outstanding match! Your profile demonstrates strong coverage across all ${matchedSkills.length} core competencies for this role. You are in a prime position to apply now.`;
  } else {
    const topGap = missingSkills[0];
    aiRecommendation = `Your resume matches ${matchedSkills.length} of the ${reqSkills.length} core skills required. Your strongest gap is ${topGap}. Closing this gap through focused preparation will increase your interview readiness from ${overallReadiness}% to ~${Math.min(98, overallReadiness + 8)}%.`;
  }

  // Map missing skills to relevant PREPRIA Courses
  const recommendedCourses = [];
  missingSkills.forEach(gap => {
    const gapLower = gap.toLowerCase();
    const matchedCourse = coursesData.find(c => {
      const titleLower = c.title.toLowerCase();
      const skillsLower = (c.skillsGained || []).map(s => s.toLowerCase());
      return titleLower.includes(gapLower) || skillsLower.some(s => s.includes(gapLower) || gapLower.includes(s));
    });

    if (matchedCourse && !recommendedCourses.some(rc => rc.id === matchedCourse.id)) {
      recommendedCourses.push({
        courseId: matchedCourse.id,
        courseTitle: matchedCourse.title,
        skillGap: gap,
        estimatedReadinessBoost: "+6%",
        duration: matchedCourse.duration || "4 Weeks"
      });
    }
  });

  // Action Recommendation Tier
  let recommendedActionTier = 'HIGH_MATCH'; // 'HIGH_MATCH' | 'PREPARE_AND_APPLY' | 'PREPARE_FIRST'
  if (matchPercentage >= 80 && overallReadiness >= 75) {
    recommendedActionTier = 'HIGH_MATCH';
  } else if (matchPercentage >= 60 || overallReadiness >= 65) {
    recommendedActionTier = 'PREPARE_AND_APPLY';
  } else {
    recommendedActionTier = 'PREPARE_FIRST';
  }

  return {
    matchScore: matchPercentage,
    matchedSkills,
    missingSkills,
    totalRequired: reqSkills.length,
    checklist,
    readiness: {
      resume: resumeReadiness,
      skills: skillsReadiness,
      interview: interviewReadiness,
      overall: overallReadiness
    },
    aiRecommendation,
    recommendedCourses: recommendedCourses.slice(0, 3),
    recommendedActionTier
  };
};

/**
 * Storage Helpers for Tracked / Saved Applications
 */
export const getTrackedJobs = (email = 'guest') => {
  try {
    const stored = localStorage.getItem(`tracked_jobs_${email}`);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {}; // { [jobId]: { status: 'Saved' | 'Applied' | 'Interview' | 'Offer', savedAt: '...', notes: '...' } }
};

export const updateJobTrackingStatus = (jobId, status, email = 'guest', metadata = {}) => {
  try {
    const current = getTrackedJobs(email);
    if (!status) {
      delete current[jobId];
    } else {
      current[jobId] = {
        ...(current[jobId] || {}),
        status,
        updatedAt: new Date().toISOString(),
        ...metadata
      };
    }
    localStorage.setItem(`tracked_jobs_${email}`, JSON.stringify(current));
    window.dispatchEvent(new Event("jobTrackingUpdated"));
    return current;
  } catch (e) {
    console.error("Failed to update job tracking status:", e);
    return {};
  }
};
