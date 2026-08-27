import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { coursesData } from '../data/coursesData';
import { 
  CheckCircle, PlayCircle, ChevronLeft, ChevronRight, BookOpen, 
  ArrowLeft, Lock, Target, Lightbulb, AlertTriangle, Info, 
  ChevronDown, ChevronUp, Zap, Award, Edit3, X, Check, 
  HelpCircle, Sparkles, RefreshCw, Send, CheckCheck, Code2, Layers, FileText,
  Clock, Pause, Play, ShieldAlert, CheckCircle2, ShieldCheck, Terminal, AwardIcon
} from 'lucide-react';
import { sendEmailNotification } from '../utils/emailApi';
import { 
  recordLearningActivity, 
  getCourseActionState, 
  getCourseProgressRecord, 
  saveCourseProgressRecord,
  hydrateProgressFromBackend,
  DEFAULT_REQUIRED_DURATION_SECONDS
} from '../utils/engagementService';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useContext(UserContext);
  const email = user?.email || profile?.email || localStorage.getItem('userEmail') || 'guest';

  const cleanCourseId = String(courseId || '').trim();
  const course = coursesData.find(c => 
    String(c.id).toLowerCase() === cleanCourseId.toLowerCase() ||
    String(c.title).toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanCourseId.toLowerCase()
  );

  const modules = Array.isArray(course?.modules) ? course.modules : [];

  // Build unified flattened steps list
  const allSteps = useMemo(() => {
    const steps = [];
    modules.forEach((mod, mIdx) => {
      const items = Array.isArray(mod.items) ? mod.items : (Array.isArray(mod.lessons) ? mod.lessons : []);
      items.forEach((it, iIdx) => {
        steps.push({
          ...it,
          moduleIndex: mIdx,
          moduleTitle: mod.title,
          moduleId: mod.id,
          itemIndex: iIdx,
          isFinal: false,
          totalModuleItems: items.length
        });
      });
    });

    if (course?.finalAssessment) {
      steps.push({
        ...course.finalAssessment,
        id: course.finalAssessment.id,
        moduleIndex: modules.length,
        moduleTitle: "Final Comprehensive Certification Exam",
        moduleId: "final-assessment-mod",
        itemIndex: 0,
        isFinal: true,
        type: "ASSESSMENT",
        duration: "30 min",
        requiredDurationSeconds: 60,
        totalModuleItems: 1
      });
    }

    return steps;
  }, [course, modules]);

  // Minimal course definition sent to backend for server-side validation.
  // Keeps backend from trusting frontend-only completion flags.
  const courseProgressDefinition = useMemo(() => {
    if (!course) return null;

    const itemRequirements = {};
    (allSteps || []).forEach(step => {
      if (!step?.id) return;
      itemRequirements[step.id] = {
        type: step.type,
        requiredDurationSeconds: step.requiredDurationSeconds || DEFAULT_REQUIRED_DURATION_SECONDS
      };
    });

    const modulesDefinition = (modules || []).map((mod, mIdx) => {
      const items = Array.isArray(mod.items) ? mod.items : (Array.isArray(mod.lessons) ? mod.lessons : []);
      return {
        moduleIndex: mIdx,
        itemIds: items.map(it => it.id).filter(Boolean),
        checkpointQuizId: items.find(it => it.type === 'QUIZ')?.id || null
      };
    });

    const totalRequiredItems = modulesDefinition.reduce((acc, m) => acc + (m.itemIds?.length || 0), 0);

    return {
      courseId: course.id,
      passingScore: course.passingScore || 70,
      finalAssessmentId: course.finalAssessment?.id || null,
      totalRequiredItems,
      modules: modulesDefinition,
      itemRequirements
    };
  }, [course, modules, allSteps]);

  const courseProgressDefinitionRef = useRef(null);
  const totalRequiredItemsRef = useRef(0);

  useEffect(() => {
    courseProgressDefinitionRef.current = courseProgressDefinition;
    totalRequiredItemsRef.current = courseProgressDefinition?.totalRequiredItems || 0;
  }, [courseProgressDefinition]);

  // Active step index
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progressRecord, setProgressRecord] = useState(() => getCourseProgressRecord(cleanCourseId, email));
  const [actionState, setActionState] = useState(() => getCourseActionState(course, email));
  
  // UI states
  const [expandedModules, setExpandedModules] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [practicalNotes, setPracticalNotes] = useState("");
  const [practicalCompleted, setPracticalCompleted] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // { [qId]: selectedIndex }
  const [quizResult, setQuizResult] = useState(null); // { score, passed, submitted }
  const [quizError, setQuizError] = useState("");

  // Active Tab Time Tracking State
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const timeTrackingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(!document.hidden);
  const progressRecordRef = useRef(progressRecord);
  const timeSpentRef = useRef(0);

  // Initial resume positioning & notes loading (with backend hydration)
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      if (!course) return;

      // Server-authoritative hydration (restores progress after logout/login).
      await hydrateProgressFromBackend(course.id, email);
      if (isCancelled) return;

      const state = getCourseActionState(course, email);
      const rec = getCourseProgressRecord(course.id, email);

      setActionState(state);
      setProgressRecord(rec);
      progressRecordRef.current = rec;

      const queryParams = new URLSearchParams(location.search);
      const requestedItem = queryParams.get('item');
      const requestedModule = queryParams.get('module');

      let targetIdx = 0;
      if (requestedItem) {
        const foundIdx = allSteps.findIndex(s => s.id === requestedItem);
        if (foundIdx !== -1 && (state.unlockedLessonIds?.has(requestedItem) || foundIdx === 0)) {
          targetIdx = foundIdx;
        } else if (state.targetItemId) {
          const resumeIdx = allSteps.findIndex(s => s.id === state.targetItemId);
          if (resumeIdx !== -1) targetIdx = resumeIdx;
        }
      } else if (requestedModule !== null && !isNaN(parseInt(requestedModule, 10))) {
        const mIdx = parseInt(requestedModule, 10);
        if ((state.unlockedModuleIndices || [0]).includes(mIdx)) {
          const foundIdx = allSteps.findIndex(s => s.moduleIndex === mIdx);
          if (foundIdx !== -1) targetIdx = foundIdx;
        }
      } else if (state.targetItemId) {
        const foundIdx = allSteps.findIndex(s => s.id === state.targetItemId);
        if (foundIdx !== -1) targetIdx = foundIdx;
      }

      setActiveStepIndex(targetIdx);

      // Auto-expand current module accordion
      const currentStepObj = allSteps[targetIdx];
      if (currentStepObj) {
        setExpandedModules(prev => ({ ...prev, [currentStepObj.moduleIndex]: true }));
      }

      const savedNotes = localStorage.getItem(`notes_${email}_${course.id}`);
      if (savedNotes) setNotesContent(savedNotes);
    })();

    return () => {
      isCancelled = true;
    };
  }, [course, cleanCourseId, email, allSteps, location.search]);

  // Current step details
  const currentStep = allSteps[activeStepIndex] || allSteps[0] || {};
  const requiredDuration = currentStep.requiredDurationSeconds || DEFAULT_REQUIRED_DURATION_SECONDS;

  // Keep refs in sync
  useEffect(() => { progressRecordRef.current = progressRecord; }, [progressRecord]);
  useEffect(() => { isTabActiveRef.current = isTabActive; }, [isTabActive]);
  useEffect(() => { timeSpentRef.current = timeSpentSeconds; }, [timeSpentSeconds]);

  // Keep UI state aligned with persisted progress (especially after backend validation overwrites localStorage).
  useEffect(() => {
    if (!course?.id || email === 'guest') return;
    const onProgressUpdated = () => {
      const rec = getCourseProgressRecord(course.id, email);
      progressRecordRef.current = rec;
      setProgressRecord(rec);
      setActionState(getCourseActionState(course, email));
    };
    window.addEventListener("progressUpdated", onProgressUpdated);
    return () => window.removeEventListener("progressUpdated", onProgressUpdated);
  }, [course?.id, email, course]);

  // Track Tab Visibility (Pause timer if user switches tabs or window blurs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = !document.hidden;
      setIsTabActive(active);
      isTabActiveRef.current = active;
    };

    const handleFocus = () => { setIsTabActive(true); isTabActiveRef.current = true; };
    const handleBlur = () => { setIsTabActive(false); isTabActiveRef.current = false; };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Timer Tick Engine: increments only when on the active tab
  useEffect(() => {
    const savedTime = progressRecordRef.current.lessonTimeSpent?.[currentStep.id] || 0;
    setTimeSpentSeconds(savedTime);
    timeSpentRef.current = savedTime;

    if (timeTrackingIntervalRef.current) clearInterval(timeTrackingIntervalRef.current);

    timeTrackingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current && !document.hidden) {
        const next = timeSpentRef.current + 1;
        timeSpentRef.current = next;
        setTimeSpentSeconds(next);
        if (next % 5 === 0 && course?.id && currentStep.id) {
          const rec = progressRecordRef.current;
          const updated = {
            ...rec,
            totalRequiredItems: totalRequiredItemsRef.current,
            courseDefinition: courseProgressDefinitionRef.current,
            lessonTimeSpent: {
              ...(rec.lessonTimeSpent || {}),
              [currentStep.id]: next
            }
          };
          saveCourseProgressRecord(course.id, updated, email);
          progressRecordRef.current = updated;
        }
      }
    }, 1000);

    return () => {
      if (timeTrackingIntervalRef.current) clearInterval(timeTrackingIntervalRef.current);
    };
  }, [currentStep.id, course?.id, email]);

  // Reset quiz/practical inputs on step switch
  useEffect(() => {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError("");
    setPracticalCompleted(false);
    setPracticalNotes("");
    if (currentStep?.moduleIndex !== undefined) {
      setExpandedModules(prev => ({ ...prev, [currentStep.moduleIndex]: true }));
    }
  }, [activeStepIndex, currentStep?.moduleIndex]);

  // Determine completion and unlocked states
  const isCurrentCompleted = (progressRecord.completedItemIds || []).includes(currentStep.id) ||
    (currentStep.isFinal && progressRecord.finalAssessment?.passed);

  const isCurrentUnlocked = currentStep.isFinal
    ? actionState.canAccessFinalAssessment
    : (actionState.unlockedLessonIds?.has(currentStep.id) || activeStepIndex === 0);

  const isTimeRequirementMet = timeSpentSeconds >= requiredDuration;

  // Handle Mark as Complete for Reading, Video, Code, Practical
  const handleMarkItemComplete = async () => {
    if (!currentStep.id || !isCurrentUnlocked) return;
    if (!isTimeRequirementMet) {
      alert(`Please engage with this lesson for at least ${requiredDuration} seconds before marking complete.`);
      return;
    }

    const newCompleted = Array.from(new Set([...(progressRecord.completedItemIds || []), currentStep.id]));
    const updatedRecord = {
      ...progressRecord,
      totalRequiredItems: totalRequiredItemsRef.current,
      courseDefinition: courseProgressDefinitionRef.current,
      completedItemIds: newCompleted,
      lessonTimeSpent: {
        ...(progressRecord.lessonTimeSpent || {}),
        [currentStep.id]: timeSpentSeconds
      },
      lastAccessed: { moduleId: currentStep.moduleId, itemId: currentStep.id }
    };

    const saved = await saveCourseProgressRecord(course.id, updatedRecord, email);
    const nextRecord = saved || updatedRecord;
    setProgressRecord(nextRecord);
    progressRecordRef.current = nextRecord;
    setActionState(getCourseActionState(course, email));

    await recordLearningActivity({
      activityType: "LESSON_COMPLETED",
      title: `Completed ${currentStep.title}`,
      durationMinutes: Math.max(1, Math.round(timeSpentSeconds / 60)),
      metadata: {
        course_id: course.id,
        item_id: currentStep.id,
        type: currentStep.type,
        skills: course.skillsGained
      },
      userId: email
    });
  };

  // Handle Quiz Submission
  const handleQuizSubmit = async (quizData, isFinal = false) => {
    const questions = quizData.questions || [];
    if (questions.length === 0) return;

    // Verify all questions answered
    const unanswered = questions.some(q => quizAnswers[q.id] === undefined);
    if (unanswered) {
      setQuizError("Please select an answer for all questions before submitting.");
      return;
    }
    setQuizError("");

    let correctCount = 0;
    questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passingThreshold = quizData.passingScore || course.passingScore || 70;
    const isPassed = scorePercentage >= passingThreshold;

    // Payload for backend validation (prevents spoofing scores via local state).
    const answersByQuestionId = {};
    questions.forEach(q => {
      answersByQuestionId[q.id] = quizAnswers[q.id];
    });
    const questionKey = questions.map(q => ({ id: q.id, correctIndex: q.correctIndex }));
    const quizSubmissionPayload = {
      quizId: currentStep.id,
      passingScore: passingThreshold,
      answersByQuestionId,
      questionKey,
      submittedAt: new Date().toISOString()
    };

    setQuizResult({
      score: scorePercentage,
      passed: isPassed,
      correctCount,
      totalCount: questions.length,
      submitted: true
    });

    if (isPassed) {
      let updatedRecord = {
        ...progressRecord,
        totalRequiredItems: totalRequiredItemsRef.current,
        courseDefinition: courseProgressDefinitionRef.current
      };
      let pendingCertificate = null;
      if (isFinal) {
        updatedRecord.finalAssessmentSubmission = quizSubmissionPayload;
        updatedRecord.finalAssessment = {
          score: scorePercentage,
          passed: true,
          attempts: (progressRecord.finalAssessment?.attempts || 0) + 1,
          completedAt: new Date().toISOString()
        };

        const certId = `CERT-${course.id}-${Date.now().toString().slice(-6)}`;
        const certKey = `cert_${email}_${course.id}`;
        const certData = {
          id: certId,
          courseId: course.id,
          completedAt: new Date().toISOString(),
          score: scorePercentage,
          skillsDemonstrated: course.skillsGained
        };
        pendingCertificate = { certId, certKey, certData };

      } else {
        updatedRecord.quizSubmission = quizSubmissionPayload;
        const newCompleted = Array.from(new Set([...(progressRecord.completedItemIds || []), currentStep.id]));
        updatedRecord.completedItemIds = newCompleted;
        updatedRecord.quizScores = {
          ...(progressRecord.quizScores || {}),
          [currentStep.id]: {
            score: scorePercentage,
            passed: true,
            attempts: ((progressRecord.quizScores?.[currentStep.id]?.attempts || 0) + 1)
          }
        };
      }

      const saved = await saveCourseProgressRecord(course.id, updatedRecord, email);
      const nextRecord = saved || updatedRecord;
      setProgressRecord(nextRecord);
      progressRecordRef.current = nextRecord;
      setActionState(getCourseActionState(course, email));

      await recordLearningActivity({
        activityType: "ASSESSMENT_COMPLETED",
        title: `Passed ${isFinal ? 'Final Assessment' : currentStep.title} (${scorePercentage}%)`,
        durationMinutes: 15,
        metadata: { course_id: course.id, score: scorePercentage, is_final: isFinal },
        userId: email
      });

      // Only finalize certificate + email after backend confirms eligibility.
      if (isFinal && nextRecord?.certificateEligible && pendingCertificate) {
        const { certId, certKey, certData } = pendingCertificate;
        localStorage.setItem(certKey, JSON.stringify(certData));

        await recordLearningActivity({
          activityType: "CERTIFICATE_EARNED",
          title: `Earned Certificate: ${course.title}`,
          durationMinutes: 15,
          metadata: { course_id: course.id, certificate_id: certId, score: scorePercentage },
          userId: email
        });

        try {
          await sendEmailNotification(
            "certificate",
            "Certificate Generated - PREPRIA Career Intelligence",
            {
              courseDetails: course.title,
              certificateId: certId,
              downloadLink: `${window.location.origin}/certificate/${course.id}`
            }
          );
        } catch (e) {}
      }
    } else {
      // Track failed attempt without overwriting any existing pass
      let updatedRecord = {
        ...progressRecord,
        totalRequiredItems: totalRequiredItemsRef.current,
        courseDefinition: courseProgressDefinitionRef.current
      };
      if (isFinal) {
        updatedRecord.finalAssessmentSubmission = quizSubmissionPayload;
        if (!progressRecord.finalAssessment?.passed) {
          updatedRecord.finalAssessment = {
            ...progressRecord.finalAssessment,
            score: scorePercentage,
            passed: false,
            attempts: (progressRecord.finalAssessment?.attempts || 0) + 1
          };
        }
      } else {
        updatedRecord.quizSubmission = quizSubmissionPayload;
        const existingQuizScore = progressRecord.quizScores?.[currentStep.id];
        if (!existingQuizScore?.passed) {
          updatedRecord.quizScores = {
            ...(progressRecord.quizScores || {}),
            [currentStep.id]: {
              score: scorePercentage,
              passed: false,
              attempts: (existingQuizScore?.attempts || 0) + 1
            }
          };
        }
      }
      const saved = await saveCourseProgressRecord(course.id, updatedRecord, email);
      const nextRecord = saved || updatedRecord;
      setProgressRecord(nextRecord);
      progressRecordRef.current = nextRecord;
      setActionState(getCourseActionState(course, email));
    }
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotesContent(val);
    if (course) localStorage.setItem(`notes_${email}_${course.id}`, val);
  };

  const toggleModuleAccordion = (mIdx) => {
    setExpandedModules(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));
  };

  // Course Not Found Fallback
  if (!course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-manrope">
        <div className="text-center bg-white dark:bg-[#111215] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/[0.08] max-w-md space-y-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Course Not Found</h2>
          <p className="text-xs text-gray-500">The requested curriculum ID "{cleanCourseId}" does not exist in the catalog.</p>
          <button 
            onClick={() => navigate('/my-courses')}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Back to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-manrope animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-4 sm:p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-courses')}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-all cursor-pointer"
            title="Back to Courses"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-50 text-primary border border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/30">
                {course.category}
              </span>
              <span className="text-xs font-bold text-gray-400">• {modules.length} Modules</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Header Actions & Certificate */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showNotes 
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-[#111215] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{showNotes ? 'Close Notes' : 'Course Notes'}</span>
          </button>

          {actionState.isCertificateEligible ? (
            <button
              onClick={() => navigate(`/certificate/${course.id}`)}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold border border-gray-200 dark:border-gray-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Certificate Locked ({actionState.progressPercentage}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar Curriculum + Lesson Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================================================
            LEFT / SIDEBAR: MODULE & LESSON PROGRESSION HIERARCHY
        ================================================== */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111215] rounded-3xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-5 lg:sticky lg:top-6 max-h-[85vh] overflow-y-auto">
          
          {/* Progress Overview Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500">Course Completion</span>
              <span className={actionState.progressPercentage === 100 ? "text-emerald-600" : "text-primary"}>
                {actionState.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  actionState.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${actionState.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
              <span>{actionState.completedItemsCount} of {actionState.totalRequiredItems} Lessons</span>
              <span>{actionState.completedModulesCount} of {actionState.totalModules} Modules</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pt-1">
              <span>{actionState.allModulesFullyPassed ? 'All checkpoint quizzes passed' : 'Checkpoint quizzes in progress'}</span>
              <span>
                Final: {actionState.finalAssessmentPassed ? 'Passed' : actionState.canAccessFinalAssessment ? 'Ready' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="space-y-3">
            {modules.map((mod, mIdx) => {
              const isModUnlocked = (actionState.unlockedModuleIndices || [0]).includes(mIdx);
              const items = Array.isArray(mod.items) ? mod.items : (Array.isArray(mod.lessons) ? mod.lessons : []);
              const completedCountInMod = items.filter(it => (progressRecord.completedItemIds || []).includes(it.id)).length;
              const isModFullyCompleted = items.length > 0 && completedCountInMod === items.length;
              const isExpanded = expandedModules[mIdx];

              return (
                <div 
                  key={mod.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isModUnlocked
                      ? 'bg-white dark:bg-[#111215] border-gray-200 dark:border-gray-800 shadow-2xs'
                      : 'bg-gray-50/60 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 opacity-60'
                  }`}
                >
                  {/* Module Header Strip */}
                  <div 
                    onClick={() => isModUnlocked && toggleModuleAccordion(mIdx)}
                    className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                      isModUnlocked ? 'hover:bg-gray-50/80 dark:hover:bg-gray-900/60' : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isModFullyCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : isModUnlocked ? (
                        <div className="w-6 h-6 rounded-full bg-orange-50 text-primary border border-orange-200 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          {mIdx + 1}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center shrink-0">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                          MODULE {mIdx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-gray-400">
                        {completedCountInMod}/{items.length}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Lessons List within expanded module */}
                  {isExpanded && isModUnlocked && (
                    <div className="p-2 pt-0 space-y-1 border-t border-gray-100 dark:border-gray-800/80">
                      {items.map((item, lIdx) => {
                        const stepGlobalIdx = allSteps.findIndex(s => s.id === item.id);
                        const isLessonDone = (progressRecord.completedItemIds || []).includes(item.id);
                        const isLessonActive = stepGlobalIdx === activeStepIndex;
                        const isLessonUnlocked = actionState.unlockedLessonIds?.has(item.id) || lIdx === 0;

                        return (
                          <div
                            key={item.id}
                            onClick={() => isLessonUnlocked && setActiveStepIndex(stepGlobalIdx)}
                            className={`p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                              isLessonActive
                                ? 'bg-primary text-white shadow-xs'
                                : isLessonDone
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50'
                                : isLessonUnlocked
                                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isLessonDone ? (
                                <CheckCircle className={`w-4 h-4 shrink-0 ${isLessonActive ? 'text-white' : 'text-emerald-600'}`} />
                              ) : isLessonActive ? (
                                <PlayCircle className="w-4 h-4 shrink-0 text-white fill-white/20" />
                              ) : isLessonUnlocked ? (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              )}
                              <span className="truncate">{item.title}</span>
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-extrabold shrink-0 ${
                              isLessonActive 
                                ? 'bg-white/20 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Assessment Row */}
            {course.finalAssessment && (
              <div 
                onClick={() => actionState.canAccessFinalAssessment && setActiveStepIndex(allSteps.length - 1)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  activeStepIndex === allSteps.length - 1
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : actionState.canAccessFinalAssessment
                    ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 text-purple-900 dark:text-purple-300 hover:bg-purple-100/50'
                    : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {progressRecord.finalAssessment?.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : actionState.canAccessFinalAssessment ? (
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">FINAL STEP</span>
                    <span className="text-xs font-extrabold truncate block">Final Certification Exam</span>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  activeStepIndex === allSteps.length - 1 ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700'
                }`}>
                  Exam
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            RIGHT: ACTIVE LESSON WORKSPACE & PEDAGOGICAL CONTENT
        ================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Step Container */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-6">
            
            {/* Step Breadcrumb & Active Timer Gauge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                  {currentStep.isFinal ? "FINAL CERTIFICATION ASSESSMENT" : `MODULE ${currentStep.moduleIndex + 1} • LESSON ${currentStep.itemIndex + 1} OF ${currentStep.totalModuleItems || 4}`}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
                  {currentStep.title}
                </h2>
              </div>

              {/* Active Tab Learning Time Gauge */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 shrink-0">
                <div className={`w-3 h-3 rounded-full ${isTabActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div className="text-[11px] font-bold">
                  <span className="text-gray-400 block text-[9px] uppercase">Active Tab Time</span>
                  <span className={isTimeRequirementMet ? "text-emerald-600" : "text-gray-700 dark:text-gray-300"}>
                    {Math.floor(timeSpentSeconds / 60)}:{String(timeSpentSeconds % 60).padStart(2, '0')} / {Math.floor(requiredDuration / 60)}:{String(requiredDuration % 60).padStart(2, '0')} min
                  </span>
                </div>
                {isTimeRequirementMet && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>
            </div>

            {/* Check if current lesson is locked */}
            {!isCurrentUnlocked ? (
              <div className="p-8 text-center space-y-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Lesson Locked
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  To access this lesson, you must first complete the preceding lessons and pass all checkpoint quizzes in the sequence.
                </p>
                <button
                  onClick={() => setActiveStepIndex(0)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-all cursor-pointer"
                >
                  Return to Active Lesson
                </button>
              </div>
            ) : currentStep.type === "QUIZ" || currentStep.isFinal ? (
              
              /* ==================================================
                  QUIZ / FINAL ASSESSMENT RENDERER
              ================================================== */
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Checkpoint Evaluation Requirement:</strong>
                    A passing score of at least 70% is required to complete this module and unlock subsequent coursework.
                  </div>
                </div>

                {/* Quiz Questions */}
                <div className="space-y-6">
                  {(currentStep.quiz?.questions || currentStep.questions || []).map((q, qIdx) => {
                    const selectedOpt = quizAnswers[q.id];
                    const isSubmitted = quizResult?.submitted;

                    return (
                      <div key={q.id || qIdx} className="p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-extrabold text-primary shrink-0">Q{qIdx + 1}.</span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedOpt === oIdx;
                            const isCorrect = q.correctIndex === oIdx;

                            let optClass = "bg-white dark:bg-[#111215] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
                            if (isSubmitted) {
                              if (isCorrect) optClass = "bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold";
                              else if (isSelected && !isCorrect) optClass = "bg-rose-50 border-rose-400 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
                            } else if (isSelected) {
                              optClass = "bg-primary/10 border-primary text-primary font-bold";
                            }

                            return (
                              <div
                                key={oIdx}
                                onClick={() => !isSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${optClass}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {isSubmitted && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800 leading-relaxed">
                            <strong className="text-gray-700 dark:text-gray-300">Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {quizError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{quizError}</span>
                  </div>
                )}

                {/* Quiz Result Banner */}
                {quizResult && (
                  <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                    quizResult.passed 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-900 dark:text-rose-300'
                  }`}>
                    <h3 className="text-base font-extrabold">
                      {quizResult.passed ? "✓ Assessment Passed!" : "Assessment Incomplete — Try Again"}
                    </h3>
                    <p className="text-xs">
                      You scored <strong>{quizResult.score}%</strong> ({quizResult.correctCount} of {quizResult.totalCount} correct). Passing threshold: 70%.
                    </p>
                    {!quizResult.passed && (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Retake Assessment
                      </button>
                    )}
                  </div>
                )}

                {/* Submit Assessment Button */}
                {!quizResult?.submitted && (
                  <button
                    onClick={() => handleQuizSubmit(currentStep.quiz || currentStep, currentStep.isFinal)}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer"
                  >
                    Submit Assessment
                  </button>
                )}

              </div>

            ) : currentStep.type === "PRACTICAL" ? (

              /* ==================================================
                  PRACTICAL LAB / EXERCISE RENDERER
              ================================================== */
              <div className="space-y-6">
                
                {/* Objective & Scenario */}
                <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                      Practical Objective
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {currentStep.objective}
                    </p>
                  </div>

                  {currentStep.practicalTask?.scenario && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Industry Scenario
                      </h4>
                      <p className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        {currentStep.practicalTask.scenario}
                      </p>
                    </div>
                  )}

                  {/* Step-by-Step Instructions */}
                  {currentStep.practicalTask?.instructions && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Step-by-Step Instructions
                      </h4>
                      <div className="space-y-2">
                        {currentStep.practicalTask.instructions.map((inst, iIdx) => (
                          <div key={iIdx} className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              {iIdx + 1}
                            </span>
                            <span>{inst}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expected Output */}
                  {currentStep.practicalTask?.expectedResult && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Expected Outcome
                      </h4>
                      <p className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 font-medium">
                        {currentStep.practicalTask.expectedResult}
                      </p>
                    </div>
                  )}
                </div>

                {/* Practical Notes / Verification Input */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-900 dark:text-white block">
                    Execution Output / Verification Notes
                  </label>
                  <textarea
                    value={practicalNotes}
                    onChange={(e) => setPracticalNotes(e.target.value)}
                    placeholder="Document your practical command execution results, code outputs, or architectural solution..."
                    rows={4}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Mark Practical Complete Button */}
                <button
                  onClick={handleMarkItemComplete}
                  disabled={!isTimeRequirementMet}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrentCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-300'
                      : isTimeRequirementMet
                      ? 'bg-primary hover:bg-primaryHover text-white shadow-md shadow-primary/25 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCurrentCompleted ? <CheckCircle className="w-4 h-4" /> : null}
                  <span>
                    {isCurrentCompleted ? "✓ Practical Lab Completed" : isTimeRequirementMet ? "Mark Practical Lab Complete" : `Spend ${requiredDuration - timeSpentSeconds}s more to complete`}
                  </span>
                </button>

              </div>

            ) : (

              /* ==================================================
                  STANDARD PEDAGOGICAL READING & CONCEPT LESSON
              ================================================== */
              <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                
                {/* 1. Learning Objective Card */}
                <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    Learning Objective
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {currentStep.objective}
                  </p>
                </div>

                {/* 2. Core Concepts */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Core Concepts & Theory
                  </h4>
                  <p className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                    {currentStep.coreConcepts || currentStep.content}
                  </p>
                </div>

                {/* 3. Real-World Architecture / Enterprise Example */}
                {currentStep.realWorldExample && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BuildingIcon /> <span>Real-World Enterprise Application</span>
                    </h4>
                    <p className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-200">
                      {currentStep.realWorldExample}
                    </p>
                  </div>
                )}

                {/* 4. Code Snippet / Practical Syntax Example */}
                {currentStep.codeSnippet && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> <span>Implementation Code Example</span>
                    </h4>
                    <pre className="p-4 rounded-2xl bg-[#0D1117] text-gray-200 font-mono text-xs overflow-x-auto border border-gray-800">
                      <code>{currentStep.codeSnippet}</code>
                    </pre>
                    {currentStep.codeExplanation && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {currentStep.codeExplanation}
                      </p>
                    )}
                  </div>
                )}

                {/* 5. Common Pitfalls & Mistakes */}
                {currentStep.commonMistakes && currentStep.commonMistakes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> <span>Common Pitfalls to Avoid</span>
                    </h4>
                    <div className="space-y-1.5">
                      {currentStep.commonMistakes.map((mis, mIdx) => (
                        <div key={mIdx} className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-300 flex items-start gap-2">
                          <span className="text-rose-500 font-bold shrink-0">✕</span>
                          <span>{mis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Key Takeaways */}
                {currentStep.takeaways && currentStep.takeaways.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> <span>Key Takeaways</span>
                    </h4>
                    <div className="space-y-1.5">
                      {currentStep.takeaways.map((tak, tIdx) => (
                        <div key={tIdx} className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{tak}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mark Lesson Complete Action Button */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleMarkItemComplete}
                    disabled={!isTimeRequirementMet}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrentCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-300'
                        : isTimeRequirementMet
                        ? 'bg-primary hover:bg-primaryHover text-white shadow-md shadow-primary/25 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCurrentCompleted ? <CheckCircle className="w-4 h-4" /> : null}
                    <span>
                      {isCurrentCompleted ? "✓ Lesson Completed" : isTimeRequirementMet ? "Mark Lesson Complete" : `Engage for ${requiredDuration - timeSpentSeconds}s more to complete`}
                    </span>
                  </button>
                </div>

              </div>
            )}

            {/* Bottom Navigation Buttons (Previous / Next) */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => activeStepIndex > 0 && setActiveStepIndex(activeStepIndex - 1)}
                disabled={activeStepIndex === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  activeStepIndex > 0 
                    ? 'bg-white dark:bg-[#111215] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {activeStepIndex < allSteps.length - 1 ? (
                <button
                  onClick={() => {
                    const nextIdx = activeStepIndex + 1;
                    const nextStep = allSteps[nextIdx];
                    const isNextUnlocked = actionState.unlockedLessonIds?.has(nextStep.id) || (nextStep.isFinal && actionState.canAccessFinalAssessment);
                    if (isNextUnlocked) {
                      setActiveStepIndex(nextIdx);
                    } else {
                      alert("Please complete the current lesson to unlock the next lesson.");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                actionState.isCertificateEligible && (
                  <button
                    onClick={() => navigate(`/certificate/${course.id}`)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Claim Certificate</span>
                  </button>
                )
              )}
            </div>

          </div>

          {/* Notes Overlay Section */}
          {showNotes && (
            <div className="bg-white dark:bg-[#111215] rounded-3xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span>Personal Course Study Notes</span>
                </h3>
                <span className="text-[10px] text-gray-400">Auto-saved</span>
              </div>
              <textarea
                value={notesContent}
                onChange={handleNotesChange}
                placeholder="Type your notes, takeaways, architectural summaries, and code snippets here..."
                rows={6}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}
