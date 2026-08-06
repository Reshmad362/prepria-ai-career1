import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, FileCheck, BrainCircuit, Type, FileSearch, Loader2, Sparkles } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { sendEmailNotification } from '../utils/emailApi';

export default function ResumeIntelligence() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDemo = localStorage.getItem('isDemo') === 'true';
  const navigate = useNavigate();
  const { profile, updateProfile } = useContext(UserContext);
  
  const [atsHistory, setAtsHistory] = useState([]);
  const [latestAts, setLatestAts] = useState(null);

  useEffect(() => {
      const email = profile?.email || localStorage.getItem('userEmail');
      if (email) {
          const stored = localStorage.getItem(`atsData_${email}`);
          if (stored) {
              const data = JSON.parse(stored);
              setLatestAts(data);
              setAtsHistory([data]); // Simplified history logic for now
          }
      }
  }, [profile]);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isDemo) return alert("Please sign in to upload resumes.");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isDemo) return alert("Please sign in to upload resumes.");
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        const { data } = await response.json();
        
        const resumeData = {
            skills: data.skills || [],
            experience: data.experience || [],
            projects: data.projects || [],
            education: data.education || [],
            score: data.score || 0
        };

        updateProfile(resumeData);
        
        const userEmail = profile?.email || localStorage.getItem('userEmail');
        const newAtsData = {
          id: Date.now(),
          uploadedAt: Date.now(),
          fileName: file.name,
          ...data
        };
        
        if (userEmail) {
            localStorage.setItem(`atsData_${userEmail}`, JSON.stringify(newAtsData));
        }
        
        setLatestAts(newAtsData);
        setAtsHistory(prev => [newAtsData, ...prev]);
        setFile(null);
        
        logActivity({ type: "resume_upload", title: "Resume Analyzed", description: `Score: ${data.score}`, status: "success" });
        sendEmailNotification("resume_upload", "Resume Analyzed", { filename: file.name, atsScore: data.score });
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      alert("Network error: Failed to connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 60) return 'text-yellow-500';
      return 'text-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">Resume Intelligence</h1>
            <p className="text-gray-500 mt-1 max-w-2xl font-inter text-sm">Deep AI analysis of your resume. We evaluate keyword match, grammar, action verbs, and ATS compatibility to ensure you stand out.</p>
          </div>
        </div>

        {/* Uploader Section */}
        <Card className="flex flex-col items-center justify-center p-8 relative overflow-hidden group">
          <div 
            className={`w-full max-w-3xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-[#FF6B00]/5 ${
              dragActive ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <FileText className="w-12 h-12 text-[#FF6B00] mb-4" />
                <p className="font-bold text-gray-900 dark:text-white text-lg">{file.name}</p>
                <p className="text-sm font-medium text-gray-500 mb-6 drop-shadow-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setFile(null)}>Cancel</Button>
                    <Button onClick={handleAnalyze} disabled={isUploading} className="bg-[#111111] text-white hover:bg-gray-800">
                        {isUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</> : 'Scan Resume'}
                    </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center pointer-events-none">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4 group-hover:-translate-y-2 transition-transform duration-300" />
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drag & drop to analyze</p>
                <p className="text-sm font-medium text-gray-500 mb-6">Supports PDF & DOCX</p>
                <label htmlFor="file-upload" className="pointer-events-auto">
                  <Button as="span" className="cursor-pointer bg-[#FF6B00] hover:bg-[#E65C00] text-white border-0 shadow-lg shadow-[#FF6B00]/20">
                    Browse Files
                  </Button>
                </label>
                <input id="file-upload" type="file" className="hidden pointer-events-auto" onChange={handleFileChange} accept=".pdf,.docx" />
              </div>
            )}
          </div>
        </Card>

        {/* Dashboard Results */}
        {latestAts && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 animate-in slide-in-from-bottom-8 duration-700">
                
                {/* Main Score Card */}
                <Card className="lg:col-span-1 bg-gradient-to-br from-[#111111] to-[#222222] text-white border-0 shadow-xl relative overflow-hidden flex flex-col justify-center items-center py-12">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BrainCircuit className="w-48 h-48 -mr-12 -mt-12" />
                    </div>
                    <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-4">Overall ATS Score</h3>
                    <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="#FF6B00" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * latestAts.score) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-black">{latestAts.score}</span>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-gray-400 max-w-xs text-center">
                        {latestAts.score >= 80 ? "Excellent! Your resume is highly optimized for ATS systems." : "Your resume needs some adjustments to pass ATS filters effectively."}
                    </p>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grammar & Verbs */}
                    <Card>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Type className="w-5 h-5 text-blue-500" /> Grammar Analysis</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 font-medium text-sm">Grammar Score</span>
                            <span className={`font-black text-xl ${getScoreColor(latestAts.feedback?.grammar_score || 0)}`}>{latestAts.feedback?.grammar_score || 0}/100</span>
                        </div>
                        {latestAts.feedback?.grammar_issues?.length > 0 ? (
                            <ul className="space-y-2">
                                {latestAts.feedback.grammar_issues.map((iss, i) => (
                                    <li key={i} className="text-sm text-red-600 bg-red-50 p-2 rounded flex gap-2 items-start"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {iss}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> No grammar issues detected.
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Action Verbs</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-4">
                            {latestAts.feedback?.action_verbs_feedback || "Analyzing verb strength..."}
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Suggestion</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Replace weak verbs like 'helped' or 'worked on' with 'orchestrated', 'architected', or 'spearheaded'.</p>
                        </div>
                    </Card>

                    {/* Detailed Feedback */}
                    <Card className="md:col-span-2">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileSearch className="w-5 h-5 text-[#FF6B00]" /> AI Resume Insights</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-green-600 flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4" /> Strengths</h4>
                                <ul className="space-y-2">
                                    {latestAts.feedback?.strengths?.map((str, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/30">{str}</li>
                                    )) || <p className="text-sm text-gray-500">None detected.</p>}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-500 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" /> Areas for Improvement</h4>
                                <ul className="space-y-2">
                                    {latestAts.feedback?.weaknesses?.map((wk, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30">{wk}</li>
                                    )) || <p className="text-sm text-gray-500">None detected.</p>}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )}

      </div>
  );
}
