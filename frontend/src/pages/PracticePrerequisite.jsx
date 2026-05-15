import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Mic, Camera, AlertCircle, User, FileText, Clock, Settings, RefreshCw } from 'lucide-react';

export default function PracticePrerequisite() {
  const navigate = useNavigate();

  const [micStatus, setMicStatus] = useState('checking'); // checking, success, error
  const [camStatus, setCamStatus] = useState('checking');
  
  const selectedRole = localStorage.getItem("selectedInterviewRole");
  const selectedRound = localStorage.getItem("selectedInterviewRound");
  const selectedDuration = localStorage.getItem("selectedInterviewDuration");
  const selectedInterviewer = localStorage.getItem("selectedInterviewer");
  const resumeFileName = localStorage.getItem("resumeFileName");

  const checkPermissions = async () => {
    setMicStatus('checking');
    setCamStatus('checking');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMicStatus('success');
      setCamStatus('success');
      // Stop stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Permission check failed", err);
      // Let's try checking individually if both fail
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStatus('success');
        audioStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        setMicStatus('error');
      }

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCamStatus('success');
        videoStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        setCamStatus('error');
      }
    }
  };

  useEffect(() => {
    if (selectedRole) {
      checkPermissions();
    }
  }, [selectedRole]);

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No interview setup found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Please select a role first to begin your practice session.</p>
          <button 
            onClick={() => navigate('/role-interviews')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Go to Role Interviews
          </button>
        </div>
      </div>
    );
  }

  const checklist = [
    { id: 'setup', label: 'Interview setup completed', status: 'success' },
    { id: 'browser', label: 'Browser is compatible', status: 'success' },
    { id: 'mic', label: 'Microphone permission', status: micStatus },
    { id: 'cam', label: 'Camera permission', status: camStatus },
    { id: 'internet', label: 'Internet connection stable', status: navigator.onLine ? 'success' : 'error' },
    { id: 'details', label: 'Interview details saved', status: 'success' },
  ];

  const completedCount = checklist.filter(item => item.status === 'success').length;
  const isReady = completedCount === checklist.length;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Practice Prerequisite
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Please ensure your system is ready before starting the AI mock interview.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Left Card - Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Interview Instructions</h2>
            
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-4 border-primary/20 flex items-center justify-center mb-4 shadow-inner">
                <User className="w-10 h-10 text-primary" />
              </div>
              <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                Your AI interviewer will guide you through the mock interview.
              </p>
            </div>

            <ol className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">1.</span>
                <span>Wait for the AI interviewer introduction before answering.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">2.</span>
                <span>Use headphones or earphones for the best experience.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">3.</span>
                <span>Answer every question to receive the final analytics report.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">4.</span>
                <span>Click Start Answer to record and End Answer when finished.</span>
              </li>
            </ol>
          </div>

          {/* Right Card - Checklist & Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Setup Checklist</h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                {completedCount}/{checklist.length}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                  {item.status === 'checking' && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
                  {item.status === 'success' && <Check className="w-5 h-5 text-green-500" />}
                  {item.status === 'error' && <X className="w-5 h-5 text-red-500" />}
                </div>
              ))}
            </div>

            {(micStatus === 'error' || camStatus === 'error') && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Microphone or camera access denied. Please allow permissions in your browser settings to continue.</p>
                </div>
                <button 
                  onClick={checkPermissions}
                  className="bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 py-2 px-4 rounded-lg font-medium self-start transition-colors"
                >
                  Check Again
                </button>
              </div>
            )}

            <div className="mt-auto">
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Session Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4 text-primary" />
                  <span className="truncate" title={selectedRole}>{selectedRole}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="capitalize">{selectedRound?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{selectedDuration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mic className="w-4 h-4 text-primary" />
                  <span className="capitalize">{selectedInterviewer}</span>
                </div>
                {resumeFileName && (
                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{resumeFileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-center mt-8">
          <button
            disabled={!isReady}
            onClick={() => navigate('/mock-interview')}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${
              isReady 
                ? 'bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 hover:shadow-md' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
