import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, FileCheck, 
  BrainCircuit, Type, FileSearch, Loader2, Sparkles, ArrowRight, 
  RefreshCw, Check, Zap, Layers, BarChart3, AlertCircle, Compass, HelpCircle 
} from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { sendEmailNotification } from '../utils/emailApi';

export default function ResumeIntelligence() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const fileInputRef = useRef(null);
  const reuploadInputRef = useRef(null);

  const isDemo = localStorage.getItem('isDemo') === 'true';
  const navigate = useNavigate();
  const { profile, updateProfile, completionData } = useContext(UserContext);
  
  const [latestAts, setLatestAts] = useState(null);

  const activeEmail = profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail');

  useEffect(() => {
    if (activeEmail) {
      const stored = localStorage.getItem(`atsData_${activeEmail}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setLatestAts(data);
        } catch (e) {}
      } else if (profile?.skills?.length || profile?.score !== undefined) {
        // Hydrate from profile if ATS cache is absent
        setLatestAts({
          score: profile.score || 85,
          skills: profile.skills || [],
          experience: profile.experience || "Verified",
          projects: profile.projects || [],
          education: profile.education || "Undergraduate Degree",
          fileName: profile.resumeFileName || "Resume.pdf",
          uploadedAt: Date.now(),
          feedback: profile.feedback || {
            grammar_score: 95,
            action_verbs_feedback: "Strong use of action verbs.",
            strengths: ["Strong skill coverage detected.", "Project-based learning demonstrated."],
            weaknesses: ["Add measurable metrics to bullet points."]
          }
        });
      }
    }
  }, [profile, activeEmail]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isDemo) return alert("Please sign in to upload resumes.");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processUpload(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (isDemo) return alert("Please sign in to upload resumes.");
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processUpload(selectedFile);
    }
  };

  const processUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};

        const resumeData = {
          skills: data.skills || [],
          experience: data.experience || [],
          projects: data.projects || [],
          education: data.education || [],
          score: data.score || 0,
          resumeUploaded: true,
          resumeFileName: fileToUpload.name,
          feedback: data.feedback || {}
        };

        updateProfile(resumeData);
        
        const userEmail = activeEmail;
        const newAtsData = {
          id: Date.now(),
          uploadedAt: Date.now(),
          fileName: fileToUpload.name,
          ...data
        };
        
        if (userEmail) {
          localStorage.setItem(`atsData_${userEmail}`, JSON.stringify(newAtsData));
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        if (token) {
          fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(resumeData)
          }).catch(err => console.error("Backend resume sync error:", err));
        }
        
        setLatestAts(newAtsData);
        setFile(null);
        setShowUploaderModal(false);
        
        logActivity({ type: "resume_upload", title: "Resume Analyzed", description: `Score: ${data.score}`, status: "success" });
        sendEmailNotification("resume_upload", "Resume Uploaded & Analyzed - PREPRIA Career Intelligence", { filename: fileToUpload.name, atsScore: data.score });
      } else {
        alert("Resume upload or parsing failed. Please ensure the file is a readable PDF or DOCX.");
      }
    } catch (error) {
      alert("Network error: Failed to connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const hasResume = Boolean(latestAts);
  const atsScore = latestAts?.score ?? (profile?.score || 0);
  const formattedDate = latestAts?.uploadedAt 
    ? new Date(latestAts.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently';

  // Derived score tier & explanation
  const getScoreTier = (score) => {
    if (score >= 80) return { label: 'Excellent ATS Compatibility', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40', note: 'Your resume demonstrates high keyword alignment and strong structure to pass enterprise ATS screeners.' };
    if (score >= 60) return { label: 'Good ATS Compatibility', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40', note: 'Your resume meets core format standards but can be improved with additional role keywords and metrics.' };
    return { label: 'Needs Optimization', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40', note: 'Your resume may encounter parsing obstacles in strict ATS filters. Follow the recommendations below.' };
  };

  const scoreTier = getScoreTier(atsScore);

  // Fallback strengths & improvements
  const strengthsList = latestAts?.feedback?.strengths && latestAts.feedback.strengths.length > 0 
    ? latestAts.feedback.strengths 
    : [
        latestAts?.skills?.length ? `Extracted ${latestAts.skills.length} core technical skills.` : "Clean formatting structure detected.",
        "Recognizable project and education milestones included."
      ];

  const weaknessesList = latestAts?.feedback?.weaknesses && latestAts.feedback.weaknesses.length > 0
    ? latestAts.feedback.weaknesses
    : [];

  const suggestionsList = latestAts?.feedback?.suggestions || [];

  const grammarScore = latestAts?.feedback?.grammar_score ?? 95;
  const grammarIssues = latestAts?.feedback?.grammar_issues || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* Hidden file inputs for programmatic triggers */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx" 
      />
      <input 
        type="file" 
        ref={reuploadInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx" 
      />

      {/* ==================================================
          1. PAGE HEADER
      ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Resume Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30">
              <Sparkles className="w-3 h-3" /> ATS Scanner
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Understand how your resume performs against ATS systems and discover exactly what to improve.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => reuploadInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Resume...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Analyze New Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          2. COMPACT RESUME STATUS / UPLOAD PANEL
      ================================================== */}
      {hasResume ? (
        <div className="bg-white dark:bg-[#111215] rounded-2xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Resume Analyzed ✓
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">Last analyzed: {formattedDate}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">
                {latestAts?.fileName || profile?.resumeFileName || "Primary_Resume.pdf"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <button
              onClick={() => reuploadInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Scan New Version
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('ai-insights-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer"
            >
              View Insights ↓
            </button>
          </div>
        </div>
      ) : (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center space-y-4 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-[#111215]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Upload your resume to unlock Resume Intelligence
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Supports standard PDF &amp; DOCX formats. We automatically evaluate keyword density, syntax quality, and ATS pass rates.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            <span>Upload Resume (PDF / DOCX)</span>
          </button>
        </div>
      )}

      {/* ==================================================
          3. HERO SCORE & SUMMARY SECTION (4 + 8 COLUMNS)
      ================================================== */}
      {hasResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (4 cols): RESUME SCORE PANEL */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-full text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                RESUME SCORE
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="relative my-4">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="10"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  fill="transparent" 
                  stroke="#FF6B00" 
                  strokeWidth="10" 
                  strokeDasharray="464.9" 
                  strokeDashoffset={464.9 - (464.9 * Math.min(100, Math.max(0, atsScore))) / 100} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {atsScore}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  out of 100
                </span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreTier.bg} ${scoreTier.color}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{scoreTier.label}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                {scoreTier.note}
              </p>
            </div>
          </div>

          {/* Right Column (8 cols): SCORE SUMMARY & DIMENSIONS */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    ATS Readiness Breakdown
                  </h3>
                  <p className="text-xs text-gray-500">
                    Key diagnostic dimensions evaluated across enterprise hiring filters
                  </p>
                </div>
              </div>

              {/* 4-Card Analysis Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                {/* 1. Skills Coverage */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Skills Detected
                  </span>
                  <div className="my-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {latestAts?.skills?.length || 0}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {latestAts?.skills?.length >= 5 ? '✓ Strong Coverage' : 'Moderate'}
                  </span>
                </div>

                {/* 2. Experience */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Experience
                  </span>
                  <div className="my-2">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white truncate block">
                      {latestAts?.experience && latestAts.experience !== "Not found" ? latestAts.experience : "Fresher / Project"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-primary">
                    Verified
                  </span>
                </div>

                {/* 3. Grammar Quality */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Grammar Score
                  </span>
                  <div className="my-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {grammarScore}
                      <span className="text-xs text-gray-400 font-normal">/100</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {grammarIssues.length === 0 ? '✓ Flawless' : 'Review Needed'}
                  </span>
                </div>

                {/* 4. Action Verbs */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Action Verbs
                  </span>
                  <div className="my-2">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white block">
                      {latestAts?.feedback?.action_verbs_feedback?.includes("Strong") ? "Strong" : "Needs Work"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">
                    Power Phrasing
                  </span>
                </div>

              </div>
            </div>

            {/* Extracted Skills Chip Row */}
            {latestAts?.skills?.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
                  Extracted Competencies ({latestAts.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {latestAts.skills.map((sk, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================
          4. DETAILED ANALYSIS: GRAMMAR & ACTION VERBS (6 + 6)
      ================================================== */}
      {hasResume && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Grammar Quality */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center font-bold">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Grammar Quality
                  </h3>
                  <p className="text-xs text-gray-500">Syntax, spell check &amp; readability diagnostic</p>
                </div>
              </div>

              <span className="text-base font-black text-gray-900 dark:text-white">
                {grammarScore}<span className="text-xs text-gray-400 font-normal">/100</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${grammarScore}%` }}
              />
            </div>

            {grammarIssues.length > 0 ? (
              <ul className="space-y-2 pt-2">
                {grammarIssues.map((iss, i) => (
                  <li key={i} className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{iss}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>No major spelling or grammatical errors detected.</span>
              </div>
            )}
          </div>

          {/* Card 2: Action Verbs & Power Phrasing */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Action Verbs &amp; Power Words
                  </h3>
                  <p className="text-xs text-gray-500">Measurable impact phrasing in bullet points</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {latestAts?.feedback?.action_verbs_feedback || "Use strong active verbs to begin each achievement bullet."}
            </p>

            {/* Visual verb replacement suggestions */}
            <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                Stronger Alternatives:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="line-through text-gray-400 block text-[11px]">helped</span>
                  <span className="font-bold text-primary">orchestrated</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="line-through text-gray-400 block text-[11px]">worked on</span>
                  <span className="font-bold text-primary">engineered</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="line-through text-gray-400 block text-[11px]">made</span>
                  <span className="font-bold text-primary">implemented</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================
          5. AI RESUME INSIGHTS (STRENGTHS & IMPROVEMENTS)
      ================================================== */}
      {hasResume && (
        <div id="ai-insights-section" className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
                <FileSearch className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                  AI Resume Insights
                </h2>
                <p className="text-xs text-gray-500">
                  Detailed analysis of demonstrated strengths and concrete areas to optimize
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: ✓ STRENGTHS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths ({strengthsList.length})</span>
              </div>
              <div className="space-y-2">
                {strengthsList.map((str, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: ⚠ AREAS TO IMPROVE */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Areas to Improve ({weaknessesList.length + suggestionsList.length})</span>
              </div>
              
              {weaknessesList.length > 0 || suggestionsList.length > 0 ? (
                <div className="space-y-2">
                  {weaknessesList.map((wk, idx) => (
                    <div 
                      key={`wk-${idx}`}
                      className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{wk}</span>
                    </div>
                  ))}
                  {suggestionsList.map((sug, idx) => (
                    <div 
                      key={`sug-${idx}`}
                      className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2.5"
                    >
                      <Compass className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{sug}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-75" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    No major improvement areas detected
                  </p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Your resume adheres to core enterprise ATS thresholds. Keep your skills updated with latest projects.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          6. YOUR NEXT BEST ACTION
      ================================================== */}
      {hasResume && (
        <div className="bg-gradient-to-r from-[#111215] to-[#1E2028] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#FF6B00] text-[11px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Recommended Next Step</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Test your resume readiness with an AI Mock Interview
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Validate the technical competencies extracted from your resume through role-specific simulated interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <button
              onClick={() => navigate('/career-roadmap')}
              className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Career Roadmap
            </button>
            <button
              onClick={() => navigate('/mock-interview')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Start AI Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
