import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, X, Mic, Camera, AlertCircle, User, FileText, Clock, 
  Settings, RefreshCw, ArrowRight, ShieldCheck, PlayCircle, 
  Monitor, Eye, AlertTriangle, CheckCircle2, Shield, Lock, Volume2, Loader2
} from 'lucide-react';
import { getQuestionsForRole } from '../utils/interviewQuestionEngine';

export default function PracticePrerequisite() {
  const navigate = useNavigate();

  // Active Session Config
  const [activeConfig, setActiveConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("activeInterviewConfig");
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const selectedRole = localStorage.getItem("selectedInterviewRole") || "Full Stack Developer";
    const selectedRound = localStorage.getItem("selectedInterviewRound") || "Technical";
    const questions = getQuestionsForRole(selectedRole, "Intermediate", selectedRound, 10);
    
    const fallback = {
      roleName: selectedRole,
      difficulty: "Intermediate",
      interviewType: selectedRound,
      questionCount: 10,
      durationMinutes: 25,
      questions: questions,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("activeInterviewConfig", JSON.stringify(fallback));
    return fallback;
  });

  const interviewType = activeConfig.interviewType || "Technical";
  
  // Screen sharing is required for coding, technical, and system design rounds
  const isScreenRequired = useMemo(() => {
    const t = interviewType.toLowerCase();
    return t.includes("technical") || t.includes("coding") || t.includes("system design") || t.includes("sql") || t.includes("full stack");
  }, [interviewType]);

  // Hardware Statuses
  const [camStatus, setCamStatus] = useState('checking'); // 'checking' | 'ready' | 'permission_required' | 'unavailable'
  const [micStatus, setMicStatus] = useState('checking'); // 'checking' | 'ready' | 'permission_required' | 'unavailable'
  const [screenStatus, setScreenStatus] = useState('required'); // 'ready' | 'required' | 'checking' | 'unavailable'
  const [faceDetected, setFaceDetected] = useState(false);
  const [micVolume, setMicVolume] = useState(0); // 0 - 100%
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Media Stream References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micAnimFrameRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const isLaunchingRef = useRef(false);

  // Initialize Camera & Microphone with Live Preview & Meter
  const initMediaDevices = async () => {
    setCamStatus('checking');
    setMicStatus('checking');
    setErrorMessage("");

    // Stop existing camera tracks before re-requesting
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: true 
      });

      cameraStreamRef.current = stream;

      // Attach video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCamStatus('ready');
      setMicStatus('ready');

      // Setup Live Audio Analyzer Meter
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudioMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setMicVolume(normalized);
          micAnimFrameRef.current = requestAnimationFrame(updateAudioMeter);
        };

        updateAudioMeter();
      } catch (audioErr) {
        console.warn("Audio meter init error:", audioErr);
      }

      // Start Face Presence Monitor
      startFacePresenceMonitor();

    } catch (err) {
      console.error("Camera/Mic permission failed:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCamStatus('permission_required');
        setMicStatus('permission_required');
        setErrorMessage("Camera & microphone permissions were denied. Please allow access in your browser settings to proceed.");
      } else {
        setCamStatus('unavailable');
        setMicStatus('unavailable');
        setErrorMessage(`Hardware error: ${err.message || 'Camera/Microphone not detected'}.`);
      }
    }
  };

  // Face Presence Verification
  const startFacePresenceMonitor = () => {
    if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
    
    faceCheckIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || camStatus !== 'ready') return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 160, 120);

      try {
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;
        let brightnessSum = 0;
        let skinTonePixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightnessSum += (r + g + b) / 3;

          // Simple skin tone heuristic range for browser presence verification
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15)) {
            skinTonePixels++;
          }
        }

        const avgBrightness = brightnessSum / (data.length / 4);
        const skinToneRatio = skinTonePixels / (data.length / 4);

        // Valid if frame has light and recognizable subject
        if (avgBrightness > 20 && skinToneRatio > 0.05) {
          setFaceDetected(true);
        } else {
          setFaceDetected(false);
        }
      } catch (e) {
        setFaceDetected(true); // Fallback to avoid blocking if canvas security context throws
      }
    }, 1500);
  };

  // Request Screen Share - Explicit User Click Only
  const handleRequestScreenShare = async () => {
    setScreenStatus('checking');
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false
      });

      const videoTracks = stream.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        throw new Error("No active video track detected on screen stream.");
      }

      screenStreamRef.current = stream;
      setScreenStatus('ready');

      // Listen for when candidate stops screen share via native browser button
      videoTracks[0].onended = () => {
        setScreenStatus('required');
        screenStreamRef.current = null;
      };
    } catch (err) {
      console.warn("Screen share cancelled/denied:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'AbortError') {
        setScreenStatus('required');
        setErrorMessage("Screen sharing is required to start this interview.");
      } else {
        setScreenStatus('unavailable');
        setErrorMessage(`Screen share error: ${err.message || 'Screen capture not supported or cancelled'}.`);
      }
      screenStreamRef.current = null;
    }
  };

  useEffect(() => {
    initMediaDevices();

    return () => {
      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      // If navigating to /mock-interview, streams are handed over. Otherwise, clean them up.
      if (!isLaunchingRef.current) {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
        }
      }
    };
  }, []);

  // Strict Validation: Check if all mandatory requirements pass
  const isReadyToStart = useMemo(() => {
    const isCamPass = camStatus === 'ready';
    const isMicPass = micStatus === 'ready';
    const isScreenPass = screenStatus === 'ready';
    return isCamPass && isMicPass && isScreenPass && rulesAccepted;
  }, [camStatus, micStatus, screenStatus, rulesAccepted]);

  const handleLaunchLiveInterview = () => {
    // Final verification: check actual MediaStream tracks
    const camTracks = cameraStreamRef.current?.getVideoTracks() || [];
    const hasLiveCam = camTracks.length > 0 && camTracks[0].readyState === 'live';

    const screenTracks = screenStreamRef.current?.getVideoTracks() || [];
    const hasLiveScreen = screenTracks.length > 0 && screenTracks[0].readyState === 'live';

    if (!hasLiveCam || !hasLiveScreen || !isReadyToStart) {
      setErrorMessage("Screen sharing and camera access are required to start this proctored interview.");
      return;
    }

    isLaunchingRef.current = true;

    // Hand over active streams to live interview
    window.__prepriaMediaStreams = {
      cameraStream: cameraStreamRef.current,
      screenStream: screenStreamRef.current
    };

    // Save verified setup state
    localStorage.setItem("interviewPreflightPassed", "true");
    localStorage.setItem("isScreenShareActive", "true");
    
    navigate('/mock-interview');
  };

  return (
    <div className="min-h-[85vh] bg-[#F4F6F9] dark:bg-[#0B0C0E] py-10 px-4 sm:px-6 lg:px-8 font-manrope animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 text-[10px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pre-Interview System Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Ready to Begin: {activeConfig.roleName}
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Mandatory device, audio level, and conduct rule verification before your live AI evaluation.
          </p>
        </div>

        {/* Global Error Notice if permissions fail */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={initMediaDevices}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors text-[11px] cursor-pointer shrink-0"
            >
              Retry Access
            </button>
          </div>
        )}

        {/* 2-Column Preflight Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================================================
              LEFT: LIVE CAMERA PREVIEW & HARDWARE STATUS
          ================================================== */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span>Live Video &amp; Mic Preview</span>
              </h2>
              <button 
                onClick={initMediaDevices}
                className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Re-check
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${camStatus === 'ready' ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {camStatus !== 'ready' && (
                <div className="text-center p-6 space-y-2 text-gray-400">
                  <Camera className="w-10 h-10 mx-auto opacity-40 animate-pulse" />
                  <p className="text-xs font-bold">
                    {camStatus === 'checking' ? "Connecting to camera..." : "Camera unavailable. Grant permissions to continue."}
                  </p>
                </div>
              )}

              {/* Status Overlays */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                    camStatus === 'ready' ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'
                  }`}>
                    {camStatus === 'ready' ? "✓ Camera Active" : "✕ Camera Required"}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                  faceDetected ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'
                }`}>
                  {faceDetected ? "✓ Face Detected" : "⚠ Position Your Face"}
                </span>
              </div>

              {/* Live Mic Audio Meter */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center gap-3">
                <Volume2 className={`w-4 h-4 shrink-0 ${micVolume > 5 ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-gray-300 mb-1">
                    <span>Microphone Input Level</span>
                    <span>{micVolume > 5 ? "Audio Detected" : "Speak to test"}</span>
                  </div>
                  <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-75 rounded-full ${
                        micVolume > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, micVolume * 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Share Requirement Section */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#FF6B00]" />
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white block">
                      Screen Sharing (Mandatory for Live Proctoring)
                    </span>
                    <span className="text-[10px] text-gray-500">Share your entire screen, application window, or browser tab</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                  screenStatus === 'ready'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40'
                    : screenStatus === 'checking'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800/40'
                    : screenStatus === 'unavailable'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800/40'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800/40'
                }`}>
                  {screenStatus === 'ready' ? "✓ Ready" : screenStatus === 'checking' ? "Checking..." : screenStatus === 'unavailable' ? "✕ Not available" : "⚠ Required"}
                </span>
              </div>

              {screenStatus !== 'ready' ? (
                <button
                  type="button"
                  onClick={handleRequestScreenShare}
                  disabled={screenStatus === 'checking'}
                  className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {screenStatus === 'checking' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Screen Share...</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Enable Screen Sharing</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Screen sharing is active and verified for this session.</span>
                </div>
              )}
            </div>

            {/* Hardware Checklist Verification Strip */}
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-bold">1. Camera Video Stream</span>
                {camStatus === 'ready' ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : camStatus === 'checking' ? (
                  <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-rose-600">✕ Blocked</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-bold">2. Microphone Input Device</span>
                {micStatus === 'ready' ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : micStatus === 'checking' ? (
                  <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-rose-600">✕ Blocked</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-bold">3. Screen Share</span>
                {screenStatus === 'ready' ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : screenStatus === 'checking' ? (
                  <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : screenStatus === 'unavailable' ? (
                  <span className="text-[10px] font-extrabold text-rose-600">✕ Not available</span>
                ) : (
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">⚠ Required</span>
                )}
              </div>
            </div>

          </div>

          {/* ==================================================
              RIGHT: INTERVIEW RULES, CONSENT & START
          ================================================== */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
            
            <h2 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Interview Conduct Rules &amp; Anti-Cheating</span>
            </h2>

            {/* Rules Container */}
            <div className="p-4 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Keep your face clearly visible</strong> in front of the camera throughout the entire interview.</span>
              </div>

              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Keep your microphone enabled</strong> when dictating or answering questions.</span>
              </div>

              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Maintain active screen sharing</strong> throughout the live session. Stopping screen share triggers a proctoring violation.</span>
              </div>

              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Do not switch tabs or minimize the browser.</strong> Repeated tab switches are logged as interview violations.</span>
              </div>

              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No external unauthorized assistance.</strong> Answer each question with your genuine domain reasoning.</span>
              </div>
            </div>

            {/* Session Parameters Review */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Role</span>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5 block truncate">{activeConfig.roleName}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Round</span>
                <span className="text-xs font-extrabold text-primary mt-0.5 block truncate">{activeConfig.interviewType}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Questions</span>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5 block">{activeConfig.questionCount || 10} Qs</span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                I agree to the interview conduct rules, confirm my hardware is operational, and am ready to begin.
              </span>
            </label>

            {/* Primary Action Button */}
            <button
              disabled={!isReadyToStart}
              onClick={handleLaunchLiveInterview}
              className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isReadyToStart
                  ? 'bg-primary hover:bg-primaryHover text-white shadow-primary/25'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>
                {!isReadyToStart 
                  ? (camStatus !== 'ready' || micStatus !== 'ready' 
                      ? "Grant Camera & Mic Access to Start" 
                      : screenStatus !== 'ready' 
                      ? "Enable Screen Sharing to Start" 
                      : "Accept Rules to Start Interview")
                  : "Launch Live AI Mock Interview"
                }
              </span>
            </button>

            <button
              onClick={() => navigate('/role-interviews')}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 block text-center w-full"
            >
              Back to Studio Setup
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
