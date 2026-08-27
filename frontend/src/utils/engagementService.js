/**
 * PREPRIA Centralized Engagement & Course Progression Engine
 * Enforces authentic lesson completion, module passing rules, quiz scores,
 * final assessments, and certificate eligibility.
 *
 * Progress is dual-persisted: localStorage (instant) + backend (durable, survives logout).
 * On CoursePlayer mount, backend progress is fetched and merged so logout→login
 * progress is fully restored.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Required study duration per lesson ──────────────────────────────────────
// Set to 60 seconds for a realistic yet testable experience.
// In a production deployment, raise to 600 (10 min) per lesson.
export const DEFAULT_REQUIRED_DURATION_SECONDS = 60;

// ─── Activity recording ───────────────────────────────────────────────────────

export const recordLearningActivity = async ({
  activityType,
  title,
  durationMinutes = 5,
  metadata = {},
  userId = 'guest'
}) => {
  const activityPayload = {
    user_id: userId,
    activity_type: activityType,
    title,
    duration_minutes: durationMinutes,
    metadata
  };

  try {
    const res = await fetch(`${API_BASE_URL}/analytics/activity/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityPayload)
    });
    if (res.ok) {
      const data = await res.json();
      window.dispatchEvent(new Event("activityLogged"));
      return data;
    }
  } catch (err) {
    // Offline fallback — store locally
  }

  try {
    const localKey = `activities_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    const newEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      activity_type: activityType,
      title,
      duration_minutes: durationMinutes,
      timestamp: new Date().toISOString(),
      metadata
    };
    existing.unshift(newEntry);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
    window.dispatchEvent(new Event("activityLogged"));
  } catch (e) {}

  return { success: true };
};

// ─── Engagement metrics ───────────────────────────────────────────────────────

export const fetchEngagementMetrics = async (userId = 'guest') => {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/engagement/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) return result.data;
    }
  } catch (err) {}
  return getFallbackEngagement(userId);
};

const getFallbackEngagement = (userId = 'guest') => {
  try {
    const localKey = `activities_${userId}`;
    const acts = JSON.parse(localStorage.getItem(localKey) || "[]");
    let totalMinutes = 0, lessons = 0, assessments = 0, courses = 0, certs = 0;
    acts.forEach(a => {
      totalMinutes += a.duration_minutes || 0;
      if (a.activity_type === 'LESSON_COMPLETED') lessons += 1;
      if (a.activity_type === 'ASSESSMENT_COMPLETED') assessments += 1;
      if (a.activity_type === 'COURSE_COMPLETED') courses += 1;
      if (a.activity_type === 'CERTIFICATE_EARNED') certs += 1;
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return {
      currentStreak: acts.length > 0 ? Math.min(7, acts.length) : 0,
      learningTime: { thisWeekMinutes: totalMinutes, thisWeekFormatted: hours > 0 ? `${hours}h ${mins}m` : `${mins}m` },
      lessonsCompleted: lessons,
      assessmentsPassed: assessments,
      coursesCompleted: courses,
      certificatesEarned: certs
    };
  } catch (e) {
    return { currentStreak: 0, learningTime: { thisWeekMinutes: 0, thisWeekFormatted: "0m" }, lessonsCompleted: 0, assessmentsPassed: 0, coursesCompleted: 0, certificatesEarned: 0 };
  }
};

// ─── Course progress (local + remote) ─────────────────────────────────────────

export const getCourseProgressRecord = (courseId, email = 'guest') => {
  if (!courseId) return { completedItemIds: [], quizScores: {}, lessonTimeSpent: {} };
  try {
    const local = localStorage.getItem(`progress_${email}_${courseId}`);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return { completedItemIds: [], quizScores: {}, lessonTimeSpent: {}, finalAssessment: null, lastAccessed: null };
};

/**
 * Fetch progress from backend and merge with localStorage.
 * Merges by taking the union of completedItemIds and the latest quiz/assessment data.
 * Called on CoursePlayer mount to restore cross-device / post-logout progress.
 */
export const hydrateProgressFromBackend = async (courseId, email = 'guest') => {
  if (!courseId || email === 'guest') return null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/analytics/course/progress/${encodeURIComponent(email)}/${encodeURIComponent(courseId)}`
    );
    if (!res.ok) return null;
    const result = await res.json();
    if (!result.success || !result.data) return null;

    const backendRecord = result.data;
    const localRecord = getCourseProgressRecord(courseId, email);

    // Security: backend is the source of truth for completions/quiz outcomes/final.
    // localStorage must not be able to “unlock” modules after logout/login.
    const mergedCompleted = backendRecord.completedItemIds || [];
    const mergedQuizScores = backendRecord.quizScores || {};
    const mergedFinal = backendRecord.finalAssessment || null;

    // Lesson time can be merged (take MAX per lesson).
    const mergedTimeSpent = { ...(localRecord.lessonTimeSpent || {}), ...(backendRecord.lessonTimeSpent || {}) };
    Object.entries(backendRecord.lessonTimeSpent || {}).forEach(([lid, bTime]) => {
      const lTime = localRecord.lessonTimeSpent?.[lid] || 0;
      mergedTimeSpent[lid] = Math.max(bTime, lTime);
    });

    const merged = {
      ...localRecord,
      completedItemIds: mergedCompleted,
      quizScores: mergedQuizScores,
      lessonTimeSpent: mergedTimeSpent,
      finalAssessment: mergedFinal,
      lastAccessed: backendRecord.lastAccessed || localRecord.lastAccessed
    };

    // Save merged back to localStorage
    try {
      localStorage.setItem(`progress_${email}_${courseId}`, JSON.stringify(merged));
    } catch (e) {}

    return merged;
  } catch (e) {
    return null;
  }
};

export const saveCourseProgressRecord = async (courseId, progressData, email = 'guest') => {
  const localKey = `progress_${email}_${courseId}`;
  try {
    // Optimistic local save (so UI remains responsive).
    localStorage.setItem(localKey, JSON.stringify(progressData));
    window.dispatchEvent(new Event("progressUpdated"));

    // Request server-side validation.
    const res = await fetch(`${API_BASE_URL}/analytics/course/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: email,
        course_id: courseId,
        progress_data: progressData
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result?.success && result?.data) {
        // Overwrite local progress with the backend-validated record.
        localStorage.setItem(localKey, JSON.stringify(result.data));
        window.dispatchEvent(new Event("progressUpdated"));
        return result.data;
      }
    }
  } catch (e) {
    // If backend is unavailable, keep optimistic local progress.
  }

  return progressData;
};

// ─── Certificate backend validation ──────────────────────────────────────────

export const validateCertificateBackend = async (courseId, email = 'guest') => {
  if (!courseId || email === 'guest') return { eligible: false, reason: "Not authenticated." };
  try {
    const res = await fetch(
      `${API_BASE_URL}/analytics/course/certificate/${encodeURIComponent(email)}/${encodeURIComponent(courseId)}`
    );
    if (!res.ok) return { eligible: false, reason: "Backend validation failed." };
    const result = await res.json();
    if (result.success && result.data) return result.data;
    return { eligible: false, reason: "Unknown error." };
  } catch (e) {
    return { eligible: false, reason: "Could not reach server." };
  }
};

// ─── Core progression engine ──────────────────────────────────────────────────

export const getCourseActionState = (course, email = 'guest') => {
  if (!course) {
    return {
      actionType: 'START', buttonLabel: 'Start Course', progressPercentage: 0,
      isCompleted: false, completedItemsCount: 0, totalRequiredItems: 0,
      targetModuleIndex: 0, targetItemId: null, unlockedModuleIndices: [0],
      unlockedLessonIds: new Set(), canAccessFinalAssessment: false,
      isCertificateEligible: false
    };
  }

  const record = getCourseProgressRecord(course.id, email);
  const completedItemIds = new Set(record.completedItemIds || []);
  const quizScores = record.quizScores || {};
  const modules = Array.isArray(course.modules) ? course.modules : [];

  let totalRequiredItems = 0;
  let completedRequiredItems = 0;
  const unlockedModuleIndices = [0];
  const unlockedLessonIds = new Set();

  let firstIncompleteModuleIdx = 0;
  let firstIncompleteItemId = null;
  let foundIncomplete = false;
  let allModulesFullyPassed = true;
  let completedModulesCount = 0;

  modules.forEach((mod, mIdx) => {
    const items = Array.isArray(mod.items) ? mod.items : (Array.isArray(mod.lessons) ? mod.lessons : []);
    const isModUnlocked = unlockedModuleIndices.includes(mIdx);
    // Sequential unlocking: a module can only be considered "passed" in the chain
    // if it is already unlocked (meaning all previous modules + checkpoint quizzes passed).
    let modAllPassed = isModUnlocked;

    if (isModUnlocked && items.length > 0) {
      unlockedLessonIds.add(items[0].id);
    }

    items.forEach((item, lIdx) => {
      if (item.required !== false) {
        totalRequiredItems += 1;
        const isDone = completedItemIds.has(item.id);

        if (isDone) {
          if (isModUnlocked) {
            completedRequiredItems += 1;
            if (lIdx + 1 < items.length) {
              unlockedLessonIds.add(items[lIdx + 1].id);
            }
          }
        } else {
          if (isModUnlocked) {
            modAllPassed = false;
            if (!foundIncomplete) {
            firstIncompleteModuleIdx = mIdx;
            firstIncompleteItemId = item.id;
            foundIncomplete = true;
          }
          }
        }
      }
    });

    // Checkpoint quiz must be passed ≥ 70%
    const modQuiz = items.find(it => it.type === 'QUIZ');
    if (modQuiz) {
      const qResult = quizScores[modQuiz.id];
      if (isModUnlocked) {
        if (!qResult || !qResult.passed || (qResult.score || 0) < 70) {
          modAllPassed = false;
        }
      }
    }

    if (!modAllPassed) {
      allModulesFullyPassed = false;
    } else if (mIdx + 1 < modules.length) {
      unlockedModuleIndices.push(mIdx + 1);
    }

    if (modAllPassed) {
      completedModulesCount += 1;
    }
  });

  const finalAssessmentPassed = Boolean(
    record.finalAssessment && record.finalAssessment.passed &&
    record.finalAssessment.score >= (course.passingScore || 70)
  );
  const canAccessFinalAssessment = allModulesFullyPassed && modules.length > 0;

  const progressPercentage = totalRequiredItems > 0
    ? Math.min(100, Math.round((completedRequiredItems / totalRequiredItems) * 100))
    : 0;

  // Strict: ALL items done + final passed
  const isCertificateEligible = (allModulesFullyPassed && finalAssessmentPassed && progressPercentage === 100);

  let actionType = 'START';
  let buttonLabel = 'Start Course';
  if (isCertificateEligible) {
    actionType = 'CERTIFICATE'; buttonLabel = 'View Certificate';
  } else if (progressPercentage === 100 && !finalAssessmentPassed) {
    actionType = 'FINAL_EXAM'; buttonLabel = 'Take Final Exam';
  } else if (progressPercentage > 0) {
    actionType = 'CONTINUE'; buttonLabel = `Continue (Mod ${firstIncompleteModuleIdx + 1})`;
  }

  return {
    actionType, buttonLabel, progressPercentage,
    isCompleted: isCertificateEligible,
    completedItemsCount: completedRequiredItems,
    totalRequiredItems,
    targetModuleIndex: firstIncompleteModuleIdx,
    targetItemId: firstIncompleteItemId,
    unlockedModuleIndices,
    unlockedLessonIds,
    canAccessFinalAssessment,
    isCertificateEligible,
    finalAssessmentPassed,
    allModulesFullyPassed,
    completedModulesCount,
    totalModules: modules.length
  };
};
