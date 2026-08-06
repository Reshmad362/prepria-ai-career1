import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, VideoOff, CheckCircle2, Eye, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { speakQuestion, cancelSpeech } from '../utils/speechAnalysis';
import { generateQuestions, generateFollowUp } from '../utils/api';
import { logActivity } from '../utils/activityLogger';
import InterviewSetup from '../components/InterviewSetup';
import RoleMockInterview from '../components/RoleMockInterview';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 p-6 text-center">
           <div className="max-w-xl bg-slate-800 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
             <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
             <h2 className="text-3xl font-bold text-white mb-4">Session Crash Prevented</h2>
             <p className="text-lg text-slate-400 mb-8">{this.state.error?.message || "An unexpected error occurred during execution."}</p>
             <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition">
               Reload Session
             </button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Avatar Component (Simulating AI Interviewer)
const AIAvatar = ({ isSpeaking, state }) => {
  let ringColor = 'bg-slate-500';
  let borderColor = 'border-slate-700';
  
  if (state === 'AI_SPEAKING') {
    ringColor = 'bg-blue-500';
    borderColor = 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]';
  } else if (state === 'LISTENING') {
    ringColor = 'bg-green-500';
    borderColor = 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
  } else if (state === 'PROCESSING') {
    ringColor = 'bg-purple-500';
    borderColor = 'border-purple-500';
  }

  return (
    <div className="relative w-36 h-36 mx-auto mb-6 transition-all duration-500">
      {isSpeaking && (
        <motion.div 
          className={`absolute inset-0 rounded-full ${ringColor} opacity-30`}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}
      <div className={`w-36 h-36 rounded-full overflow-hidden border-4 flex items-center justify-center bg-slate-800 transition-all duration-300 ${borderColor}`}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center shadow-inner relative overflow-hidden">
           {/* Abstract face representation */}
           <motion.div 
             animate={{ y: isSpeaking ? [0, -3, 3, 0] : 0 }} 
             transition={{ repeat: Infinity, duration: 0.5 }}
             className="w-10 h-3 bg-white/30 rounded-full blur-sm absolute bottom-4" 
           />
           <div className="flex gap-4 absolute top-6">
              <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-white' : 'bg-white/50'} transition-all`}></div>
              <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-white' : 'bg-white/50'} transition-all`}></div>
           </div>
        </div>
      </div>
      
      {/* State Badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-full shadow-lg text-xs font-bold tracking-wider text-slate-300 whitespace-nowrap">
        {state === 'AI_SPEAKING' && 'AI SPEAKING'}
        {state === 'LISTENING' && <span className="text-green-400 flex items-center gap-2"><Mic className="w-3 h-3"/> LISTENING</span>}
        {state === 'PROCESSING' && <span className="text-purple-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> PROCESSING</span>}
      </div>
    </div>
  );
};

function InterviewScreenComponent() {
  const navigate = useNavigate();
  
  // High Level Phase: 'setup', 'interview', 'finished', 'aborted'
  const [phase, setPhase] = useState('setup');
  
  // Setup logic
  const [role, setRole] = useState('Software Engineer');
  const [personality, setPersonality] = useState('standard');
  const [difficulty, setDifficulty] = useState('medium');
  
  // 1. Conversation State Engine
  const [conversationState, setConversationState] = useState('AI_SPEAKING'); // AI_SPEAKING, LISTENING, PROCESSING
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  // New State: Strict Question Flow & Context
  const [mainQuestionIndex, setMainQuestionIndex] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [resumeContext, setResumeContext] = useState(null);
  
  // Distraction & Behavioral tracking (ML Based)
  const [distractions, setDistractions] = useState(0); // Tab switches, multiple faces, etc.
  const [faceDetected, setFaceDetected] = useState(true);
  const [faceLosses, setFaceLosses] = useState(0);
  const [abortReason, setAbortReason] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [liveAlert, setLiveAlert] = useState(""); // UI warning popups
  
  const faceDetectionIntervalRef = useRef(null);
  
  // Audio & Recording logic
  const streamRef = useRef(null);
  const [, forceRender] = useState({});
  const triggerRender = () => forceRender({});

  const micLevelRef = useRef(null);
  const [transcriptDisplay, setTranscriptDisplay] = useState("");
  const [cameraLost, setCameraLost] = useState(false);
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioAnimRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const retryCountRef = useRef(0);
  
  // Media Recording & Analysis Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const phaseStartTimeRef = useRef(null);

  // Initialize AudioContext only once
  useEffect(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      } catch (e) {
        console.warn("AudioContext init failed", e);
      }
    }

    // Load Resume Context
    try {
      const activeEmail = localStorage.getItem("activeUser") || "default";
      const savedContext = localStorage.getItem(`activeInterviewContext_${activeEmail}`);
      if (savedContext) {
         setResumeContext(JSON.parse(savedContext));
      }
    } catch(e){}

    // Lazy Load face-api.js
    const loadFaceApi = async () => {
       if (window.faceapi) {
          await loadModels();
          return;
       }
       const script = document.createElement('script');
       script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1/dist/face-api.min.js";
       script.async = true;
       script.onload = () => loadModels();
       document.body.appendChild(script);
    };
    
    const loadModels = async () => {
       try {
          await window.faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
          setModelsLoaded(true);
          console.log("[InterviewScreen] ML Models loaded successfully.");
       } catch(e) {
          console.error("[InterviewScreen] ML Models failed to load via CDN", e);
       }
    };
    
    loadFaceApi();

  }, []);

  // Clean on unmount completely
  useEffect(() => {
    return () => {
      console.log("[InterviewScreen] Unmounting entirely. Cleaning up all streams and contexts.");
      cancelSpeech();
      if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
         audioCtxRef.current.close().catch(()=>{});
      }
      if (audioAnimRef.current) cancelAnimationFrame(audioAnimRef.current);
      if (recognitionRef.current) {
          try { recognitionRef.current.stop() } catch(e){}
      }
    };
  }, []);

  // Provide a reconnect mechanism
  const reconnectStream = async () => {
    try {
      console.log("[InterviewScreen] Auto-reconnecting stream...");
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = newStream;
      if (videoRef.current) {
         videoRef.current.srcObject = newStream;
         await videoRef.current.play();
      }
      setCameraLost(false);
    } catch(e) {
      console.error("[InterviewScreen] Reconnect error:", e);
    }
  };

  const stopPhaseMedia = () => {
    if (audioAnimRef.current) cancelAnimationFrame(audioAnimRef.current);
    if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch(e){}
    }
  };

  // 2. Camera Stability Fix
  useEffect(() => {
    let reqId;

    const initStream = async () => {
      if (videoRef.current && streamRef.current && phase === 'interview') {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        try { 
          await videoRef.current.play(); 
          setCameraLost(false);
        } catch(e){
          console.error("[InterviewScreen] Video play fail", e);
        }
      }
    };
    initStream();

    // Check camera freezing via requestAnimationFrame instead of setInterval
    if (phase === 'interview') {
       const checkCamera = () => {
           if (videoRef.current && streamRef.current) {
              const tracks = streamRef.current.getVideoTracks();
              // Only consider camera fully lost if tracks are actually destroyed / detached
              if (tracks.length === 0 || tracks[0].readyState === "ended") {
                 setCameraLost(true);
              } else {
                 setCameraLost(false);
              }
           }
           reqId = requestAnimationFrame(checkCamera);
       };
       reqId = requestAnimationFrame(checkCamera);
    }

    return () => {
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [phase]); // Re-run when switching phase to reattach video!

  // Distraction Tracker
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'interview') {
        setDistractions(prev => prev + 1);
        if (distractions + faceLosses >= 3) {
          abortInterview("Multiple tab switching/visibility violations detected (Cheating).");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, distractions, faceLosses]);

  // Anti-Cheating: ML Face Tracking Loop
  useEffect(() => {
     if (phase === 'interview' && modelsLoaded && videoRef.current && streamRef.current) {
        faceDetectionIntervalRef.current = setInterval(async () => {
           if (videoRef.current.paused || videoRef.current.ended) return;
           try {
               const detections = await window.faceapi.detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions());
               
               if (detections.length === 0) {
                   setFaceDetected(false);
                   setLiveAlert("⚠️ Face not detected. Please look at the camera.");
                   setFaceLosses(prev => {
                       const next = prev + 1;
                       if (next + distractions >= 3) abortInterview("Face not visible multiple times (Cheating violation).");
                       return next;
                   });
               } else if (detections.length > 1) {
                   setLiveAlert("⚠️ Multiple faces detected!");
                   setDistractions(prev => {
                       const next = prev + 1;
                       if (next + faceLosses >= 3) abortInterview("Multiple faces detected in frame (Cheating violation).");
                       return next;
                   });
               } else {
                   setFaceDetected(true);
                   setLiveAlert(""); // Clear warning
               }
           } catch(e) { }
        }, 3000); // Check every 3 seconds to save CPU
     }
     return () => {
        if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
     };
  }, [phase, modelsLoaded, distractions, faceLosses]);

  const abortInterview = (reason) => {
    setPhase('aborted');
    setAbortReason(reason);
    stopPhaseMedia();
    logActivity({ type: "interview_failed", title: "Interview Aborted", message: reason, status: "warning" });
  };

  const handleStartInterview = () => {
    setPhase('interview');
    
    // Generate First Context-Aware Question
    setConversationState('PROCESSING');
    
    let resumePrompt = "";
    if (resumeContext) {
       resumePrompt = `
       The candidate's resume includes:
       - Skills: ${resumeContext.skills?.join(', ') || 'None'}
       - Experience: ${typeof resumeContext.experience === 'string' ? resumeContext.experience : 'Multiple roles'}
       - Projects: ${resumeContext.projects?.map(p => typeof p === 'string' ? p : p.name).join(', ') || 'None'}
       
       Start the interview with a welcoming tone and ask the VERY FIRST question. Make it a broad but personalized technical/behavioral question based on their resume experience or projects.
       `;
    }

    try {
      const p = resumePrompt || `Start the interview. Say hello and ask the first main question for a ${difficulty} level ${role} interview. Keep it concise.`;
      const resp = generateQuestions(p); // This should be asynchronous if using external API
      
      const initialQuestion = "Hello, let's begin. Can you tell me about yourself and your background in this field?";
      
      setCurrentQuestion({ 
        question: initialQuestion, 
        type: "Main Question",
        isRetry: false
      });
      setMainQuestionIndex(1);
      setFollowUpCount(0);
      setAskedQuestions([initialQuestion]);
      
    } catch (e) {
      console.error("Failed first question gen, using fallback", e);
      const fallback = "Hello! Let's begin. Could you start by walking me through your background and experience?";
      setCurrentQuestion({ 
        question: fallback,
        type: "Main Question", 
        isRetry: false 
      });
      setMainQuestionIndex(1);
      setFollowUpCount(0);
      setAskedQuestions([fallback]);
    }
    
    setConversationState('AI_SPEAKING');
  };

  // State Machine Orchestrator
  useEffect(() => {
    if (phase !== 'interview' || !currentQuestion) return;

    if (conversationState === 'AI_SPEAKING') {
      executeAISpeech();
    } else if (conversationState === 'LISTENING') {
      startListeningPhase();
    } else if (conversationState === 'PROCESSING') {
      processUserAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationState, currentQuestion, phase]);

  const executeAISpeech = () => {
    cancelSpeech(); // stop any ongoing
    transcriptRef.current = ""; // Reset transcript
    setTranscriptDisplay("");
    
    const textToSpeak = currentQuestion.isRetry ? currentQuestion.retryText : currentQuestion.question;

    // Simulate speaking animation for AI Avatar
    const utterance = speakQuestion(textToSpeak, { rate: 0.95, pitch: 1.0 });
    if (utterance) {
      utterance.onend = () => {
         setTimeout(() => setConversationState('LISTENING'), 500); // Breathe gap
      };
      utterance.onerror = () => {
         setTimeout(() => setConversationState('LISTENING'), 2000);
      };
    } else {
      // Fallback if Speech API fails or blocked
      setTimeout(() => setConversationState('LISTENING'), 4000);
    }
  };

  // 3 & 4. Smart Silence Detection & Transcript Handling
  const startListeningPhase = () => {
    isListeningRef.current = true;
    transcriptRef.current = "";
    setTranscriptDisplay("");
    phaseStartTimeRef.current = Date.now();

    // Start MediaRecorder if stream exists
    if (streamRef.current) {
        recordedChunksRef.current = [];
        try {
            let options = { mimeType: 'video/webm;codecs=vp8,opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/mp4' }; 
            }
            const mediaRecorder = new MediaRecorder(streamRef.current, options);
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };
            mediaRecorder.start(200);
            mediaRecorderRef.current = mediaRecorder;
        } catch (e) {
            console.warn("MediaRecorder start failed or not supported in this environment", e);
        }
    }
    
    // Initialize WebKit Speech ONCE and reuse it
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onerror = (e) => console.warn("Recognition error", e.error);
      recognitionRef.current = recognition;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onresult = (e) => {
        let finalTranscript = '';
        for (let i = 0; i < e.results.length; ++i) {
          finalTranscript += e.results[i][0].transcript;
        }
        transcriptRef.current = finalTranscript;
        setTranscriptDisplay(finalTranscript);
      };
      try { recognitionRef.current.start(); } catch(e){}
    }

    // AudioContext Silence Detection
    try {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
         audioCtxRef.current.resume();
      }
      
      if (!analyserRef.current && audioCtxRef.current && streamRef.current) {
          const analyser = audioCtxRef.current.createAnalyser();
          analyser.minDecibels = -70; // Sensivitiy adjust
          const source = audioCtxRef.current.createMediaStreamSource(streamRef.current);
          source.connect(analyser);
          analyserRef.current = analyser;
      }
      
      let silenceStart = null;
      let firstSpeechDetectedAt = null;

      const trackAudio = () => {
        if (!isListeningRef.current || !analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avgVolume = sum / dataArray.length;
        
        // Direct DOM update instead of React state for 60fps
        if (micLevelRef.current) {
           const barWidth = Math.min(100, Math.max(0, (avgVolume / 50) * 100));
           micLevelRef.current.style.width = `${barWidth}%`;
        }

        if (avgVolume > 15) { 
           // Speech happening
           silenceStart = null;
           if (!firstSpeechDetectedAt) firstSpeechDetectedAt = Date.now();
        } else {
           // Silence
           if (!silenceStart) {
             silenceStart = Date.now();
           } else {
             const silenceDuration = Date.now() - silenceStart;
             
             // Detect silence > 2.5s strictly
             if (firstSpeechDetectedAt && silenceDuration > 2500) {
                 isListeningRef.current = false;
                 setConversationState('PROCESSING');
                 return; 
             }
             
             // Empty Answer Protection - Wait max 12s for them to start speaking
             if (!firstSpeechDetectedAt && silenceDuration > 12000) {
                 isListeningRef.current = false;
                 handleEmptyAnswer();
                 return;
             }
           }
        }
        audioAnimRef.current = requestAnimationFrame(trackAudio);
      };
      
      trackAudio();
    } catch(e) {
      console.warn("AudioTracking setup failed", e);
      setTimeout(() => {
         if (isListeningRef.current) {
            isListeningRef.current = false;
            setConversationState('PROCESSING');
         }
      }, 15000);
    }
  };

  const analyzeTranscript = (question, transcript, durationSec) => {
    if (!transcript || transcript.trim().length === 0) {
       return {
          fillerWordsCount: 0,
          starUsage: 0,
          answerQualityScore: 0,
          confidenceScore: 0,
          strengths: "N/A",
          weaknesses: "No speech detected or recorded.",
          suggestion: "Please ensure your microphone is working and speak clearly."
       };
    }
    
    const text = transcript.toLowerCase();
    const words = text.split(/\s+/);
    
    // Fillers Count
    const fillerWordsMap = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'right', 'so yeah'];
    let fillerCount = 0;
    fillerWordsMap.forEach(fw => {
       const regex = new RegExp(`\\b${fw}\\b`, 'g');
       const match = text.match(regex);
       if (match) fillerCount += match.length;
    });

    // STAR Method Detection
    const starKeywords = ['situation', 'task', 'action', 'result', 'project', 'responsibility', 'implemented', 'led to', 'managed', 'developed', 'goal'];
    let starMatches = 0;
    starKeywords.forEach(kw => {
       if (text.includes(kw)) starMatches++;
    });
    const starUsage = Math.min(100, Math.round((starMatches / 4) * 100));

    // WPM and Confidence 
    const wpm = (durationSec > 0) ? (words.length / (durationSec / 60)) : 0;
    let confidenceScore = 0;
    if (wpm >= 100 && wpm <= 160) confidenceScore = 95 - (fillerCount * 2);
    else if (wpm > 160) confidenceScore = 80 - (fillerCount * 2);
    else if (wpm >= 60) confidenceScore = 70 + Math.floor((wpm - 60) / 2) - (fillerCount * 2);
    else confidenceScore = Math.floor(wpm) - (fillerCount * 2);
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    // Answer Quality
    let answerQualityScore = Math.min(100, Math.round( (words.length / 40) * 100 ));
    if (starUsage > 0) answerQualityScore += 10;
    answerQualityScore = Math.max(0, Math.min(100, answerQualityScore));

    // Generate Adaptive Feedback Iterations
    let strengths = "Good initial effort.";
    let weaknesses = "Try to elaborate significantly more.";
    let suggestion = "Focus on describing practical details and outcomes.";

    if (answerQualityScore > 70) strengths = "Strong vocabulary and comprehensive detail length.";
    if (confidenceScore > 80) strengths += " Maintained a steady, confident speaking pace.";
    
    if (fillerCount > 4) weaknesses = "Very high usage of filler words detected.";
    else if (fillerCount > 1) weaknesses = "A few filler words occasionally disrupted flow.";
    
    if (starUsage === 0) suggestion = "Try using the STAR method (Situation, Task, Action, Result) to give your answer stronger structure.";
    else if (starUsage < 50) suggestion = "You hit on some aspects of the STAR method; make sure to explicitly highlight the actual Result.";
    else suggestion = "Excellent use of structured, action-oriented storytelling.";

    // Generate an Ideal Answer based on the question context
    let idealAnswer = "An ideal response would directly address the core of the question using the STAR method. For example: 'In my previous role, we faced [Situation]. I was tasked with [Task]. I implemented [Action], which resulted in [Result].'";
    if (question.toLowerCase().includes("tell me about yourself")) {
       idealAnswer = "I am a driven professional with a background in this field. Most recently, I worked at [Company] where I led [Key Project/Initiative]. I specialize in [Core Skill], and I'm passionate about [Industry/Domain]. I'm looking to bring my expertise in [Skill] to this role to drive [Business Value].";
    } else if (question.toLowerCase().includes("project")) {
       idealAnswer = "A project I'm particularly proud of is [Project Name]. The goal was to solve [Problem]. I took the initiative to design [Solution architecture/Approach]. By collaborating with [Teams], we successfully delivered the project ahead of schedule, resulting in a [X]% increase in efficiency and [Y]% cost savings.";
    } else if (question.toLowerCase().includes("weakness")) {
       idealAnswer = "Early in my career, I found I sometimes took on too much at once. To address this, I started using rigid prioritization frameworks like Eisenhower matrices and time-blocking. As a result, I'm now highly organized and rarely miss deadlines, even under pressure.";
    }

    return {
       fillerWordsCount: fillerCount,
       starUsage,
       answerQualityScore,
       confidenceScore,
       strengths,
       weaknesses,
       suggestion,
       idealAnswer
    };
  };



  const stopAndGetVideoBase64 = () => {
     return new Promise((resolve) => {
         if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
             resolve(null);
             return;
         }
         
         mediaRecorderRef.current.onstop = () => {
             const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
             recordedChunksRef.current = [];
             
             const reader = new FileReader();
             reader.readAsDataURL(blob);
             reader.onloadend = () => resolve(reader.result);
             reader.onerror = () => resolve(null);
         };
         
         try {
             mediaRecorderRef.current.stop();
         } catch (e) {
             console.error("Stop media error", e);
             resolve(null);
         }
     });
  };

  const skipCurrentQuestion = async (reasonAnswer = "No response") => {
      stopPhaseMedia();
      const processingStartTime = Date.now();
      const durationSec = phaseStartTimeRef.current ? Math.round((processingStartTime - phaseStartTimeRef.current)/1000) : 0;
      const base64Video = await stopAndGetVideoBase64();
      
      const stats = analyzeTranscript(currentQuestion.question, "", durationSec);

      const historyUpdate = [...conversationHistory, { 
        question: currentQuestion.question, 
        answerTranscript: reasonAnswer,
        videoBlobURL: base64Video,
        audioBlobURL: null, // Unified in video
        duration: durationSec,
        status: "skipped",
        ...stats
      }];
      setConversationHistory(historyUpdate);
      retryCountRef.current = 0; // reset
      
      if (historyUpdate.length >= 5) {
        finishInterview(historyUpdate);
        return;
      }
      
      // Go to processing while getting new question
      setConversationState('PROCESSING');
      
      let weakPromptAddon = "";
      try {
         const activeEmail = localStorage.getItem("activeUser") || "default";
         const existingInsightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
         if (existingInsightsStr) {
            const insights = JSON.parse(existingInsightsStr);
            if (insights.weakAreas && insights.weakAreas.length > 0) {
               weakPromptAddon = ` Note: The user struggles with: ${insights.weakAreas.join(', ')}. Bias the question appropriately.`;
            }
         }
      } catch(e) {}

      try {
        const prompt = `The candidate skipped the last question or couldn't hear. Generate a new, different interview question. Target Role: ${role}.${weakPromptAddon}`;
        const resp = await generateFollowUp(prompt);
        if (resp?.question) {
           setCurrentQuestion({ question: resp.question, type: resp.type || "Dynamic Follow-up", isRetry: false });
        } else {
           setCurrentQuestion({ question: "Let's move to something else. Can you describe a project you are proud of?", type: "Follow-up", isRetry: false });
        }
      } catch (err) {
        setCurrentQuestion({ question: "Let's move on. What would you say is your strongest skill?", type: "Follow-up", isRetry: false });
      }
      setConversationState('AI_SPEAKING');
  };

  const handleEmptyAnswer = () => {
    retryCountRef.current += 1;
    
    if (retryCountRef.current >= 3) {
      skipCurrentQuestion("No response");
    } else {
      const prompts = [
        "I didn't quite catch that. Could you speak a bit louder?",
        "Sorry, I couldn't hear you. Could you repeat?",
        "I'm still not receiving any audio. Let's try answering again."
      ];
      const retryText = prompts[(retryCountRef.current - 1) % prompts.length];
      
      setCurrentQuestion(prev => ({
         ...prev,
         isRetry: true,
         retryText: retryText
      }));
      setConversationState('AI_SPEAKING');
    }
  };

  const processUserAnswer = async () => {
     stopPhaseMedia();
     
     const processingStartTime = Date.now();
     const durationSec = phaseStartTimeRef.current ? Math.round((processingStartTime - phaseStartTimeRef.current)/1000) : 0;
     const base64Video = await stopAndGetVideoBase64();

     const finalAns = transcriptRef.current;

     // 10. Auto-Reconnect if stream died before proceeding
     if (cameraLost) {
         await reconnectStream();
     }
     
     // Optional: Face detection rule mapping (dummy for now)
     if (!faceDetected) setFaceLosses(prev => prev + 1);

     // Handle cases where volume was detected but speech recognition returned nothing
     if (finalAns.trim().length === 0) {
        handleEmptyAnswer();
        return;
     }

     // 4. Check Transcript length (Brief answer)
     if (finalAns.trim().length < 15) {
        retryCountRef.current += 1;
        if (retryCountRef.current >= 3) {
           skipCurrentQuestion(finalAns);
        } else {
           setCurrentQuestion(prev => ({ 
              ...prev,
              isRetry: true,
              retryText: "Could you elaborate a bit more on that? Your answer was quite brief."
           }));
           setConversationState('AI_SPEAKING');
        }
        return;
     }

     // Success! Real Answer Detected. Track it.
     retryCountRef.current = 0; 
     
     // Run true analysis metrics
     const stats = analyzeTranscript(currentQuestion.question, finalAns, durationSec);

     // 7. Save to conversation memory
     const historyUpdate = [...conversationHistory, { 
       question: currentQuestion.question, 
       answerTranscript: finalAns,
       videoBlobURL: base64Video,
       audioBlobURL: null,
       duration: durationSec,
       status: "answered",
       ...stats
     }];
     setConversationHistory(historyUpdate);

     // Terminate interview after 10 Main Questions
     if (mainQuestionIndex >= 10 && followUpCount >= 2) {
        finishInterview(historyUpdate);
        return;
     }

     setConversationState('PROCESSING');
     
     // Progression Logic
     let isFollowUp = true;
     let nextMainIndex = mainQuestionIndex;
     let nextFollowUpCount = followUpCount + 1;
     
     // We do 2 follow-ups per main question
     if (nextFollowUpCount > 2) {
         isFollowUp = false;
         nextMainIndex += 1;
         nextFollowUpCount = 0;
     }

     let weakPromptAddon = "";
     try {
        const activeEmail = localStorage.getItem("activeUser") || "default";
        const existingInsightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
        if (existingInsightsStr) {
           const insights = JSON.parse(existingInsightsStr);
           if (insights.weakAreas && insights.weakAreas.length > 0) {
              weakPromptAddon = ` The user struggles with: ${insights.weakAreas.join(', ')}. Target these weaknesses.`;
           }
        }
     } catch(e) {}

     const depthStr = isFollowUp ? 'DEEP DIVE / FOLLOW-UP' : 'NEW MAIN TOPIC';
     let resumeInstruction = resumeContext 
         ? `Ensure the question aligns with their skills: ${resumeContext.skills?.join(', ')}. ` 
         : '';

     // Generate intelligent Next Question based on history
     try {
       const prompt = `
       This is question ${nextMainIndex}/10. Current phase: ${depthStr}.
       Candidate's last answer: "${finalAns}".
       ${resumeInstruction}
       Previously asked questions: ${JSON.stringify(askedQuestions)}. DO NOT REPEAT THESE.
       ${weakPromptAddon}
       
       Generate a natural, challenging ${isFollowUp ? 'follow-up' : 'new main'} question.
       If it's a follow-up, probe deeper into their last answer. 
       If it's a new main topic, pick a DIFFERENT skill or project from their resume.
       Keep the question concise and conversational.
       `;
       
       const resp = await generateFollowUp(prompt);
       console.log("[InterviewScreen] generateFollowUp response:", resp); 
       
       if (resp?.question) {
          setCurrentQuestion({ question: resp.question, type: isFollowUp ? `Follow-up (${nextFollowUpCount}/2)` : `Main Q${nextMainIndex}`, isRetry: false });
          setAskedQuestions(prev => [...prev, resp.question]);
          setMainQuestionIndex(nextMainIndex);
          setFollowUpCount(nextFollowUpCount);
       } else {
          // Fallback dynamic gen
          setCurrentQuestion({ question: "Can you provide a specific example of when you applied this?", type: "Follow-up", isRetry: false });
       }
     } catch (err) {
       console.error("API Error generating follow-up:", err);
       setCurrentQuestion({ question: "Interesting point. What was the most challenging aspect of that?", type: "Follow-up", isRetry: false });
     }
     
     setConversationState('AI_SPEAKING');
  };

  const finishInterview = (finalHistory) => {
    setPhase('finished');
    stopPhaseMedia();
    
    // Calculate Score based on metrics
    let techScore = 0;
    let commScore = 0;
    let confScore = 0;

    const answered = finalHistory.filter(h => h.status === 'answered');
    if (answered.length > 0) {
       const sumQuality = answered.reduce((acc, curr) => acc + (curr.answerQualityScore || 0), 0);
       const sumConf = answered.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0);
       
       techScore = Math.round(sumQuality / answered.length);
       confScore = Math.round(sumConf / answered.length);
       
       // Calculate Communication: Penalty for filler words (e.g. >3 per answer lowers score)
       const avgFillers = answered.reduce((acc, curr) => acc + (curr.fillerWordsCount || 0), 0) / answered.length;
       commScore = Math.max(0, 100 - (avgFillers * 5)); // Base 100, minus 5 per avg filler word
    }

    const overallScore = Math.round((techScore + commScore + confScore) / 3) || 0;

    // Build the robust Session standard
    const newSession = {
      sessionId: `session_${Date.now()}`,
      role, 
      difficulty, 
      personality, 
      distractionCount: distractions, 
      faceLossCount: faceLosses,
      questions: finalHistory,
      overallScore: overallScore,
      scores: {
         technical: techScore,
         communication: Math.round(commScore),
         confidence: confScore
      },
      date: new Date().toISOString()
    };

    try {
      const activeEmail = localStorage.getItem("activeUser") || "default";
      const existingSessionsStr = localStorage.getItem(`interviewSessions_${activeEmail}`);
      const sessions = existingSessionsStr ? JSON.parse(existingSessionsStr) : [];
      sessions.push(newSession);
      localStorage.setItem(`interviewSessions_${activeEmail}`, JSON.stringify(sessions));
      
      // Keep legacy item temporarily to not immediately break old components
      localStorage.setItem(`lastInterviewData_${activeEmail}`, JSON.stringify(newSession));
    } catch (e) {
      console.error("Storage Error, possibly quota exceeded during base64 save", e);
    }
    
    // Longitudinal AI Intelligence
    try {
       const activeEmail = localStorage.getItem("activeUser") || "default";
       const existingInsightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
       const insights = existingInsightsStr ? JSON.parse(existingInsightsStr) : {
          weakAreas: [], fillerWordTrend: [], confidenceTrend: [], pastScores: []
       };
       
       let totalFillers = 0;
       let totalConf = 0;
       let overallStar = 0;

       finalHistory.forEach(h => {
          if (h.status === 'answered') {
             totalFillers += h.fillerWordsCount || 0;
             totalConf += h.confidenceScore || 0;
             overallStar += h.starUsage || 0;
          }
       });
       
       const avgConf = answered.length > 0 ? (totalConf / answered.length) : 0;
       const avgStar = answered.length > 0 ? (overallStar / answered.length) : 0;

       insights.pastScores.push(overallScore);
       insights.fillerWordTrend.push(totalFillers);
       insights.confidenceTrend.push(avgConf);

       let newWeaknesses = [];
       if (avgConf < 60) newWeaknesses.push("communication");
       if (avgStar < 40) newWeaknesses.push("answer structure");
       if (overallScore < 50) newWeaknesses.push("technical depth");

       insights.weakAreas = [...new Set([...insights.weakAreas, ...newWeaknesses])];
       localStorage.setItem(`userInsights_${activeEmail}`, JSON.stringify(insights));
    } catch(e) {
       console.error("Failed to update User Insights", e);
    }

    logActivity({ 
      type: "interview_complete", 
      title: "Interview Completed", 
      message: `Completed automated conversational interview for ${role}. Score: ${overallScore}%`, 
      status: "success" 
    });
  };

  if (phase === 'setup') {
    return (
      <InterviewSetup 
        role={role} setRole={setRole} 
        personality={personality} setPersonality={setPersonality}
        difficulty={difficulty} setDifficulty={setDifficulty}
        onStart={handleStartInterview} 
        streamRef={streamRef} 
        forceRender={triggerRender} 
      />
    );
  }

  if (phase === 'aborted') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6 text-center">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl">
           <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <XCircle className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Interview Aborted</h2>
           <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">{abortReason}</p>
           <button onClick={() => navigate('/dashboard')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition">
             Return to Dashboard
           </button>
         </motion.div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6 text-center">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl">
           <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Interview Completed</h2>
           <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Your conversational evaluation has concluded. Please proceed to the dashboard for your analytics.</p>
           <button onClick={() => navigate('/evaluation')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition">
             View Evaluation Report
           </button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h1 className="text-white font-semibold tracking-wide">Conversational Engine Live</h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-slate-400 text-sm font-medium">Memory Blocks: {conversationHistory.length}/5</span>
          <div className="px-3 py-1 rounded bg-slate-800 text-xs font-bold text-blue-400 uppercase tracking-wider border border-slate-700">
            {currentQuestion?.type || "Connecting"}
          </div>
        </div>
      </header>

      {/* Split Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch p-4 gap-4 overflow-hidden relative">
        
        {/* LEFT COLUMN: Question & Avatar */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center relative shadow-2xl overflow-hidden transition-all duration-700">
           
           <AIAvatar isSpeaking={conversationState === 'AI_SPEAKING'} state={conversationState} />
           
           {/* Visual Subtitles / Transcript */}
           <AnimatePresence mode="wait">
             <motion.div 
                key={currentQuestion?.question + conversationState}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="text-center w-full max-w-3xl px-6 relative"
             >
               {conversationState === 'AI_SPEAKING' && (
                 <>
                   <h3 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">
                     {currentQuestion?.isRetry ? 'Interviewer Clarifying' : 'Interviewer Asking'}
                   </h3>
                   <h2 className="text-3xl md:text-5xl text-white font-medium leading-tight">
                     "{currentQuestion?.isRetry ? currentQuestion.retryText : (currentQuestion?.question || '...')}"
                   </h2>
                   {currentQuestion?.isRetry && (
                     <p className="mt-8 text-slate-400 text-xl font-medium px-6 py-3 border border-slate-700/50 rounded-xl bg-slate-800/50">
                       Original Question: <span className="text-slate-300">"{currentQuestion.question}"</span>
                     </p>
                   )}
                 </>
               )}

               {conversationState === 'LISTENING' && (
                 <>
                   <h3 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4 animate-pulse">Listening...</h3>
                   <h2 className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed italic opacity-80 min-h-[100px]">
                     {transcriptDisplay || "Speak now..."}
                   </h2>
                 </>
               )}

               {conversationState === 'PROCESSING' && (
                 <div className="flex flex-col items-center justify-center min-h-[150px]">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-6" />
                    <h2 className="text-2xl text-slate-300 font-medium tracking-wide">Analyzing response and generating follow-up...</h2>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Camera & Stats */}
        <div className="lg:w-1/3 flex flex-col gap-4 relative">
          <div className="absolute top-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
             <AnimatePresence>
                {liveAlert && (
                   <motion.div 
                     initial={{ opacity: 0, y: -20, scale: 0.9 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3"
                   >
                      <AlertCircle className="w-5 h-5" />
                      {liveAlert}
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="relative h-full flex flex-col p-6 pointer-events-none z-10">
             <div className="flex justify-between items-start">
               <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl text-slate-300 font-medium tracking-wide border border-slate-700/50 shadow-lg pointer-events-auto">
                 Q{mainQuestionIndex}/10 • {currentQuestion?.type || "Role Assessment"}
               </div>
               
               <div className="flex flex-col gap-2 items-end pointer-events-auto">
                  {distractions > 0 && (
                    <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/30 font-medium shadow-lg">
                      Warnings: {distractions + faceLosses}/3
                    </div>
                  )}
                  {!faceDetected && (
                    <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl border border-orange-500/30 font-medium shadow-lg flex items-center gap-2">
                       <Eye className="w-4 h-4"/> Tracking Lost
                    </div>
                  )}
               </div>
             </div>
          </div>

           {/* Camera Feed */}
           <div className={`absolute inset-0 bg-slate-900 rounded-3xl border border-slate-800 p-2 overflow-hidden group shadow-xl transition-all duration-300 ${cameraLost ? 'border-red-500/50' : ''}`}>
             
             {cameraLost && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-900/90 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center border border-red-500 shadow-2xl">
                   <VideoOff className="w-12 h-12 text-red-400 mb-3" />
                   <h3 className="font-bold text-white text-lg">Camera Lost</h3>
                   <p className="text-red-200 text-sm mt-1">Please check your connection.</p>
                </div>
             )}

             {streamRef.current ? (
               <video 
                 ref={videoRef} 
                 autoPlay 
                 muted 
                 playsInline
                 className={`w-full h-full object-cover rounded-2xl transform -scale-x-100 transition duration-300 ${(!faceDetected || cameraLost) ? 'grayscale opacity-50' : ''}`}
               />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <VideoOff className="w-12 h-12 mb-2" />
                  <p>Camera off</p>
               </div>
             )}
             
             {/* Live Mic Activity Overlay */}
             <div className="absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-500">
               <div className={`flex-1 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 transition-all ${conversationState === 'LISTENING' ? 'border-green-500/30' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${conversationState === 'LISTENING' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                   <Mic className={`w-5 h-5 ${conversationState === 'LISTENING' ? 'animate-pulse scale-110' : ''}`} />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-center mb-1.5">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       {conversationState === 'LISTENING' ? 'Tracking Speech' : 'Mic Standby'}
                     </p>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                     <div 
                       ref={micLevelRef}
                       className={`h-full rounded-full transition-all duration-75 ${conversationState === 'LISTENING' ? 'bg-green-400' : 'bg-slate-600'}`}
                       style={{ width: '0%' }}
                     />
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default function InterviewScreen() {
  const [useLegacy, React_useState] = React.useState(false);

  if (useLegacy) {
    return (
      <ErrorBoundary>
        <InterviewScreenComponent />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <RoleMockInterview onExit={() => React_useState(true)} />
    </ErrorBoundary>
  );
}
