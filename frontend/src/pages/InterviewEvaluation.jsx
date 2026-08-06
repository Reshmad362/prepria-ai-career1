import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ShieldIcon, BarChart3, Clock, CheckCircle, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export default function InterviewEvaluation() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    try {
      const sessionsStr = localStorage.getItem('interviewSessions');
      if (sessionsStr) {
         const sessions = JSON.parse(sessionsStr);
         if (sessions && sessions.length > 0) {
            const latestSession = sessions[sessions.length - 1];
            setReport(latestSession);
            generateMetrics(latestSession);
         }
      }
    } catch (err) {
      console.error("Failed to load evaluation data", err);
    }
  }, []);

  const generateMetrics = (data) => {
    let totalFillers = 0;
    let totalConf = 0;
    let totalStar = 0;
    let totalQuality = 0;
    let answeredCount = 0;
    
    (data.questions || []).forEach(q => {
      if (q.status === 'answered') {
         totalFillers += q.fillerWordsCount || 0;
         totalConf += q.confidenceScore || 0;
         totalStar += q.starUsage || 0;
         totalQuality += q.answerQualityScore || 0;
         answeredCount++;
      }
    });

    const confidenceScore = answeredCount > 0 ? Math.round(totalConf / answeredCount) : 0;
    const contentScore = answeredCount > 0 ? Math.round(totalQuality / answeredCount) : 0;
    const starScore = answeredCount > 0 ? Math.round(totalStar / answeredCount) : 0;

    const distractions = data.distractionCount || 0;
    const faceLosses = data.faceLossCount || 0;
    
    const focusScore = Math.max(0, 100 - (distractions * 34)); 
    const behaviorScore = Math.max(0, 100 - (faceLosses * 34)); 

    setMetrics({
      overall: data.overallScore || 0,
      content: contentScore,
      confidence: confidenceScore,
      behavior: behaviorScore,
      focus: focusScore,
      starUsage: starScore,
      totalFillers: totalFillers,
      distractions: distractions
    });
  };

  if (!report || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 min-h-[calc(100vh-4rem)]">
         <AlertTriangle className="w-12 h-12 mb-4 text-orange-400" />
         <h2 className="text-xl font-bold">No Interview Data Found</h2>
         <p className="mb-6">It looks like you haven't completed an interview session yet.</p>
         <button onClick={() => navigate('/mock-interview')} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Go to Simulator</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-500" /> Executive Summary
            </h1>
            <p className="text-slate-500 mt-2">Role: {report.role} | Analyzed on {new Date(report.date).toLocaleDateString()}</p>
         </div>
         <div className="text-right">
            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{metrics.overall}<span className="text-xl text-slate-400">/100</span></p>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Overall Score</p>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Answer Quality', value: metrics.content + '%', icon: CheckCircle, color: 'text-green-500' },
          { label: 'Confidence & Pace', value: metrics.confidence + '%', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'STAR Methodology', value: metrics.starUsage + '%', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Focus Score', value: metrics.focus + '%', icon: ShieldIcon, color: 'text-teal-500' },
        ].map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <kpi.icon className={`w-6 h-6 mb-3 ${kpi.color}`} />
             <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{kpi.value}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Insights / Coach */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/20">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🤖 AI Coach Feedback</h3>
               <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <p className="font-semibold text-green-200 mb-1">Overall Strengths</p>
                    <p className="text-sm">
                      {metrics.content > 70 ? "Consistently detailed and comprehensive answers. " : ""}
                      {metrics.confidence > 70 ? "Excellent vocal pacing and steady delivery. " : ""}
                      {metrics.starUsage > 50 ? "Solid structural formatting using the STAR method." : ""}
                      {(metrics.content <= 70 && metrics.confidence <= 70 && metrics.starUsage <= 50) ? "Consistent effort shown throughout the interview." : ""}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-black/10">
                    <p className="font-semibold text-orange-200 mb-1">Areas to Improve</p>
                    <p className="text-sm">
                      {metrics.totalFillers > 5 ? "High usage of filler words detected, try adding pauses instead. " : ""}
                      {metrics.starUsage <= 50 ? "Consider using the STAR method (Situation, Task, Action, Result) more frequently for behavioral questions." : ""}
                    </p>
                    {metrics.distractions > 0 && (
                      <p className="text-sm text-red-300 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4"/> 
                        You switched tabs {metrics.distractions} times during the interview. Avoid this to maintain a high focus score.
                      </p>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Session Configuration</h3>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><b>Difficulty:</b> {report.difficulty || 'Medium'}</li>
                <li><b>Interviewer Style:</b> <span className="capitalize">{report.personality || 'Standard'}</span></li>
                <li><b>Duration:</b> {(report.questions || []).reduce((a,b) => a + (b.duration || 0), 0)} seconds speaking</li>
              </ul>
            </div>
         </div>

         {/* Replay System */}
         <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Response Replay & Analysis</h3>
            <div className="space-y-4">
              {(report.questions || []).map((res, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
                   
                   <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Question {i + 1}</span>
                         <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${res.status === 'skipped' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {res.status}
                         </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium text-lg leading-snug">"{res.question}"</p>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-700/50">
                       <div className="w-full sm:w-1/3 bg-black relative aspect-video sm:aspect-auto flex-shrink-0 flex items-center justify-center">
                         {res.videoBlobURL ? (
                           <video src={res.videoBlobURL} controls playsInline className="w-full h-full object-cover" />
                         ) : (
                           <div className="text-slate-600 flex flex-col items-center p-4 text-center">
                             <PlayCircle className="w-8 h-8 mb-2 opacity-50"/>
                             <span className="text-xs">No video recorded</span>
                           </div>
                         )}
                         {res.duration > 0 && (
                           <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-mono flex items-center gap-1 z-10">
                              <Clock className="w-3 h-3"/> {res.duration}s
                           </div>
                         )}
                       <div className="p-5 flex-1 bg-white dark:bg-slate-800 flex flex-col">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-1">
                               <div>
                                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Transcript</h4>
                                   <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                     {res.answerTranscript ? `"${res.answerTranscript}"` : "[No vocal response detected]"}
                                   </p>
                               </div>
                               <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                   <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                       <ShieldIcon className="w-3 h-3" /> Ideal AI Answer
                                   </h4>
                                   <p className="text-sm text-slate-700 dark:text-slate-300">
                                     {res.idealAnswer || "An ideal response would directly address the core of the question using the STAR method."}
                                   </p>
                               </div>
                           </div>
                           
                           {res.status === 'answered' && (
                             <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Answer Quality</p>
                                   <p className="font-bold text-slate-700 dark:text-slate-200">{res.answerQualityScore}%</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Filler Words</p>
                                   <p className="font-bold text-slate-700 dark:text-slate-200">{res.fillerWordsCount}</p>
                                </div>
                             </div>
                           )}
                       </div>
                   </div>

                   {res.status === 'answered' && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex gap-2 flex-col sm:flex-row">
                           <div className="flex-1 bg-green-500/10 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm">
                             <p className="font-bold mb-1 text-xs uppercase tracking-wider">Strengths</p>
                             {res.strengths}
                           </div>
                           <div className="flex-1 bg-orange-500/10 text-orange-700 dark:text-orange-400 p-3 rounded-xl text-sm">
                             <p className="font-bold mb-1 text-xs uppercase tracking-wider">Weaknesses</p>
                             {res.weaknesses}
                           </div>
                        </div>
                        <div className="mt-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-xl text-sm">
                           <p className="font-bold mb-1 text-xs uppercase tracking-wider">Suggestions</p>
                           {res.suggestion}
                        </div>
                     </div>
                   )}
                   
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
