import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, Mic, AlertCircle, PlayCircle, CheckCircle, VideoOff, Activity, Loader2 } from 'lucide-react';
import { generateFollowUp } from '../utils/api';
import { coursesData } from '../data/coursesData';

const TOTAL_QUESTIONS = 10;

export default function RoleMockInterview({ onExit }) {
  const navigate = useNavigate();
  const selectedRole = localStorage.getItem("selectedInterviewRole");
  const selectedRound = localStorage.getItem("selectedInterviewRound");
  const selectedInterviewer = localStorage.getItem("selectedInterviewer");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  // CONVERSATION STATE MACHINE
  const [conversationState, setConversationState] = useState('SETUP'); // 'SETUP', 'AI_SPEAKING', 'LISTENING', 'PROCESSING', 'FINISHED'
  const [answerText, setAnswerText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  
  const [fillerWordsCount, setFillerWordsCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [repeatedWordsCount, setRepeatedWordsCount] = useState(0);
  const [weakPhrasesCount, setWeakPhrasesCount] = useState(0);
  const [isSpeakingLive, setIsSpeakingLive] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [validationWarning, setValidationWarning] = useState(null);
  
  // Phase 10: Strict Validation State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [allEvaluations, setAllEvaluations] = useState([]);

  // Automation Refs
  const transcriptRef = useRef("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const checkAudioRef = useRef(null);
  
  const lastSpeechTimeRef = useRef(Date.now());
  const answerStartTimeRef = useRef(Date.now());
  const silenceTimerRef = useRef(null);
  const bufferTimerRef = useRef(null);
  const maxTimeoutRef = useRef(null);

  // VIDEO RECORDING REFS
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const currentVideoUrlRef = useRef(null);
  const allVideoUrlsRef = useRef([]);

  useEffect(() => {
    if (!selectedRole) return;
    
    // PHASE 4: First question must ALWAYS be "Tell me about yourself."
    const initialQuestion = "Tell me about yourself.";
    setQuestions([initialQuestion]);
    
    // Auto start the interview
    const introMessage = `Hello. Let's begin your ${selectedRole} interview.`;
    speakText(`${introMessage} ${initialQuestion}`);

    return () => cleanupAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole]);

  // Phase 10: Strict Validation - Tab Switching
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden && !isFinished) {
            setTabSwitchCount(prev => {
               const newCount = prev + 1;
               if (newCount === 1 || newCount === 2) {
                  setValidationWarning("Warning: Please do not switch tabs during the interview.");
                  setTimeout(() => setValidationWarning(null), 5000);
               } else if (newCount === 3) {
                  setValidationWarning("FINAL WARNING: If you switch tabs again, the interview will be terminated.");
                  setTimeout(() => setValidationWarning(null), 5000);
               } else if (newCount >= 4) {
                  setValidationWarning("Interview Terminated due to policy violations (Tab Switching).");
                  finishInterview(answers); // Terminate
               }
               return newCount;
            });
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFinished, answers]);

  // Handle Conversation State Transitions
  useEffect(() => {
    if (conversationState === 'LISTENING') {
        startAutomatedListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationState]);

  const cleanupAll = () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearTimers();
      
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch(e){}
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (checkAudioRef.current) cancelAnimationFrame(checkAudioRef.current);

      // Memory Cleanup for Blob URLs
      allVideoUrlsRef.current.forEach(url => {
          URL.revokeObjectURL(url);
      });
      allVideoUrlsRef.current = [];
      currentVideoUrlRef.current = null;
  };

  const clearTimers = () => {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
  };

  const getInterviewerPersona = () => {
     switch(selectedInterviewer) {
        case 'emma': return { gender: 'female', mode: 'hr' };
        case 'payal': return { gender: 'female', mode: 'strict' };
        case 'john': return { gender: 'male', mode: 'technical' };
        case 'kapil': return { gender: 'male', mode: 'hr' };
        default: return { gender: 'female', mode: 'hr' };
     }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const persona = getInterviewerPersona();
      const voices = window.speechSynthesis.getVoices();
      
      // Match voice by gender heuristically
      const matchingVoices = voices.filter(v => v.name.toLowerCase().includes(persona.gender) || v.name.toLowerCase().includes(persona.gender === 'female' ? 'zira' : 'david'));
      if (matchingVoices.length > 0) {
         utterance.voice = matchingVoices[0];
      }

      // Apply mode configurations
      if (persona.mode === 'hr') {
         utterance.rate = 0.85;
         utterance.pitch = 1.0;
      } else if (persona.mode === 'technical') {
         utterance.rate = 1.1;
         utterance.pitch = 1.0;
      } else if (persona.mode === 'strict') {
         utterance.rate = 1.2;
         utterance.pitch = 0.9;
      }

      utterance.onstart = () => {
         setConversationState('AI_SPEAKING');
         setIsSpeakingLive(false);
      };
      utterance.onend = () => {
         setTimeout(() => setConversationState('LISTENING'), 500); 
      };
      utterance.onerror = () => {
         setTimeout(() => setConversationState('LISTENING'), 1000);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setConversationState('LISTENING'), 2000);
    }
  };

  const startLiveAnalysis = () => {
      // Phase 10: Lighting and Presence Check Proxy
      if (!canvasRef.current) {
          const canvas = document.createElement("canvas");
          canvasRef.current = canvas;
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      let emptyFramesCount = 0;

      if (stream && micActive && !analyserRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
           audioContextRef.current = new AudioContext();
        }
        const audioCtx = audioContextRef.current;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyserRef.current = analyser;
      }
      
      const checkVolume = () => {
        if (conversationState !== 'LISTENING' && conversationState !== 'AI_SPEAKING') {
            setIsSpeakingLive(false);
            if (checkAudioRef.current) requestAnimationFrame(checkVolume);
            return;
        }

        // AUDIO CHECK
        if (analyserRef.current) {
            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);
            const volume = data.reduce((a, b) => a + b, 0) / data.length;
            if (volume > 10 && conversationState === 'LISTENING') setIsSpeakingLive(true);
            else setIsSpeakingLive(false);
        }

        // Phase 10: VIDEO VALIDATION
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Brightness Check Proxy (sample every 40 pixels to save CPU)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let colorSum = 0;
            let sampleCount = 0;
            const pixels = imageData.data;
            for(let i = 0; i < pixels.length; i += 160) {
                colorSum += (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
                sampleCount++;
            }
            const brightness = colorSum / (sampleCount || 1);
            
            if (brightness < 20) {
               setValidationWarning("Warning: Room is too dark. Please improve lighting.");
               emptyFramesCount++;
            } else {
               // Only clear warning if we were the one who set it (to not overwrite tab warning)
               setValidationWarning(prev => (prev && prev.includes("lighting")) || (prev && prev.includes("obstructed")) ? null : prev);
               emptyFramesCount = 0;
            }

            // If dark/static for ~5 seconds (approx 300 frames at 60fps)
            if (emptyFramesCount > 300) { 
               setValidationWarning("Camera obstructed or face not detected.");
            }
        }

        checkAudioRef.current = requestAnimationFrame(checkVolume);
      };
      
      if (!checkAudioRef.current) {
          checkAudioRef.current = requestAnimationFrame(checkVolume);
      }
  };

  const startAutomatedListening = () => {
    transcriptRef.current = "";
    setAnswerText("");
    clearTimers();
    
    // 60-second fallback stop
    maxTimeoutRef.current = setTimeout(() => {
        stopAutomatedListening();
    }, 60000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPermissionError("Voice recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        const now = Date.now();
        lastSpeechTimeRef.current = now;
        answerStartTimeRef.current = now; // TRACK DURATION START

        // START VIDEO RECORDING
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            recordedChunksRef.current = [];
            currentVideoUrlRef.current = null;
            try {
               mediaRecorderRef.current.start();
            } catch(e) { console.error("Error starting media recorder:", e); }
        }

        startSilenceDetection();
        startLiveAnalysis(); // Visual UI tracking
      };

      recognition.onresult = (event) => {
        lastSpeechTimeRef.current = Date.now(); // Reset silence clock!
        
        let currentTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) currentTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        
        transcriptRef.current += currentTranscript;
        setAnswerText((transcriptRef.current + " " + interimTranscript).trim());
        
        if (currentTranscript) {
           analyzeMistakes(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setPermissionError("Microphone permission denied.");
          stopAutomatedListening();
        }
      };

      recognition.onend = () => {
        // Auto-restart if we are still meant to be LISTENING
        if (conversationState === 'LISTENING' && !isFinished) {
           try { recognition.start(); } catch(e){}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setPermissionError("Error starting recognition.");
    }
  };

  const startSilenceDetection = () => {
      clearTimers();
      
      // 500ms initial buffer before silence detection kicks in
      bufferTimerRef.current = setTimeout(() => {
         silenceTimerRef.current = setInterval(() => {
            if (conversationState !== 'LISTENING') {
               clearInterval(silenceTimerRef.current);
               return;
            }
            const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
            if (timeSinceLastSpeech > 3000) { // 3 SECOND SILENCE RULE
               stopAutomatedListening();
            }
         }, 500);
      }, 500);
  };

  const stopAutomatedListening = () => {
      clearTimers();
      setConversationState('PROCESSING');
      
      if (recognitionRef.current) {
         recognitionRef.current.onend = null;
         try { recognitionRef.current.stop(); } catch(e){}
      }

      // STOP VIDEO RECORDING
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
         try {
            mediaRecorderRef.current.stop();
         } catch(e) { console.error("Error stopping media recorder:", e); }
      }
      
      // Wait for MediaRecorder onstop to asynchronously generate the Blob URL before evaluating
      setTimeout(() => {
         processAndMoveForward();
      }, 500);
  };

  // Real-time analysis for UI counters only
  const analyzeMistakes = (transcriptSegment) => {
       const textLower = transcriptSegment.toLowerCase().replace(/[.,!?]/g, "");
       const words = textLower.match(/\b\w+\b/g) || [];
       let fillersFound = 0;
       const FILLER_LIST = ['um', 'uh', 'like', 'basically'];
       words.forEach(w => {
          if (FILLER_LIST.includes(w)) fillersFound++;
       });
       const youKnowMatch = textLower.match(/\byou know\b/g);
       if (youKnowMatch) fillersFound += youKnowMatch.length;

       if (fillersFound > 0) setFillerWordsCount(prev => prev + fillersFound);

       const repeatedMatches = textLower.match(/\b(\w+)\s+\1\b/g);
       if (repeatedMatches) setRepeatedWordsCount(prev => prev + repeatedMatches.length);

       const weakPhrases = ["i don't know", "not sure", "no idea", "can't explain"];
       let weakCount = 0;
       weakPhrases.forEach(phrase => { if (textLower.includes(phrase)) weakCount++; });
       if (weakCount > 0) setWeakPhrasesCount(prev => prev + weakCount);
  };

  // DATA-DRIVEN EVALUATION SYSTEM & CRITICAL FIX
  const evaluateAnswer = (finalAns, durationSec) => {
    const textLower = finalAns.toLowerCase().replace(/[.,!?]/g, "");
    const words = textLower.match(/\b\w+\b/g) || [];
    const totalWords = words.length;

    // CRITICAL FIX: Heavy penalty if user doesn't speak or answer is less than 5 seconds
    if (totalWords === 0 || durationSec < 5 || finalAns.length < 5) {
      console.log(`[EVAL] CRITICAL FIX TRIGGERED: No valid response. Words: ${totalWords}, Duration: ${durationSec}s`);
      return {
        score: 0,
        feedback: "No answer provided.",
        fillerCount: 0,
        starCoverage: "0/4",
        duration: "0 seconds"
      };
    }

    // 2. Strict Filler Word Detection
    const FILLER_LIST = ['um', 'uh', 'like', 'basically'];
    let fillerCount = 0;
    words.forEach(w => {
      if (FILLER_LIST.includes(w)) fillerCount++;
    });
    const youKnowMatch = textLower.match(/\byou know\b/g);
    if (youKnowMatch) fillerCount += youKnowMatch.length;

    const fillerDensity = fillerCount / totalWords;
    
    // Fluency Score logic (out of 30) - 30% weighting
    let fluencyScore = 30;
    if (fillerDensity > 0.1) fluencyScore -= 15;
    else if (fillerDensity > 0.05) fluencyScore -= 8;
    else if (fillerCount > 0) fluencyScore -= Math.min(5, fillerCount * 1);
    fluencyScore = Math.max(0, fluencyScore);

    // 3. STAR Method Detection (STRUCTURE) - 40% weighting
    const STAR_KEYWORDS = ['situation', 'task', 'action', 'result'];
    let starMatches = 0;
    STAR_KEYWORDS.forEach(kw => {
      if (textLower.includes(kw)) starMatches++;
    });
    
    let contentScore = 15; // base score for answering
    contentScore += (starMatches * 6.25); // up to 25 more points (max 40)
    // Heuristic: If they speak at length with logic but didn't use explicit keywords, reward some points
    if (totalWords > 40 && starMatches === 0) contentScore += 10; 
    contentScore = Math.min(40, contentScore);

    // 4. Duration-Based Scoring - 30% weighting
    let confidenceScore = 30;
    if (durationSec < 10) confidenceScore -= 20; // strong penalty
    else if (durationSec < 20) confidenceScore -= 10; // moderate penalty
    else if (durationSec >= 20 && durationSec <= 60) confidenceScore = 30; // optimal
    else if (durationSec > 90) confidenceScore -= 5; // slight penalty for rambling
    
    // Combine to Final Score
    let finalScore = Math.min(100, Math.max(0, Math.round(fluencyScore + contentScore + confidenceScore)));
    
    // Generate Robust Feedback
    let feedbackParts = [];
    if (starMatches >= 3) feedbackParts.push("Excellent structured answer (STAR method detected).");
    else if (starMatches > 0) feedbackParts.push("Good attempt at structure, try to fully use the STAR method.");
    else feedbackParts.push("Consider using the STAR (Situation, Task, Action, Result) method to structure your answer.");

    if (fillerDensity > 0.05) feedbackParts.push("Try to reduce filler words to sound more confident.");
    else if (fillerCount === 0) feedbackParts.push("Great fluency with no filler words.");

    if (durationSec < 10) feedbackParts.push("Your answer was very short, try to elaborate more.");
    else if (durationSec > 90) feedbackParts.push("Your answer was a bit too long, try to be more concise.");

    const evaluationResult = {
      score: finalScore,
      feedback: feedbackParts.join(" "),
      fillerCount: fillerCount,
      starCoverage: `${starMatches}/4`,
      duration: `${durationSec} seconds`
    };

    console.log(`[EVAL] Answer: "${finalAns}"`);
    console.log(`[EVAL] Metrics:`, evaluationResult);
    
    return evaluationResult;
  };

  const processAndMoveForward = async () => {
      const finalAns = transcriptRef.current.trim();
      
      // Calculate safe duration
      const durationMs = Date.now() - (answerStartTimeRef.current || Date.now());
      const durationSec = Math.max(0, Math.round(durationMs / 1000));

      const evaluation = evaluateAnswer(finalAns, durationSec);
      
      // Even if score is 0, we treat it as an answered question for tracking, 
      // but the UI and feedback will clearly state "No answer provided".
      const status = evaluation.score === 0 ? "Skipped" : "Answered";

      setAllEvaluations(prev => [...prev, evaluation]);

      // Grab generated video blob url
      const recordedVideoUrl = currentVideoUrlRef.current;

      const newAnswers = [...answers, { 
        question: questions[currentQuestionIndex], 
        answer: status === "Skipped" ? "[No Answer Provided]" : finalAns,
        evaluation: evaluation,
        status: status,
        videoUrl: recordedVideoUrl
      }];
      setAnswers(newAnswers);

      if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
         let nextQ = "";
         try {
            // PHASE 5: RESUME INTELLIGENCE
            const userProfileStr = localStorage.getItem("userProfile");
            const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
            const skills = userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.join(", ") : "None specified";
            const projects = userProfile.projects && userProfile.projects.length > 0 ? userProfile.projects.join(", ") : "None specified";
            
            // PHASE 4: DYNAMIC QUESTION ENGINE
            const depthLevel = currentQuestionIndex < 2 ? "Behavioral" : currentQuestionIndex < 4 ? "Technical" : "Situational/Advanced";

            // PHASE 11: Inject Longitudinal Insights
            const activeEmail = localStorage.getItem("activeUser") || "default";
            const insightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
            const userInsights = insightsStr ? JSON.parse(insightsStr) : { weakAreas: [] };
            const weakAreasPrompt = userInsights.weakAreas.length > 0 
                ? `\nCandidate's Known Weak Areas: ${userInsights.weakAreas.join(", ")}`
                : "";

            const previousQuestionsText = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
            
            const prompt = `
Role: ${selectedRole}
Candidate's Resume Skills: ${skills}
Candidate's Projects: ${projects}${weakAreasPrompt}

PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT THESE):
${previousQuestionsText}

Question Just Asked: "${questions[currentQuestionIndex]}"
Candidate's Answer: "${finalAns}"

Generate the NEXT interview question for this candidate. 
Requirements:
1. CRITICAL: You MUST NOT ask any question that is similar to the PREVIOUSLY ASKED QUESTIONS.
2. Question type should be: ${depthLevel}.
3. The interview structure dictates 2-3 deep follow-up questions per topic. If the candidate's answer was good, ask a highly specific, logical follow-up to test their depth on what they just said.
4. If their answer was empty, weak, or off-topic, ask a brand new question related to their resume skills or the role. Do NOT repeat the previous question.
5. You MUST explicitly reference one of their "Resume Skills" or "Projects" in the next question if starting a new topic (e.g. "I see you used React on Project X, can you explain...").
6. If Known Weak Areas are provided, actively formulate the question to test those specific weak areas.

Return ONLY the question text, nothing else.`;

            console.log("[AI Prompt Debug] Generating follow-up with prompt:", prompt);
            const resp = await generateFollowUp(prompt);
            console.log("[AI Prompt Debug] Response received:", resp);
            
            if (resp && typeof resp.question === 'string' && resp.question.trim().length > 0) {
               nextQ = resp.question;
            } else {
               throw new Error("Malformed or empty AI response");
            }
         } catch(e) {
            console.error("[AI Prompt Debug] API error or malformed response. Using fallback.", e);
            // Dynamic Fallbacks just in case
            if (currentQuestionIndex === 1) nextQ = `What is your strongest technical skill and how did you use it?`;
            else if (currentQuestionIndex === 2) nextQ = `Can you tell me about a challenging project you worked on?`;
            else nextQ = `Where do you see yourself in this ${selectedRole} role in the next few years?`;
         }
         
         const updatedQuestions = [...questions, nextQ];
         setQuestions(updatedQuestions);

         setCurrentQuestionIndex(prev => prev + 1);
         setAnswerText("");
         setFillerWordsCount(0);
         setPauseCount(0);
         setRepeatedWordsCount(0);
         setWeakPhrasesCount(0);
         
         speakText(nextQ);
      } else {
         finishInterview(newAnswers);
      }
  };

  const getRecommendedCourses = () => {
     let recommendations = [];
     const totalFillers = allEvaluations.reduce((sum, ev) => sum + ev.fillerCount, 0);
     const avgScore = allEvaluations.length ? Math.round(allEvaluations.reduce((sum, ev) => sum + ev.score, 0) / allEvaluations.length) : 0;
     const avgDuration = allEvaluations.length ? Math.round(allEvaluations.reduce((sum, ev) => sum + (parseInt(ev.duration) || 0), 0) / allEvaluations.length) : 0;
     const lowStarUsage = allEvaluations.filter(ev => parseInt((ev.starCoverage || "0").split('/')[0]) < 2).length > (allEvaluations.length / 2);

     console.log("[Recommendation Debug] Stats:", { totalFillers, avgScore, avgDuration, lowStarUsage });

     // 1. Weakness: Communication / Fillers
     if (totalFillers > 10 || avgDuration < 15) {
         const commCourses = coursesData.filter(c => c.category === "Soft Skills" && (c.title.includes("Communication") || c.title.includes("Speaking")));
         if (commCourses.length > 0) {
             recommendations.push({ ...commCourses[0], reason: "Reduce filler words and improve speaking duration." });
         }
     }

     // 2. Weakness: Structure (STAR method)
     if (lowStarUsage) {
         const interviewCourses = coursesData.filter(c => c.category === "Soft Skills" && c.title.includes("Interview"));
         if (interviewCourses.length > 0) {
             recommendations.push({ ...interviewCourses[0], reason: "Learn the STAR method for better answer structure." });
         }
     }

     // 3. Technical / Role Specific
     const roleWords = (selectedRole || "").toLowerCase().split(' ');
     const techCourses = coursesData.filter(c => roleWords.some(rw => rw.length > 3 && (c.title.toLowerCase().includes(rw) || c.category.toLowerCase().includes(rw))));
     
     if (techCourses.length > 0) {
         const targetLevel = avgScore > 75 ? "Advanced" : avgScore > 50 ? "Intermediate" : "Beginner";
         const matchedLevel = techCourses.find(c => c.level === targetLevel) || techCourses[0];
         if (!recommendations.some(r => r.id === matchedLevel.id)) {
            recommendations.push({ ...matchedLevel, reason: `Improve your ${targetLevel} technical knowledge.` });
         }
     }

     // 4. Fallback: Fill remaining spots up to 3-5 courses with Trending/Advanced
     if (recommendations.length < 3) {
         const trending = coursesData.filter(c => !recommendations.some(r => r.id === c.id)).slice(0, 4 - recommendations.length);
         trending.forEach(c => recommendations.push({ ...c, reason: "Highly recommended trending course." }));
     }

     console.log("[Recommendation Debug] Generated Recommendations:", recommendations.slice(0, 4));
     return recommendations.slice(0, 4);
  };

  const finishInterview = (finalAnswers) => {
      const avgScore = allEvaluations.length ? Math.round(allEvaluations.reduce((sum, ev) => sum + ev.score, 0) / allEvaluations.length) : 0;
      const totalMistakes = allEvaluations.reduce((sum, ev) => sum + ev.fillerCount, 0);

      // Map questions explicitly for the advanced feedback report
      const mappedQuestions = finalAnswers.map((ans, idx) => {
         const score = ans.evaluation?.score || 0;
         let suggestion = "Practice answering this question again.";
         if (score > 80) suggestion = "Excellent answer, keep it up!";
         else if (score > 50) suggestion = "Good structure, but try to be more concise and confident.";
         else suggestion = "Consider using the STAR method and provide more specific examples.";

         return {
            question: ans.question,
            answerTranscript: ans.answer,
            status: ans.status === "Skipped" ? "skipped" : "answered",
            answerQualityScore: score,
            fillerWordsCount: ans.evaluation?.fillerCount || 0,
            starUsage: parseInt((ans.evaluation?.starCoverage || "0").split('/')[0]) || 0,
            suggestion: suggestion
         };
      });

      // Calculate category scores based on heuristics from overall evaluation
      const totalStarUsage = mappedQuestions.reduce((sum, q) => sum + q.starUsage, 0);
      const avgDurationSec = allEvaluations.length ? Math.round(allEvaluations.reduce((sum, ev) => sum + (parseInt(ev.duration) || 0), 0) / allEvaluations.length) : 0;
      
      let technicalScore = avgScore;
      let communicationScore = Math.max(0, 100 - (totalMistakes * 5));
      let confidenceScore = Math.min(100, Math.max(0, 40 + (avgDurationSec) + (totalStarUsage * 5)));

      const finalReport = {
         role: selectedRole,
         difficulty: "Standard",
         date: new Date().toISOString(),
         overallScore: avgScore,
         distractionCount: tabSwitchCount,
         faceLossCount: 0,
         scores: {
            technical: technicalScore,
            communication: communicationScore,
            confidence: confidenceScore
         },
         questions: mappedQuestions,
         fillerWords: totalMistakes,
         avgScore: avgScore,
         feedback: "Interview completed. Review your metrics below.",
         timestamp: new Date().toISOString()
      };
      
      // PHASE 7: Persistent storage across sessions
      const activeEmail = localStorage.getItem("activeUser") || "default";
      const sessionsStr = localStorage.getItem(`interviewSessions_${activeEmail}`);
      const sessions = sessionsStr ? JSON.parse(sessionsStr) : [];
      sessions.push(finalReport);
      localStorage.setItem(`interviewSessions_${activeEmail}`, JSON.stringify(sessions));

      localStorage.setItem(`mockInterviewResults_${activeEmail}`, JSON.stringify(finalReport));
      localStorage.setItem(`mockInterviewAnswers_${activeEmail}`, JSON.stringify(finalAnswers));
      localStorage.setItem(`lastInterviewData_${activeEmail}`, JSON.stringify(finalReport)); // FOR ADVANCED FEEDBACK
      
      // PHASE 11: Longitudinal Intelligence - Insights Update
      const insightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
      const userInsights = insightsStr ? JSON.parse(insightsStr) : { weakAreas: [], fillerTrend: [], pastScores: [] };
      
      userInsights.pastScores.push({ date: new Date().toLocaleDateString(), score: avgScore });
      userInsights.fillerTrend.push({ date: new Date().toLocaleDateString(), count: totalMistakes });
      
      const suggestedCourses = getRecommendedCourses();
      suggestedCourses.forEach(course => {
         if (course.category && !userInsights.weakAreas.includes(course.category)) {
             userInsights.weakAreas.push(course.category);
         }
      });
      if (avgScore < 50 && !userInsights.weakAreas.includes("Behavioral")) {
         userInsights.weakAreas.push("Behavioral");
      }
      
      localStorage.setItem(`userInsights_${activeEmail}`, JSON.stringify(userInsights));

      setIsFinished(true);
      setConversationState('FINISHED');
      stopCamera();
  };

  // --- UI Handlers for Camera/Mic setup ---
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Play error:", e));
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setCameraActive(true);
      setMicActive(true);
      setPermissionError("");

      // INITIALIZE MEDIA RECORDER
      try {
         let options = { mimeType: 'video/webm' };
         if (!MediaRecorder.isTypeSupported('video/webm')) {
            options = {}; 
         }
         
         const mediaRecorder = new MediaRecorder(mediaStream, options);
         mediaRecorder.ondataavailable = (event) => {
           if (event.data && event.data.size > 0) {
             recordedChunksRef.current.push(event.data);
           }
         };
         mediaRecorder.onstop = () => {
           const blob = new Blob(recordedChunksRef.current, { type: options.mimeType || 'video/mp4' });
           const videoUrl = URL.createObjectURL(blob);
           currentVideoUrlRef.current = videoUrl;
           allVideoUrlsRef.current.push(videoUrl);
         };
         mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
         console.error("Failed to initialize MediaRecorder:", err);
      }

    } catch (err) {
      console.error("Camera error:", err);
      setPermissionError("Please allow camera permission from browser settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      setMicActive(false);
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setMicActive(enabled);
      }
    }
  };



  // --- RENDER ---
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No interview setup found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Please select a role first.</p>
          <button onClick={() => navigate('/role-interviews')} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-105 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md mb-4">
            Go to Role Interviews
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const suggestedCourses = getRecommendedCourses();
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Interview completed successfully</h2>
          
          <div className="mb-6 space-y-2 text-lg text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
            <p><span className="font-bold text-gray-900 dark:text-white">Role:</span> {selectedRole}</p>
            <p><span className="font-bold text-gray-900 dark:text-white">Total questions:</span> {questions.length}</p>
            <p><span className="font-bold text-gray-900 dark:text-white">Average Score:</span> <span className="text-primary font-black">{allEvaluations.length ? Math.round(allEvaluations.reduce((sum, ev) => sum + ev.score, 0) / allEvaluations.length) : 0}/100</span></p>
          </div>
          
          {/* MULTIPLE COURSE RECOMMENDATIONS */}
          <div className="mb-8 text-left">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" /> Recommended for your career path
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedCourses.map(course => (
                   <div key={`rec-${course.id}`} className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50 flex flex-col shadow-sm group">
                      <h4 className="text-lg font-extrabold text-gray-900 dark:text-white line-clamp-2 mb-1">{course.title}</h4>
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-4">{course.category}</p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4 flex-1">Based on performance: <span className="italic">"{course.reason}"</span></p>
                      <button 
                         onClick={() => navigate(`/courses/${course.id}`)}
                         className="w-full py-2.5 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 font-bold rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all"
                      >
                         Start Learning
                      </button>
                   </div>
                ))}
             </div>
          </div>
           
          <div className="space-y-6 mb-8 text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Answers</h3>
            {answers.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                 <p className="font-bold text-gray-900 dark:text-white mb-3">Q{idx+1}: {item.question}</p>
                 
                 {/* Recorded Video Playback */}
                 {item.videoUrl && (
                    <div className="mb-5 bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                       <p className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-3 w-full text-left">Recorded Answer</p>
                       <video 
                         src={item.videoUrl} 
                         controls 
                         className="w-full max-w-lg rounded-lg border border-gray-300 dark:border-gray-600 shadow-md bg-black aspect-video object-cover"
                       ></video>
                    </div>
                 )}

                 <p className={`text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-4 ${item.status === 'Skipped' ? 'italic text-red-500 dark:text-red-400 font-medium' : ''}`}>{item.answer}</p>
                 
                 {item.evaluation && (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Score</p>
                       <p className={`text-2xl font-black ${item.evaluation.score > 75 ? 'text-green-500' : item.evaluation.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>{item.evaluation.score}/100</p>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">STAR Match</p>
                       <p className="text-2xl font-black text-primary">{item.evaluation.starCoverage}</p>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Duration</p>
                       <p className="text-2xl font-black text-gray-700 dark:text-gray-200">{item.evaluation.duration}</p>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Fillers</p>
                       <p className="text-2xl font-black text-gray-700 dark:text-gray-200">{item.evaluation.fillerCount}</p>
                     </div>
                     
                     <div className="col-span-full mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 rounded-xl text-sm border border-blue-100 dark:border-blue-800/50">
                       <strong className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider mb-2 opacity-80 text-blue-800 dark:text-blue-400">
                          <Activity className="w-4 h-4" /> Detailed Feedback
                       </strong>
                       <p className="leading-relaxed font-medium">{item.evaluation.feedback}</p>
                     </div>
                   </div>
                 )}
              </div>
            ))}
          </div>
           
          <button onClick={() => navigate('/dashboard')} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-105 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex flex-col items-center">
      <div className="max-w-6xl w-full mt-10">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Interview for: <span className="text-primary">{selectedRole}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize font-medium flex items-center gap-2">
              Round: {selectedRound?.replace('_', ' ')} &nbsp;|&nbsp; 
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                 <Bot className="w-3.5 h-3.5" /> Adaptive Engine Active
              </span>
            </p>
          </div>
          <button onClick={() => {
            cleanupAll();
            localStorage.removeItem("selectedInterviewRole");
            navigate('/role-interviews');
          }} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Exit
          </button>
        </div>

        {permissionError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{permissionError}</p>
          </div>
        )}

        {validationWarning && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl flex items-center gap-3 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold animate-pulse">{validationWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Camera & Live Analysis */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Camera Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="relative w-full aspect-video rounded-[16px] overflow-hidden mb-6 shadow-inner" style={{ minHeight: '320px', background: '#000' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transform -scale-x-100 absolute inset-0 ${cameraActive ? 'block' : 'hidden'}`} 
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                    <p className="font-medium">Camera preview not available</p>
                  </div>
                )}
                {cameraActive && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                     <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Camera is live</span>
                  </div>
                )}
                
                {/* Status Indicators */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-md ${cameraActive ? 'bg-green-500/80 text-white shadow-lg' : 'bg-red-500/80 text-white shadow-lg'}`}>
                    Camera: {cameraActive ? 'On' : 'Off'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-md ${micActive ? 'bg-green-500/80 text-white shadow-lg' : 'bg-red-500/80 text-white shadow-lg'}`}>
                    Mic: {micActive ? 'On' : 'Off'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {!cameraActive ? (
                  <button onClick={startCamera} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                    Start Camera
                  </button>
                ) : (
                  <button onClick={stopCamera} className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                    Stop Camera
                  </button>
                )}
                <button onClick={toggleMic} disabled={!cameraActive} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                  {micActive ? 'Mute Mic' : 'Unmute Mic'}
                </button>
              </div>
            </div>

            {/* Live Analysis Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-text mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Live Detection
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Fillers</p>
                  <p className="text-2xl font-black text-primary">{fillerWordsCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Repeats</p>
                  <p className="text-2xl font-black text-yellow-500">{repeatedWordsCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Weak</p>
                  <p className="text-2xl font-black text-red-500">{weakPhrasesCount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Speaking Status</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md transition-colors ${isSpeakingLive ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {isSpeakingLive ? 'Speaking' : 'Silent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Question & User Answer */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col relative h-full">
              
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${conversationState === 'AI_SPEAKING' ? 'bg-primary text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-text flex-1">
                   {conversationState === 'AI_SPEAKING' ? 'Interviewer is speaking...' : 'Interviewer Question'}
                </h3>
              </div>

              <div className={`mb-8 p-6 rounded-xl border transition-all duration-300 ${conversationState === 'AI_SPEAKING' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800'}`}>
                <p className="text-gray-800 dark:text-gray-200 font-medium text-lg leading-relaxed">
                  "{currentQuestion}"
                </p>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Your Answer
              </h3>
              
              {conversationState === 'LISTENING' && (
                <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800/50 shadow-inner">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider">Listening & Recording...</span>
                  <span className="ml-auto text-xs font-medium text-green-600/70 dark:text-green-400/70">Auto-detecting speech & silence</span>
                </div>
              )}
              
              {conversationState === 'PROCESSING' && (
                <div className="flex items-center gap-3 mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-inner">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bold uppercase tracking-wider">Processing Response</span>
                  <span className="ml-auto text-xs font-medium opacity-70">Generating dynamic question...</span>
                </div>
              )}

              {conversationState === 'AI_SPEAKING' && (
                <div className="mb-4 p-3.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-100 dark:border-gray-800 text-sm font-medium flex items-center justify-center">
                  Waiting for AI to finish speaking...
                </div>
              )}

              <textarea 
                value={answerText}
                readOnly
                placeholder={conversationState === 'LISTENING' ? "Speak now..." : "Your answer will appear here..."}
                className="flex-1 w-full p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:outline-none resize-none text-gray-900 dark:text-white mb-6 min-h-[180px] opacity-90 cursor-default"
              ></textarea>
              
              <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full">
                  Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
                </span>
                
                {/* Visual state indicator instead of buttons */}
                <div className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700 text-gray-500 bg-gray-50 dark:bg-gray-900/50">
                  {conversationState === 'SETUP' && "Initializing..."}
                  {conversationState === 'AI_SPEAKING' && "Interviewer Speaking"}
                  {conversationState === 'LISTENING' && "Your Turn"}
                  {conversationState === 'PROCESSING' && "Analyzing & Adapting"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
