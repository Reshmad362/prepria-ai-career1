import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle2, XCircle, ChevronRight, Activity, Zap, Mic, Award, FileText, BookOpen } from 'lucide-react';
import { coursesData } from '../data/coursesData';
import './InterviewFeedback.css';

export default function InterviewFeedback() {
  const { user } = useContext(UserContext);
  const [report, setReport] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (user?.email) {
      try {
        const sessionData = localStorage.getItem(`lastInterviewData_${user.email}`);
        if (sessionData) {
          setReport(JSON.parse(sessionData));
        }

        const userInsights = localStorage.getItem(`userInsights_${user.email}`);
        if (userInsights) {
          setInsights(JSON.parse(userInsights));
        }
      } catch (e) {
        console.error("Failed to parse report data", e);
      }
    }
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-indigo-200 dark:text-indigo-900/50" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Recent Interview Found</h1>
          <p className="text-gray-500 mt-2 max-w-md">You haven't completed an interview session yet. Head over to the ATS Dashboard to start one.</p>
        </div>
        <Link to="/ats-dashboard">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
            Go to ATS Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // Derive strengths and weaknesses from answers if not explicitly in insights
  const weakAreas = insights?.weakAreas || [];
  const strongAnswers = report.questions.filter(q => q.answerQualityScore > 75);
  const weakAnswers = report.questions.filter(q => q.answerQualityScore < 50);

  const strengths = [];
  if (report.scores?.technical >= 75) strengths.push("Strong technical knowledge and depth.");
  if (report.scores?.communication >= 80) strengths.push("Excellent communication and clarity.");
  if (report.scores?.confidence >= 80) strengths.push("High confidence and good pacing.");
  if (strongAnswers.length > 3) strengths.push(`Answered ${strongAnswers.length} questions exceptionally well.`);

  const weaknesses = [];
  if (report.scores?.technical < 50) weaknesses.push("Technical depth needs improvement.");
  if (report.scores?.communication < 60) weaknesses.push("Communication was sometimes unclear or contained too many filler words.");
  if (report.scores?.confidence < 60) weaknesses.push("Appeared hesitant or lacked confidence during complex questions.");
  if (weakAreas.length > 0) weaknesses.push(`Struggled historically with: ${weakAreas.slice(0,3).join(', ')}`);

  if (strengths.length === 0) strengths.push("Completed the interview successfully.");
  if (weaknesses.length === 0) weaknesses.push("No major weaknesses detected! Great job.");

  // Smart Course Recommendation Engine
  const getRecommendedCourses = () => {
    let recs = [];
    
    // Technical fallback
    if (report.scores?.technical < 60) {
      recs.push(coursesData.find(c => c.level === "Beginner" && c.domain === "tech"));
    }
    
    // Communication & Fillers
    if (report.scores?.communication < 70 || report.fillerWords > 5) {
      recs.push(coursesData.find(c => c.category === "Communication" || c.title.includes("Speaking")));
      recs.push(coursesData.find(c => c.category === "Interview Skills"));
    }
    
    // Extract keywords from weak areas and weaknesses
    const allWeaknessesStr = [...weakAreas, ...weaknesses].join(" ").toLowerCase();
    const techKeywords = ["react", "node", "python", "aws", "docker", "cloud", "data", "ml", "design", "sql"];
    
    techKeywords.forEach(kw => {
      if (allWeaknessesStr.includes(kw)) {
        const match = coursesData.find(c => c.title.toLowerCase().includes(kw) || c.category.toLowerCase().includes(kw));
        if (match) recs.push(match);
      }
    });

    // High performance fallback / padding
    const advanced = coursesData.filter(c => c.level === "Advanced");
    const emerging = coursesData.filter(c => c.domain === "emerging");
    
    recs = [...recs, ...advanced, ...emerging];
    
    return [...new Set(recs.filter(Boolean))].slice(0, 4);
  };

  const recommendedCourses = getRecommendedCourses();

  return (
    <div className="feedback-container">
      <div className="feedback-wrapper animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <header className="flex justify-between items-end mb-8 border-b border-white/10 pb-6 no-print">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" /> Interview Performance Report
            </h1>
            <p className="text-slate-400 mt-2">Role: {report.role} | Difficulty: {report.difficulty}</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
        </header>

        {/* Print Only Header */}
        <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
           <h1 className="text-3xl font-bold text-black mb-2">AI Interview Performance Report</h1>
           <p className="text-gray-600">Candidate Email: {user?.email} | Role: {report.role}</p>
           <p className="text-gray-600">Date: {new Date(report.date).toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="report-dashboard col-span-1 text-center flex flex-col items-center justify-center">
             <h2 className="text-lg font-bold text-slate-300 mb-2">Overall Score</h2>
             <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {report.overallScore}<span className="text-2xl text-slate-500">%</span>
             </div>
             {report.distractionCount > 0 && (
                <div className="mt-4 text-xs font-bold bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
                  Warnings Issued: {report.distractionCount + report.faceLossCount}
                </div>
             )}
          </div>
          
          <div className="report-dashboard col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="metric-card">
                <div className="m-label flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Technical</div>
                <div className="m-value text-yellow-400">{report.scores?.technical || 0}%</div>
                <div className="text-xs text-slate-400 mt-1">Accuracy & Depth</div>
             </div>
             <div className="metric-card">
                <div className="m-label flex items-center gap-2"><Mic className="w-4 h-4 text-green-400"/> Communication</div>
                <div className="m-value text-green-400">{report.scores?.communication || 0}%</div>
                <div className="text-xs text-slate-400 mt-1">Clarity & Fillers</div>
             </div>
             <div className="metric-card">
                <div className="m-label flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400"/> Confidence</div>
                <div className="m-value text-purple-400">{report.scores?.confidence || 0}%</div>
                <div className="text-xs text-slate-400 mt-1">Delivery & Tone</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="analysis-card">
              <h3 className="flex items-center gap-2 text-green-400 font-bold mb-4 border-b border-green-500/20 pb-2">
                 <CheckCircle2 className="w-5 h-5"/> Key Strengths
              </h3>
              <ul className="space-y-3">
                 {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                       <span className="text-green-500 font-black mt-0.5">•</span> {s}
                    </li>
                 ))}
              </ul>
           </div>
           
           <div className="analysis-card">
              <h3 className="flex items-center gap-2 text-red-400 font-bold mb-4 border-b border-red-500/20 pb-2">
                 <XCircle className="w-5 h-5"/> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                 {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                       <span className="text-red-500 font-black mt-0.5">•</span> {w}
                    </li>
                 ))}
              </ul>
           </div>
        </div>

        <div className="analysis-card mb-8">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Detailed Question Breakdown
           </h3>
           <div className="space-y-6">
              {report.questions.map((q, idx) => (
                 <div key={idx} className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 break-inside-avoid print:bg-transparent print:border-gray-300 print:shadow-none">
                    <div className="flex justify-between items-start mb-3 gap-4">
                       <h4 className="font-bold text-slate-200 text-sm md:text-base leading-relaxed print:text-black">
                          <span className="text-blue-400 print:text-blue-600 mr-2">Q{idx + 1}.</span> 
                          {q.question}
                       </h4>
                       <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${q.status === 'answered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {q.status === 'answered' ? `${q.answerQualityScore}% Score` : 'Skipped'}
                       </div>
                    </div>
                    
                    <div className="bg-slate-950 rounded-lg p-4 mb-3 border border-slate-800 print:bg-gray-50 print:border-gray-200">
                       <p className="text-sm text-slate-400 italic print:text-gray-700">
                          "{q.answerTranscript || "No answer provided."}"
                       </p>
                    </div>
                    
                    {q.status === 'answered' && (
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                             <p className="text-[10px] text-slate-500 uppercase font-bold">Fillers</p>
                             <p className="text-sm font-medium text-slate-300">{q.fillerWordsCount} words</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-500 uppercase font-bold">STAR Method</p>
                             <p className="text-sm font-medium text-slate-300">{q.starUsage > 0 ? 'Detected' : 'None'}</p>
                          </div>
                          <div className="col-span-2">
                             <p className="text-[10px] text-slate-500 uppercase font-bold">Suggestion</p>
                             <p className="text-xs font-medium text-blue-400 line-clamp-2">{q.suggestion}</p>
                          </div>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

         {/* Course Recommendations */}
         <div className="analysis-card mb-8 print:break-before-page">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 print:text-black">
               <BookOpen className="w-5 h-5 text-indigo-400 print:text-indigo-600" /> Recommended Learning Paths
            </h3>
            <p className="text-slate-400 mb-6 print:text-gray-600">Based on your performance, AI suggests these courses to improve your weak areas and advance your career:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {recommendedCourses.map((course, idx) => (
                  <Link to={`/course/${course.id}`} key={idx} className="block group">
                     <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 hover:border-indigo-500/50 transition print:bg-transparent print:border-gray-300">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-indigo-300 group-hover:text-indigo-400 transition line-clamp-1 print:text-indigo-700">
                              {course.title}
                           </h4>
                           <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full print:border print:border-gray-300 print:bg-white print:text-black">
                              {course.level}
                           </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 print:text-gray-600">
                           {course.description}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-500 print:hidden">
                           View Course <ChevronRight className="w-4 h-4" />
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
         
      </div>
    </div>
  );
}