import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ATSScoreCard({ score }) {
  if (score === undefined || score === null) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center">
        <FileText className="w-10 h-10 text-outline-variant mb-4" />
        <h3 className="text-on-surface font-semibold mb-2">No ATS Score</h3>
        <p className="text-on-surface-variant text-sm">Upload your resume to calculate your ATS match.</p>
        <Link to="/resume" className="mt-4 btn-secondary text-xs !py-2 !px-4">Upload Resume</Link>
      </div>
    );
  }

  // Determine color based on score
  let color = "#E86F68"; // error
  if (score >= 80) color = "#68E888"; // green
  else if (score >= 60) color = "#F6C144"; // yellow

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-10" style={{ backgroundColor: color }}></div>
      <h3 className="text-lg font-bold font-manrope text-on-surface mb-4 flex items-center gap-2 relative z-10">
         <FileText className="w-5 h-5 text-tertiary" /> Resume ATS Score
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-32 h-32">
           <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
             <path
               d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               fill="none"
               stroke="rgba(255,255,255,0.05)"
               strokeWidth="3"
             />
             <path
               d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               fill="none"
               stroke={color}
               strokeWidth="3"
               strokeDasharray={`${score}, 100`}
               className="drop-shadow-lg"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-3xl font-manrope font-bold text-on-surface leading-none">{score}</span>
             <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-1">Score</span>
           </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant/10 relative z-10 text-center">
        <Link to="/resume" className="text-xs font-semibold text-tertiary hover:opacity-80 transition-opacity">
          Improve your resume
        </Link>
      </div>
    </div>
  );
}
