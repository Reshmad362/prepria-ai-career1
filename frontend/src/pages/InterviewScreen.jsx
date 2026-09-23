import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  Bot, User, Mic, MicOff, AlertCircle, PlayCircle, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, Sparkles, Award, TrendingUp, 
  RotateCcw, BookOpen, Compass, ChevronRight, Check, Volume2, 
  VolumeX, HelpCircle, StopCircle, RefreshCw, BarChart2, Video, 
  VideoOff, Monitor, ShieldAlert, XCircle, AlertTriangle
} from 'lucide-react';
import { 
  getQuestionsForRole, 
  evaluateInterviewSubmission 
} from '../utils/interviewQuestionEngine';
import { useInterviewProctoring } from '../hooks/useInterviewProctoring';
import { API_URL } from '../utils/api';

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { user, profile, preferences } = useContext(UserContext);

  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail') || 'guest';
  const targetRole = profile?.targetRole || preferences?.targetRole || localStorage.getItem('selectedInterviewRole') || 'Full Stack Developer';

  // 1. Session Configuration
  const [interviewConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("activeInterviewConfig");
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaultRole = targetRole || "Full Stack Developer";
    const questions = getQuestionsForRole(defaultRole, "Intermediate", "Technical", 10);
    const fallback = {
      roleName: defaultRole,
      difficulty: "Intermediate",
      interviewType: "Technical",
      questionCount: 10,
      durationMinutes: 25,
      questions: questions,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("activeInterviewConfig", JSON.stringify(fallback));
    return fallback;
  });

  const interviewType = interviewConfig.interviewType || "Technical";
  const isScreenRequired = useMemo(() => {
    const t = interviewType.toLowerCase();
    return t.includes("technical") || t.includes("coding") || t.includes("system design") || t.includes("sql") || t.includes("full stack");
  }, [interviewType]);

  const questionsList = interviewConfig.questions || getQuestionsForRole(interviewConfig.roleName || targetRole, "Intermediate", "Technical", 10);
  const totalQuestions = questionsList.length;

  // 2. Question State Machine
  const [sessionStatus, setSessionStatus] = useState('ANSWERING'); // 'ASKING' | 'ANSWERING' | 'SUBMITTING' | 'COMPLETED' | 'TERMINATED'
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState(() => Array(totalQuestions).fill(null));
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  
  // Audio & Speech States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  // Media Stream & DOM Refs
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Speech Recognition Refs (Fixes duplication)
  const recognitionRef = useRef(null);
  const isDictatingRef = useRef(false);
  const isRecognitionStartingRef = useRef(false);
  const dictationBaseTextRef = useRef("");
  const finalTranscriptRef = useRef("");

  // Timer & Finish States
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [terminationInfo, setTerminationInfo] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Format Elapsed Time MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Handle Automatic Termination (3rd warning)
  const handleAutoTermination = useCallback((reason, recordedWarnings) => {
    setSessionStatus('TERMINATED');
    setIsFinished(true);

    // Stop speech synthesis & dictation
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    isDictatingRef.current = false;
    setIsVoiceActive(false);

    // Snapshot final answers
    const trimmed = currentAnswerText.trim();
    const isAnswerProvided = trimmed.length > 5;
    const durationSec = Math.round((Date.now() - questionStartTime) / 1000);

    const latestAnswer = {
      questionId: questionsList[currentStep]?.id || `q-${currentStep + 1}`,
      questionText: questionsList[currentStep]?.question || "",
      topic: questionsList[currentStep]?.topic || "General",
      presentedAt: new Date(questionStartTime).toISOString(),
      answerEndedAt: new Date().toISOString(),
      transcript: isAnswerProvided ? trimmed : "[Terminated]",
      wordCount: isAnswerProvided ? trimmed.split(/\s+/).filter(Boolean).length : 0,
      answerDurationSeconds: durationSec,
      status: isAnswerProvided ? 'answered' : 'unanswered',
      isAnswered: isAnswerProvided
    };

    const finalAnswersSnapshot = [...userAnswers];
    finalAnswersSnapshot[currentStep] = latestAnswer;
    setUserAnswers(finalAnswersSnapshot);

    const termData = {
      status: "terminated_for_violations",
      warningCount: 3,
      terminationReason: reason,
      warnings: recordedWarnings,
      questionsAnswered: finalAnswersSnapshot.filter(a => a?.isAnswered).length,
      totalQuestions: totalQuestions,
      completedNormally: false,
      terminatedAt: new Date().toISOString()
    };
    setTerminationInfo(termData);

    // Evaluate valid answers submitted so far (Zero-Answer protection applies)
    const evalRes = evaluateInterviewSubmission({
      roleName: interviewConfig.roleName || targetRole,
      difficulty: interviewConfig.difficulty || "Intermediate",
      answers: finalAnswersSnapshot,
      questions: questionsList,
      userSkills: profile?.skills || [],
      sessionDuration: formattedTime
    });
    setEvaluationResult(evalRes);

    // Persist termination record
    try {
      const historyKey = `interview_history_${activeEmail}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newEntry = {
        id: `sess-term-${Date.now()}`,
        roleName: interviewConfig.roleName || targetRole,
        difficulty: interviewConfig.difficulty || "Intermediate",
        score: evalRes.overallScore || 0,
        duration: formattedTime,
        answeredCount: termData.questionsAnswered,
        questionCount: totalQuestions,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: "terminated_for_violations",
        terminationReason: reason,
        violationsCount: 3
      };
      localStorage.setItem(historyKey, JSON.stringify([newEntry, ...existingHistory]));
    } catch (e) {}
  }, [currentAnswerText, questionStartTime, questionsList, currentStep, userAnswers, totalQuestions, interviewConfig, targetRole, profile?.skills, formattedTime, activeEmail]);

  // Media Streams State
  const screenStreamRef = useRef(null);

  // Centralized Proctoring Hook
  const {
    warningCount,
    maxWarnings,
    activeWarning,
    cameraStatus,
    microphoneStatus,
    screenShareStatus,
    faceDetected,
    tabVisible,
    interviewTerminated,
    terminationReason,
    addProctoringWarning
  } = useInterviewProctoring({
    enabled: !isFinished,
    requireVideo: true,
    requireAudio: true,
    requireScreen: true,
    cameraStream: cameraStream,
    screenStream: screenStream,
    videoElement: videoRef.current,
    onTerminate: handleAutoTermination
  });

  // Initialize Media Streams (Camera + Handed-Over Screen Share)
  useEffect(() => {
    let localCamStream = null;
    let localScreenStream = null;

    const handedStreams = window.__prepriaMediaStreams || {};

    // 1. Camera Initialization
    if (handedStreams.cameraStream && handedStreams.cameraStream.getVideoTracks().some(t => t.readyState === 'live')) {
      localCamStream = handedStreams.cameraStream;
      setCameraStream(handedStreams.cameraStream);
      if (videoRef.current) {
        videoRef.current.srcObject = handedStreams.cameraStream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: true 
      }).then(stream => {
        localCamStream = stream;
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }).catch(err => {
        console.error("Camera acquisition failed:", err);
      });
    }

    // 2. Screen Share Stream Initialization
    if (handedStreams.screenStream && handedStreams.screenStream.getVideoTracks().some(t => t.readyState === 'live')) {
      localScreenStream = handedStreams.screenStream;
      setScreenStream(handedStreams.screenStream);
      screenStreamRef.current = handedStreams.screenStream;

      const track = handedStreams.screenStream.getVideoTracks()[0];
      track.onended = () => {
        setScreenStream(null);
        screenStreamRef.current = null;
      };
    }

    return () => {
      if (localCamStream) localCamStream.getTracks().forEach(t => t.stop());
      if (localScreenStream) localScreenStream.getTracks().forEach(t => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
      window.__prepriaMediaStreams = null;
    };
  }, []);

  // Resume Screen Sharing Handler
  const handleResumeScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: false 
      });
      const tracks = stream.getVideoTracks();
      if (tracks && tracks.length > 0 && tracks[0].readyState === 'live') {
        setScreenStream(stream);
        screenStreamRef.current = stream;

        tracks[0].onended = () => {
          setScreenStream(null);
          screenStreamRef.current = null;
        };
      }
    } catch (err) {
      console.warn("Resume screen sharing cancelled:", err);
    }
  };

  // Timer Tick (stops on finish or termination)
  useEffect(() => {
    if (isFinished || interviewTerminated) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, interviewTerminated]);

  // Read question with Speech Synthesis
  const speakCurrentQuestion = useCallback((text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setSessionStatus('ASKING');
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        setSessionStatus('ANSWERING');
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        setSessionStatus('ANSWERING');
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsAiSpeaking(false);
      setSessionStatus('ANSWERING');
    }
  }, [speechEnabled]);

  // Trigger question speech on step change
  useEffect(() => {
    if (questionsList[currentStep] && !isFinished) {
      const existingAnswer = userAnswers[currentStep];
      setCurrentAnswerText(existingAnswer?.transcript || "");
      dictationBaseTextRef.current = existingAnswer?.transcript || "";
      finalTranscriptRef.current = "";
      setQuestionStartTime(Date.now());
      speakCurrentQuestion(questionsList[currentStep].question);
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentStep, isFinished, questionsList, speakCurrentQuestion, userAnswers]);

  // ==================================================
  // SPEECH RECOGNITION (FIXED: ZERO DUPLICATION)
  // ==================================================
  const toggleVoiceRecording = useCallback(() => {
    // 1. If currently dictating: Stop cleanly
    if (isDictatingRef.current) {
      isDictatingRef.current = false;
      setIsVoiceActive(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    // 2. Check Browser SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type your answers directly into the box.");
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      // Snapshot current typed answer as the immutable base for this dictation run
      dictationBaseTextRef.current = currentAnswerText;
      finalTranscriptRef.current = "";

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        isDictatingRef.current = true;
        setIsVoiceActive(true);
        isRecognitionStartingRef.current = false;
      };

      rec.onresult = (event) => {
        let interimTranscript = "";

        // Iterate through speech results starting at event.resultIndex
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptChunk = result[0].transcript;

          if (result.isFinal) {
            // Commit final chunk once
            finalTranscriptRef.current += transcriptChunk + " ";
          } else {
            // Collect temporary interim chunk
            interimTranscript += transcriptChunk;
          }
        }

        // Combine base + accumulated final + current interim
        const base = dictationBaseTextRef.current ? dictationBaseTextRef.current.trim() + " " : "";
        const combined = (base + finalTranscriptRef.current + interimTranscript).trim();
        setCurrentAnswerText(combined);
      };

      rec.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setIsVoiceActive(false);
          isDictatingRef.current = false;
        }
      };

      rec.onend = () => {
        // Only restart if candidate is still actively dictating and session is not finished
        if (isDictatingRef.current && !isRecognitionStartingRef.current && !isFinished) {
          try {
            isRecognitionStartingRef.current = true;
            rec.start();
          } catch (e) {
            isRecognitionStartingRef.current = false;
            setIsVoiceActive(false);
            isDictatingRef.current = false;
          }
        } else {
          setIsVoiceActive(false);
          isDictatingRef.current = false;
        }
      };

      recognitionRef.current = rec;
      isRecognitionStartingRef.current = true;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsVoiceActive(false);
      isDictatingRef.current = false;
    }
  }, [currentAnswerText, isFinished]);

  // Clean up SpeechRecognition on unmount
  useEffect(() => {
    return () => {
      isDictatingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Submit Answer & Move to Next Question
  const handleSaveAndNext = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (isDictatingRef.current) {
      isDictatingRef.current = false;
      setIsVoiceActive(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }

    const trimmed = currentAnswerText.trim();
    const durationSec = Math.round((Date.now() - questionStartTime) / 1000);
    const isAnswerProvided = trimmed.length > 5;

    const answerRecord = {
      questionId: questionsList[currentStep]?.id || `q-${currentStep + 1}`,
      questionText: questionsList[currentStep]?.question || "",
      topic: questionsList[currentStep]?.topic || "General",
      presentedAt: new Date(questionStartTime).toISOString(),
      answerEndedAt: new Date().toISOString(),
      transcript: trimmed,
      wordCount: isAnswerProvided ? trimmed.split(/\s+/).filter(Boolean).length : 0,
      answerDurationSeconds: durationSec,
      status: isAnswerProvided ? 'answered' : 'unanswered',
      isAnswered: isAnswerProvided
    };

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentStep] = answerRecord;
    setUserAnswers(updatedAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finalizeInterviewSession(updatedAnswers);
    }
  };

  // Skip Question Handler
  const handleSkipQuestion = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (isDictatingRef.current) {
      isDictatingRef.current = false;
      setIsVoiceActive(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }

    const durationSec = Math.round((Date.now() - questionStartTime) / 1000);
    const skipRecord = {
      questionId: questionsList[currentStep]?.id || `q-${currentStep + 1}`,
      questionText: questionsList[currentStep]?.question || "",
      topic: questionsList[currentStep]?.topic || "General",
      presentedAt: new Date(questionStartTime).toISOString(),
      answerEndedAt: new Date().toISOString(),
      transcript: "[Skipped]",
      wordCount: 0,
      answerDurationSeconds: durationSec,
      status: 'skipped',
      isAnswered: false
    };

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentStep] = skipRecord;
    setUserAnswers(updatedAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finalizeInterviewSession(updatedAnswers);
    }
  };

  // Finalize Session & Run Authentic Evaluation
  const finalizeInterviewSession = async (finalAnswers) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsFinished(true);
    setSessionStatus('COMPLETED');

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = {
      roleName: interviewConfig.roleName || targetRole,
      difficulty: interviewConfig.difficulty || "Intermediate",
      interviewType: interviewConfig.interviewType || "Technical",
      questions: questionsList,
      answers: finalAnswers,
      duration: formattedTime,
      violationsCount: warningCount,
      userId: activeEmail
    };

    let evaluation = null;
    let backendSession = null;

    try {
      const resp = await fetch(`${API_URL}/interview/session/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.evaluation) {
          evaluation = data.evaluation;
          backendSession = data.session;
        }
      }
    } catch (e) {
      console.warn("Backend evaluation endpoint unreachable, falling back to client engine:", e);
    }

    if (!evaluation) {
      evaluation = evaluateInterviewSubmission({
        roleName: interviewConfig.roleName || targetRole,
        difficulty: interviewConfig.difficulty || "Intermediate",
        answers: finalAnswers,
        questions: questionsList,
        userSkills: profile?.skills || [],
        sessionDuration: formattedTime
      });
    }

    setEvaluationResult(evaluation);

    // ONLY SAVE AND LOG TO LOCALSTORAGE IF AT LEAST 1 REAL ANSWER WAS PROVIDED
    if (evaluation.isValid && evaluation.answeredCount > 0) {
      try {
        const historyKey = `interview_history_${activeEmail}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const newEntry = backendSession || {
          id: `sess-${Date.now()}`,
          roleName: interviewConfig.roleName || targetRole,
          difficulty: interviewConfig.difficulty || "Intermediate",
          score: evaluation.overallScore,
          duration: formattedTime,
          answeredCount: evaluation.answeredCount,
          questionCount: totalQuestions,
          date: evaluation.completedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          evaluation: evaluation,
          violationsCount: warningCount
        };
        const updatedHistory = [newEntry, ...existingHistory];
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      } catch (e) {}

      // Log to Backend Analytics API
      try {
        await fetch(`${API_URL}/analytics/activity/record`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: activeEmail,
            activity_type: "mock_interview",
            title: `Completed Mock Interview: ${interviewConfig.roleName || targetRole}`,
            duration_minutes: 20,
            metadata: {
              role: interviewConfig.roleName || targetRole,
              score: evaluation.overallScore,
              duration: formattedTime,
              answeredCount: evaluation.answeredCount
            }
          })
        });
      } catch (e) {}
    }
  };

  const activeQuestion = questionsList[currentStep] || {
    question: "Walk me through your foundational background and experience.",
    topic: "Introduction",
    type: "General"
  };

  // ==================================================
  // 1. TERMINATED FOR VIOLATIONS VIEW
  // ==================================================
  if (isFinished && terminationInfo) {
    const answeredCount = terminationInfo.questionsAnswered;
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 font-manrope animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-8 sm:p-12 border border-rose-200 dark:border-rose-900/40 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">
              Interview Terminated • 3 Proctoring Violations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Session Terminated
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              {terminationInfo.terminationReason}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto text-left space-y-2">
            <div className="flex justify-between font-bold">
              <span>Target Role:</span>
              <span className="text-gray-900 dark:text-white">{interviewConfig.roleName}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Questions Answered:</span>
              <span className="text-primary">{answeredCount} of {totalQuestions}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Proctoring Warnings:</span>
              <span className="text-rose-600 font-extrabold">3 / 3 (Limit Reached)</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Status:</span>
              <span className="text-rose-600">terminated_for_violations</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/role-interviews')}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Back to Studio
            </button>
            <button
              onClick={() => {
                setIsFinished(false);
                setTerminationInfo(null);
                setCurrentStep(0);
                setUserAnswers(Array(totalQuestions).fill(null));
                setCurrentAnswerText("");
                setElapsedSeconds(0);
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Interview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // 2. ZERO-ANSWER PROTECTION VIEW
  // ==================================================
  if (isFinished && evaluationResult && !evaluationResult.isValid) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 font-manrope animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-white/[0.08] shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
              Session Concluded • No Responses Submitted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Interview Not Completed
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              You did not submit any responses (<strong>0 of {totalQuestions}</strong> questions answered), so PREPRIA cannot evaluate your performance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto text-left space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Target Role:</span>
              <span className="text-gray-900 dark:text-white">{interviewConfig.roleName}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Questions Answered:</span>
              <span className="text-rose-600">0 of {totalQuestions}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Elapsed Duration:</span>
              <span className="text-gray-900 dark:text-white">{formattedTime}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Evaluation Status:</span>
              <span className="text-amber-600">Not Evaluated</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/role-interviews')}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Back to Studio
            </button>
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentStep(0);
                setUserAnswers(Array(totalQuestions).fill(null));
                setCurrentAnswerText("");
                setElapsedSeconds(0);
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Interview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // 3. VALID EVALUATION REPORT VIEW
  // ==================================================
  if (isFinished && evaluationResult && evaluationResult.isValid) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-manrope animate-in fade-in duration-300">
        
        {/* Completion Header */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
              Interview Evaluation Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {interviewConfig.roleName} Performance Report
            </h1>
            <p className="text-xs text-gray-500 max-w-lg mx-auto">
              Completed <strong>{evaluationResult.answeredCount} of {totalQuestions}</strong> questions in <strong>{formattedTime}</strong>
            </p>
          </div>

          {/* Score & Completion Summary Dial */}
          <div className="p-6 rounded-3xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 max-w-md mx-auto flex items-center justify-around">
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Overall Score</span>
              <span className="text-4xl font-extrabold text-primary">{evaluationResult.overallScore}%</span>
            </div>
            <div className="h-10 w-px bg-orange-200 dark:bg-orange-800" />
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Readiness Status</span>
              <span className="text-sm font-extrabold text-emerald-600 block mt-1">
                {evaluationResult.overallScore >= 75 ? "Strong Candidate" : "Developing"}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Pillar Scorecard Grid */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <h2 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>5-Pillar Competency Breakdown</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Technical / Role", score: evaluationResult.dimensions.technicalKnowledge },
              { label: "Problem Solving", score: evaluationResult.dimensions.problemSolving },
              { label: "Communication", score: evaluationResult.dimensions.communication },
              { label: "Role Knowledge", score: evaluationResult.dimensions.roleKnowledge },
              { label: "Confidence", score: evaluationResult.dimensions.confidence },
            ].map((dim, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">{dim.label}</span>
                <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 block">{dim.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Question-Wise Detailed Analysis */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <h2 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Question-by-Question Response Audit</span>
          </h2>

          <div className="space-y-3 text-xs">
            {evaluationResult.questionEvaluations?.map((qEval, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 dark:text-white">
                    Q{qEval.questionIndex}: {qEval.question}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    qEval.status === 'answered'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {qEval.status === 'answered' ? `${qEval.score}% Score` : 'Skipped / Unanswered'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  <strong>Your Response: </strong>
                  {qEval.answerText}
                </div>

                {qEval.wordCount > 0 && (
                  <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                    <span>Word Count: {qEval.wordCount} words</span>
                    <span>STAR Alignment: {qEval.hasSTARStructure ? "✓ Detected" : "General Structure"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvement Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Identified Strengths</span>
            </h3>
            <div className="space-y-2 text-xs">
              {evaluationResult.strengths?.map((str, sIdx) => (
                <div key={sIdx} className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-gray-800 dark:text-gray-200 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Recommended PREPRIA Preparation</span>
            </h3>
            <div className="space-y-2 text-xs">
              {evaluationResult.improvements?.map((imp, iIdx) => (
                <div key={iIdx} className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1.5">
                  <span className="font-extrabold text-amber-800 dark:text-amber-300 block">{imp.topic}</span>
                  <p className="text-gray-600 dark:text-gray-300">{imp.description}</p>
                  <button
                    onClick={() => navigate(imp.actionPath)}
                    className="text-primary font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <span>{imp.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate('/role-interviews')}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 cursor-pointer"
          >
            Back to Studio
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentStep(0);
                setUserAnswers(Array(totalQuestions).fill(null));
                setCurrentAnswerText("");
                setElapsedSeconds(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Session</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover shadow-md shadow-primary/25 cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>

      </div>
    );
  }

  // ==================================================
  // 4. LIVE QUESTION & PROCTORING WORKSPACE
  // ==================================================
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-manrope animate-in fade-in duration-300">
      
      {/* Active Proctoring Warning Toast */}
      {activeWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <span>{activeWarning}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {screenShareStatus === 'inactive' && (
              <button
                type="button"
                onClick={handleResumeScreenShare}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B00]/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Resume Screen Sharing</span>
              </button>
            )}
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 shrink-0">
              Warning {warningCount} of {maxWarnings}
            </span>
          </div>
        </div>
      )}

      {/* Top Header Bar: Role, Timer, Proctoring Badges */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
              {interviewConfig.roleName} ({interviewConfig.interviewType})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-primary text-[10px] font-extrabold border border-orange-200 dark:border-orange-900/30">
              {interviewConfig.difficulty || "Intermediate"}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 block mt-0.5">
            Question {currentStep + 1} of {totalQuestions}
          </span>
        </div>

        {/* Proctoring Status & Timer */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Proctoring live badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider ${
            warningCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-200 dark:border-amber-900/40'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200 dark:border-emerald-900/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${warningCount > 0 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span>PROCTORED LIVE • Warnings: {warningCount}/{maxWarnings}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>⏱ {formattedTime}</span>
          </div>

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              speechEnabled ? 'bg-orange-50 border-orange-200 text-primary' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
            title={speechEnabled ? "Voice Output Enabled" : "Voice Output Muted"}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/role-interviews')}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 text-xs font-bold cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.round(((currentStep + 1) / totalQuestions) * 100)}%` }}
        />
      </div>

      {/* 2-Column Live Session: Left = Camera & Question, Right = Answer Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Question & Video Monitor */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Camera Viewport */}
          <div className="relative aspect-video rounded-3xl bg-black overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-center">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
            />

            {cameraStatus !== 'active' && (
              <div className="text-center p-4 text-gray-400">
                <VideoOff className="w-8 h-8 mx-auto mb-1 opacity-50 text-rose-500" />
                <span className="text-xs font-bold text-rose-400">Camera Feed Interrupted</span>
              </div>
            )}

            {/* Live Monitoring Badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Cam {cameraStatus === 'active' ? '✓' : '✕'} • Mic {microphoneStatus === 'active' ? '✓' : '✕'} • Screen {screenShareStatus === 'active' ? '✓' : '✕'}
                </span>
              </div>

              <div className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                faceDetected ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white animate-pulse'
              }`}>
                {faceDetected ? "✓ Face Visible" : "⚠ Face Not Detected"}
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl ${isAiSpeaking ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'} flex items-center justify-center`}>
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isAiSpeaking ? "Interviewer Asking..." : "Question Prompt"}
                </span>
              </div>

              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {activeQuestion.topic || "Core Concept"}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-relaxed">
              "{activeQuestion.question}"
            </h2>
          </div>

        </div>

        {/* RIGHT COLUMN: Candidate Answer Workspace */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Your Live Response</span>
            </h3>

            <button
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isVoiceActive
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/25'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {isVoiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-primary" />}
              <span>{isVoiceActive ? "Stop Dictation" : "Dictate via Voice"}</span>
            </button>
          </div>

          <textarea
            value={currentAnswerText}
            onChange={(e) => {
              setCurrentAnswerText(e.target.value);
              dictationBaseTextRef.current = e.target.value;
            }}
            placeholder="Type or dictate your genuine response here. Reference real projects, architectural tradeoffs, and quantitative outcomes..."
            rows={8}
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>{currentAnswerText.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>STAR: Situation • Task • Action • Result</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
            <button
              onClick={handleSkipQuestion}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Skip Question
            </button>

            <button
              onClick={handleSaveAndNext}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStep === totalQuestions - 1 ? "Submit & View Evaluation" : "Next Question"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
