import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { logActivity, logNotification } from '../utils/activityLogger';
import { sendEmailNotification } from '../utils/emailApi';
import { API_URL } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Mic, VideoOff, AlertCircle, ArrowRight, CheckCircle2, PlayCircle, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useContext(UserContext);
  
  const role = location.state?.role || 'Software Engineer';
  const resume = JSON.parse(localStorage.getItem("userProfile") || "{}");

  const [interviewState, setInterviewState] = useState('intro'); // intro, active, summary
  
  // Storage for hardware state
  const streamRef = useRef(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [streamError, setStreamError] = useState(false);
  
  // Real-time metrics
  const [status, setStatus] = useState("Initializing...");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [faceDetected, setFaceDetected] = useState(true);
  
  const [tabWarnings, setTabWarnings] = useState(0);
  const [faceLossCount, setFaceLossCount] = useState(0);
  
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  
  // Dynamic AI State
  const [currentDifficulty, setCurrentDifficulty] = useState("medium");
  const [skillFocus, setSkillFocus] = useState("General");
  const askedQuestionsRef = useRef([]);
  const previousQuestionRef = useRef("");
  
  // Track continuous metrics
  const evaluationDataRef = useRef({
    speaking: false,
    facePresent: true,
    tabSwitches: 0,
    totalAnswers: 0,
    technicalScoreTotal: 0,
    communicationScoreTotal: 0,
    fillerWords: 0,
    strengths: [],
    weaknesses: [],
    questionsData: []
  });

  const isDemo = localStorage.getItem('isDemo') === 'true';

  const speak = (text, onEndCallback) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    // Attempt to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural")));
    if (preferredVoice) utterance.voice = preferredVoice;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const generateNextQuestion = async (isFollowUp = false) => {
    try {
      const payload = {
        role: role,
        resume_skills: resume?.technicalSkills || [],
        asked_questions: askedQuestionsRef.current,
        current_difficulty: currentDifficulty,
        is_follow_up: isFollowUp,
        previous_question: previousQuestionRef.current
      };

      const response = await fetch(`${API_URL}/ai/interview/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setCurrentDifficulty(data.difficulty || "medium");
      setSkillFocus(data.skill || "General");
      askedQuestionsRef.current.push(data.question);
      previousQuestionRef.current = data.question;
      return data.question;
    } catch (err) {
      console.error("AI Generation failed", err);
      return "Could you tell me more about your recent problem-solving experience?";
    }
  };

  const analyzeAnswer = async (transcript, question) => {
    try {
      const response = await fetch(`${API_URL}/ai/interview/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, question })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Analysis failed", err);
      return null;
    }
  };

      return "Could you tell me more about your recent problem-solving experience?";
    }
  };

  const endInterview = async (terminated = false, additionalNote = "") => {
    setInterviewState('summary');
    
    const data = evaluationDataRef.current;
    
    // Calculate final scores based on history
    let finalTechScore = 50;
    let finalCommScore = 50;
    
    if (data.totalAnswers > 0) {
       finalTechScore = Math.floor(data.technicalScoreTotal / data.totalAnswers);
       finalCommScore = Math.floor(data.communicationScoreTotal / data.totalAnswers);
    }
    
    // Penalties
    if (!data.facePresent) finalCommScore = Math.max(0, finalCommScore - 20);
    if (data.tabSwitches > 0) finalCommScore = Math.max(0, finalCommScore - (data.tabSwitches * 10));
    
    let overallScore = Math.floor((finalTechScore * 0.6) + (finalCommScore * 0.4));
    
    if (terminated) {
       overallScore = 0;
    }

    setFinalScore(overallScore);

    logActivity({
      type: "interview_complete",
      title: terminated ? "Interview Terminated" : "Interview Completed",
      score: score,
      timestamp: Date.now()
    });

    logNotification({
      title: terminated ? "Interview Terminated" : "Interview Evaluated",
      message: terminated ? `Session closed due to policy violation: ${additionalNote}` : `Final Score: ${score}/100`
    });

    // We do NOT stop tracks here, we stop them only on component unmount
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e){}
    }

    if (!terminated) {
      
      const finalReportPayload = {
         overallScore: overallScore,
         technicalScore: finalTechScore,
         communicationScore: finalCommScore,
         confidenceScore: Math.floor((finalTechScore + finalCommScore)/2),
         fillerWords: data.fillerWords,
         answerQuality: overallScore > 60 ? "Good" : "Needs Improvement",
         starMethod: false, // will update later
         suggestions: ["Review fundamental concepts.", "Practice concise answers."],
         strengths: [...new Set(data.strengths)].slice(0, 3),
         weaknesses: [...new Set(data.weaknesses)].slice(0, 3),
         questions: data.questionsData
      };
      
      // Store complete report to be read by InterviewFeedback component
      localStorage.setItem('lastInterviewReport', JSON.stringify(finalReportPayload));

      // Send Email Notification
      const emailSent = await sendEmailNotification(
        "interview",
        "Mock Interview Results - PREPRIA Career Intelligence",
        {
          role: role,
          overallScore: overallScore,
          technicalScore: finalTechScore,
          communicationScore: finalCommScore,
          summary: "You completed a mock interview session. Review your full report on the dashboard.",
          weakAreas: finalReportPayload.weaknesses.join(", ") || "None detected",
          recommendedCourses: "Advanced Interview Prep"
        }
      );

      if (!emailSent) {
         console.warn("Interview completed, but email notification failed to send.");
      }
    }
  };

  // ----- TAB SWITCH LOGIC -----
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewState === 'active') {
        setTabWarnings((prev) => {
          const newCount = prev + 1;
          evaluationDataRef.current.tabSwitches += 1;

          if (newCount <= 3) {
            alert(`Warning ${newCount}/3: Please stay on this tab.`);
          } else {
            alert("Interview terminated due to tab switching.");
            endInterview(true, "Excessive tab switching.");
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewState]);

  // ----- HARDWARE INIT & FACE / AUDIO DETECTION -----
  // 1. Create the camera stream ONLY once using useEffect with empty dependency [].
  useEffect(() => {
    let hardwareReadyReq;
    
    const setupHardware = async () => {
      if (streamRef.current) return;
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = streamData; // 2. Store the stream in a useRef
        setIsStreamReady(true);
        setStreamError(false);

        // 7. Ensure AudioContext and AnalyserNode are initialized only once
        if (!audioContextRef.current) {
           const AudioContext = window.AudioContext || window.webkitAudioContext;
           const ctx = new AudioContext();
           audioContextRef.current = ctx;
           const analyser = ctx.createAnalyser();
           analyserRef.current = analyser;
           const source = ctx.createMediaStreamSource(streamData);
           source.connect(analyser);
        }

        // 8. Use requestAnimationFrame for state checks instead of intervals
        const checkReadiness = () => {
          if (videoRef.current && streamRef.current && streamRef.current.active) {
            // 9. Readiness check: video.readyState >= 2 AND video.videoWidth > 0 -> camera is valid
            if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
               const detected = true; // Hard check passed
               setFaceDetected(detected);
               if (!detected) evaluationDataRef.current.facePresent = false;
               
               if (!detected && document.visibilityState !== 'hidden') {
                   setFaceLossCount(prev => {
                       const next = prev + 1;
                       if (next >= 3) {
                           alert("Interview terminated: You left the camera.");
                           endInterview(true, "Face not detected.");
                       }
                       return next;
                   });
               }
            } else {
               setFaceDetected(false); // Validating / frozen state
            }
          }
          hardwareReadyReq = requestAnimationFrame(checkReadiness);
        };
        hardwareReadyReq = requestAnimationFrame(checkReadiness);

      } catch (err) {
        console.error("Hardware init error", err);
        setStreamError(true);
        setIsStreamReady(false);
      }
    };

    setupHardware();

    // 6. Do NOT stop tracks during normal renders. Only stop them in cleanup when component unmounts.
    return () => {
      if (hardwareReadyReq) cancelAnimationFrame(hardwareReadyReq);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(()=>{});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync stream to video element safely cross-renders
  useEffect(() => {
    const attachVideo = async () => {
      if (videoRef.current && streamRef.current) {
        // 3. Attach stream to video element only if srcObject is different
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        // 4. Always call await video.play() after attaching stream
        try {
          await videoRef.current.play();
        } catch(e) {
          console.error("Video play error:", e);
        }
      }
    };
    attachVideo();
  }, [isStreamReady, interviewState]);

  // ----- MAIN INTERVIEW LOOP -----
  const startInterviewLoop = async () => {
    if (isDemo) return navigate('/login');
    setInterviewState('active');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    }

    let turn = 1;

    const askAndListen = async (answerContext, isFollowUp = false) => {
        if (interviewState === 'summary') return;
        
        setStatus("AI Thinking...");
        const aiQuestion = await generateNextQuestion(isFollowUp);
        
        setCurrentQuestionNumber(turn);
        setStatus("Interviewer speaking...");
        
        // Ensure UI repaints
        await new Promise(r => setTimeout(r, 100));

        speak(aiQuestion, () => {
            // Once speech ends, listen to user
            setStatus("Listening...");
            let fullTranscript = "";
            let localIsSpeaking = false;
            
            if (recognition) {
               try { recognition.start(); } catch(e){}
               recognition.onresult = (event) => {
                   let interim = "";
                   for (let i = event.resultIndex; i < event.results.length; i++) {
                       if (event.results[i].isFinal) fullTranscript += event.results[i][0].transcript + " ";
                       else interim += event.results[i][0].transcript;
                   }
                   if (interim.length > 0 || fullTranscript.length > 0) {
                      evaluationDataRef.current.speaking = true;
                   }
               };
            }

            // Audio Level Monitoring for Silence Detection
            let trackVolumeReq;
            const trackVolume = () => {
                if (status !== "Listening..." && !recognitionRef.current) return;
                
                if(analyserRef.current) {
                  const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                  analyserRef.current.getByteFrequencyData(data);
                  const volume = data.reduce((a, b) => a + b, 0) / data.length;
                  
                  setVolumeLevel(volume);

                  if (volume > 10) {
                     localIsSpeaking = true;
                     setIsSpeaking(true);
                     evaluationDataRef.current.speaking = true;
                     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                     // Reset silence timeout
                     silenceTimerRef.current = setTimeout(finishTurn, 2500); 
                  } else if (localIsSpeaking) {
                     // User stopped speaking but was speaking
                     localIsSpeaking = false;
                     setIsSpeaking(false);
                     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                     silenceTimerRef.current = setTimeout(finishTurn, 2500);
                  } else if (!silenceTimerRef.current && !localIsSpeaking) {
                     // Initial max wait time before timing out initial silence
                     silenceTimerRef.current = setTimeout(finishTurn, 10000); 
                  }
                }
                
                trackVolumeReq = requestAnimationFrame(trackVolume);
            };
            
            trackVolume();

            // Finish the current turn when silence triggers
            const finishTurn = async () => {
                 if (trackVolumeReq) cancelAnimationFrame(trackVolumeReq);
                 if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                 silenceTimerRef.current = null;

                 if (recognition) { try { recognition.stop(); } catch(e){} }
                 
                 setStatus("Analyzing answer...");
                 
                 // Process backend analysis
                 let turnScore = { technicalScore: 50, communicationScore: 50, fillerWords: 0, strengths: [], weaknesses: [], nextDifficulty: "medium" };
                 
                 if (fullTranscript.length > 5) {
                     const analysis = await analyzeAnswer(fullTranscript, aiQuestion);
                     if (analysis) {
                         turnScore = analysis;
                     }
                 }
                 
                 evaluationDataRef.current.totalAnswers += 1;
                 evaluationDataRef.current.technicalScoreTotal += turnScore.technicalScore;
                 evaluationDataRef.current.communicationScoreTotal += turnScore.communicationScore;
                 evaluationDataRef.current.fillerWords += turnScore.fillerWords;
                 evaluationDataRef.current.strengths.push(...turnScore.strengths);
                 evaluationDataRef.current.weaknesses.push(...turnScore.weaknesses);
                 
                 evaluationDataRef.current.questionsData.push({
                     question: aiQuestion,
                     answer: fullTranscript,
                     technicalScore: turnScore.technicalScore,
                     communicationScore: turnScore.communicationScore,
                     difficulty: turnScore.nextDifficulty
                 });

                 // Set difficulty for next turn
                 setCurrentDifficulty(turnScore.nextDifficulty);

                 turn++;
                 if (turn <= 10) { // Run 10 rounds dynamically
                     const shouldFollowUp = Math.random() > 0.6; // 40% chance of follow-up
                     askAndListen(fullTranscript, shouldFollowUp);
                 } else {
                     endInterview(false);
                 }
            };
        });
    };

    // Kickoff
    askAndListen("");
  };

  if (interviewState === 'intro') {
    return (
      <div className="relative w-full h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 w-full max-w-2xl text-center text-white px-8">
           <div className="mb-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {role}
           </div>
           <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Adaptive AI Interview
           </h1>
           <p className="mb-8 text-gray-400 text-lg">
             This is a rigorous real-time session. Look at the camera, avoid switching tabs, and ensure you speak clearly.
           </p>
           
           {streamError ? (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center mb-8 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 mr-2" /> Camera and microphone access denied.
                </div>
           ) : isStreamReady ? (
               <div className="w-56 h-56 mx-auto rounded-full overflow-hidden border-[6px] border-emerald-500 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                 {/* 5. Add muted and playsInline */}
                 <video ref={videoRef} muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
               </div>
           ) : (
               <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700 animate-pulse w-full max-w-md mx-auto mb-8">
                  <Bot className="w-12 h-12 text-gray-500 mb-4 animate-bounce" />
                  <p className="text-gray-400 font-medium tracking-wide">Requesting Hardware Permissions...</p>
               </div>
           )}
           
           <Button 
              onClick={startInterviewLoop} 
              disabled={streamError || !isStreamReady} 
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-10 py-4 rounded-full text-lg shadow-lg shadow-emerald-600/30 font-semibold focus:ring-4 focus:ring-emerald-500/50 transition-all active:scale-95"
           >
              Enter Interview Room
           </Button>
        </div>
      </div>
    );
  }

  if (interviewState === 'summary') {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
         <motion.div initial={{scale:0}} animate={{scale:1}} className="inline-block relative">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"></div>
            <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6 relative z-10" />
         </motion.div>
         <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-text">Evaluation Complete</h1>
         <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your performance was scored based on real-time acoustic volume, persistent facial presence, and browser focus metrics.
         </p>
         
         <div className="bg-white dark:bg-card border border-gray-100 dark:border-gray-800/50 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-lg mx-auto">
            <div className="flex flex-col items-center mb-8 relative">
                <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-current text-gray-100 dark:text-gray-800" strokeWidth="12" fill="none" />
                    <circle cx="96" cy="96" r="88" className="stroke-current text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" strokeWidth="12" strokeDasharray={`${(finalScore / 100) * 553} 553`} strokeLinecap="round" fill="none" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <div className="text-6xl font-black text-text tracking-tighter">{finalScore}</div>
                   <div className="text-sm font-bold text-gray-400 tracking-widest uppercase mt-1">Score</div>
                </div>
            </div>

            <ul className="text-left w-full space-y-5 font-medium text-gray-600 dark:text-gray-300">
               <li className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-emerald-500"/> Speech Output</span> 
                  <Badge variant={evaluationDataRef.current.speaking ? "success" : "danger"}>{evaluationDataRef.current.speaking ? "Detected" : "Missed"}</Badge>
               </li>
               <li className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="flex items-center gap-2"><VideoOff className="w-4 h-4 text-emerald-500"/> Camera Presence</span> 
                  <Badge variant={evaluationDataRef.current.facePresent ? "success" : "danger"}>{evaluationDataRef.current.facePresent ? "Maintained" : "Flagged"}</Badge>
               </li>
               <li className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-emerald-500"/> Focus Integrity</span> 
                  <Badge variant={evaluationDataRef.current.tabSwitches === 0 ? "success" : "danger"}>{(evaluationDataRef.current.tabSwitches === 0) ? "Clean" : `${evaluationDataRef.current.tabSwitches} Switches`}</Badge>
               </li>
            </ul>

            <Button onClick={() => navigate('/dashboard')} className="mt-8 w-full py-4 text-lg rounded-xl flex items-center justify-center gap-2 shadow-sm font-semibold">
               Return to Dashboard <ArrowRight className="w-5 h-5"/>
            </Button>
         </div>
      </div>
    );
  }

  // ---- FULL SCREEN ACTIVE MODE ----
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black flex flex-col justify-end overflow-hidden">
      
      {/* Dynamic Background Gradient purely for aesthetic depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-emerald-900/10 mix-blend-overlay"></div>
      
      {/* 5. Add muted and playsInline */}
      {/* Full Screen Candidate Camera */}
      <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-90 transition-opacity duration-1000" />
      
      {/* Overhead Status Bar */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10 pointer-events-none">
          {/* Virtual AI Avatar Representation */}
          <div className="bg-black/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex items-center gap-4">
             <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-indigo-400">
                <Bot className="w-7 h-7 text-white" />
                {status === "Interviewer speaking..." && (
                   <span className="absolute inset-0 bg-white/20 animate-ping rounded-full block"></span>
                )}
             </div>
             <div>
                <h3 className="text-white font-bold text-xl tracking-tight">AI Agent {status === 'Listening...' ? 'Active' : ''}</h3>
                <p className={`text-sm font-semibold tracking-wider uppercase ${status === 'Listening...' ? 'text-emerald-400' : 'text-blue-300 animate-pulse'}`}>{status}</p>
             </div>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
             <div className="flex gap-2">
               <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 backdrop-blur-md px-4 py-2 font-mono shadow-xl rounded-xl">
                   {skillFocus}
               </Badge>
               <Badge variant={currentDifficulty === "hard" ? "danger" : currentDifficulty === "easy" ? "success" : "warning"} className="backdrop-blur-md px-4 py-2 font-mono shadow-xl rounded-xl capitalize">
                   {currentDifficulty}
               </Badge>
               <Badge variant="warning" className="bg-orange-500/20 text-orange-400 border border-orange-500/20 backdrop-blur-md px-5 py-2 font-mono shadow-xl rounded-xl">
                   Turn {currentQuestionNumber}/10
               </Badge>
             </div>
             <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
                 <div className="flex items-center gap-2">
                     <Mic className={`w-5 h-5 transition-colors ${isSpeaking ? 'text-emerald-400' : 'text-gray-500'}`}/>
                     <div className="flex gap-1 h-3 items-end w-12">
                         {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-1.5 rounded-t-sm transition-all duration-100 ${volumeLevel > (i * 10 + 5) ? 'bg-emerald-400 h-3 animate-pulse' : 'bg-gray-600 h-1'}`}></div>
                         ))}
                     </div>
                 </div>
                 <div className="w-px h-6 bg-white/20"></div>
                 <button onClick={() => endInterview(true, "Manually Terminated")} className="bg-red-500/20 text-red-500 hover:bg-red-500/40 p-2 rounded-lg transition-colors" title="End Call">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                 </button>
             </div>
          </div>
      </div>

      {status === "Listening..." && !isSpeaking && (
          <div className="absolute bottom-12 inset-x-0 flex justify-center z-10 pointer-events-none">
             <div className="text-white/60 bg-black/40 px-6 py-3 rounded-full text-sm font-medium tracking-wide backdrop-blur-md animate-pulse border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                Waiting for your response... detection is active
             </div>
          </div>
      )}
    </motion.div>
  );
}
