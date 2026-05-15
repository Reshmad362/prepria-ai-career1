import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldCheck, ArrowRight } from 'lucide-react';
import CameraCheck from './CameraCheck';
import EnvironmentChecklist from './EnvironmentChecklist';

export default function InterviewSetup({ 
  role, 
  setRole, 
  personality,
  setPersonality,
  difficulty,
  setDifficulty,
  onStart, 
  streamRef, 
  forceRender 
}) {
  const [checks, setChecks] = useState({
    camera: { status: 'checking', text: 'Checking Camera...' },
    mic: { status: 'checking', text: 'Checking Microphone...' }, 
    lighting: { status: 'checking', text: 'Checking Lighting...' }
  });

  const [isReady, setIsReady] = useState(false);
  const [isInit, setIsInit] = useState(false);

  // 1. Prevent re-initialization: Initialize once
  useEffect(() => {
    async function initCamera() {
      if (streamRef.current) {
        setChecks(prev => ({ ...prev, mic: { status: 'success', text: '✔ Microphone Working' } }));
        setIsInit(true);
        return;
      }
      try {
        console.log("[InterviewSetup] Initializing Camera Stream");
        const streamData = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // 4. Use useRef to store stream. Do NOT trigger a local re-render loop that recreates streams.
        streamRef.current = streamData;
        setChecks(prev => ({ ...prev, mic: { status: 'success', text: '✔ Microphone Working' } }));
        forceRender(); // tell parent to re-render ONCE
        setIsInit(true);
      } catch (err) {
        console.error("[InterviewSetup] Camera permission denied", err);
        setChecks(prev => ({ 
          ...prev, 
          camera: { status: 'failed', text: '❌ Permission Denied' }, 
          mic: { status: 'failed', text: '❌ Permission Denied' }, 
          lighting: { status: 'failed', text: '❌ Cannot Check Lighting' } 
        }));
        setIsInit(true);
      }
    }

    initCamera();

    // 2. DO NOT STOP stream here!
    // We expect the transition to InterviewScreen to keep the stream alive!
    // The previous implementation was destroying the stream on transition!
    return () => {
       console.log("[InterviewSetup] Unmounting. Stream tracks will intentionally remain alive.");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Evaluate Readiness
  useEffect(() => {
    if (checks.camera.status === 'success' && checks.mic.status === 'success' && 
       (checks.lighting.status === 'success' || checks.lighting.status === 'warning')) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [checks]);

  const handleLightingChecked = (status) => {
    const textMapping = {
       'success': '✔ Lighting Good',
       'warning': '⚠ Low Lighting (Warning)',
       'failed': '❌ Lighting Error',
       'checking': 'Checking Lighting...'
    };
    setChecks(prev => ({ ...prev, lighting: { status, text: textMapping[status] } }));
  };

  const handleCameraStatus = (status) => {
    let mappedStatus = 'failed';
    let text = '❌ Camera Not Detected';
    
    if (status === 'success') {
       mappedStatus = 'success';
       text = '✔ Camera Working';
    } else if (status === 'checking') {
       mappedStatus = 'checking';
       text = 'Checking Camera...';
    } else if (status === 'permission_denied') {
       mappedStatus = 'failed';
       text = '❌ Permission Denied';
    } else if (status === 'off') {
       mappedStatus = 'failed';
       text = '❌ Camera Offline';
    }

    setChecks(prev => ({ ...prev, camera: { status: mappedStatus, text } }));
  };

  // Prevent flicker during hardware bootstrap
  if (!isInit) {
     return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900"/>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Instructions & Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
           <div>
             <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
               Interview Setup
             </h1>
             <p className="text-lg text-slate-600 dark:text-slate-400">
               We need to ensure your environment is optimal before starting the AI simulation. 
               Please grant camera and microphone permissions.
             </p>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
               <Settings className="text-blue-500 w-6 h-6" />
               <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Configuration</h3>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Role / Position</label>
                 <input 
                   type="text" 
                   value={role} 
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                   placeholder="e.g. Frontend Engineer"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interviewer Personality</label>
                   <select 
                     value={personality} 
                     onChange={(e) => setPersonality(e.target.value)}
                     className="w-full p-3.5 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white outline-none"
                   >
                     <option value="friendly">Friendly HR</option>
                     <option value="standard">Standard Technical</option>
                     <option value="strict">Strict & Rapid-fire</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                   <select 
                     value={difficulty} 
                     onChange={(e) => setDifficulty(e.target.value)}
                     className="w-full p-3.5 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white outline-none"
                   >
                     <option value="easy">Easy</option>
                     <option value="medium">Medium</option>
                     <option value="hard">Hard</option>
                   </select>
                 </div>
               </div>
             </div>
           </div>

           <EnvironmentChecklist checks={checks} />

           <button 
             onClick={onStart}
             disabled={!isReady}
             className="w-full py-5 rounded-2xl bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 hover:bg-blue-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
           >
             {isReady ? 'Start AI Interview' : 'Complete Setup to Start'} 
             <ArrowRight className="w-5 h-5" />
           </button>
           
           {!isReady && (
             <p className="text-sm text-center text-slate-500 flex items-center justify-center gap-2 mt-4">
               <ShieldCheck className="w-4 h-4" /> Please resolve any warnings to proceed.
             </p>
           )}
        </motion.div>

        {/* Right Side: Camera View Container */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex items-center">
           <CameraCheck 
             streamRef={streamRef} 
             onLightingChecked={handleLightingChecked} 
             onCameraStatus={handleCameraStatus} 
           />
        </motion.div>

      </div>
    </div>
  );
}
