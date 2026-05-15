import React from 'react';
import { Target, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InterviewScoreCard({ score }) {
  if (score === undefined || score === null) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center">
        <Video className="w-10 h-10 text-outline-variant mb-4" />
        <h3 className="text-on-surface font-semibold mb-2">No Interview Data</h3>
        <p className="text-on-surface-variant text-sm border-b border-outline-variant/10 pb-4">Start your first mock interview.</p>
        <Link to="/interview" className="mt-4 btn-primary text-xs !py-2 !px-4 hover:shadow-[0_0_15px_rgba(204,151,255,0.4)]">Start Interview</Link>
      </div>
    );
  }

  // Determine color based on score
  let color = "#E86F68"; // error
  if (score >= 8) color = "#68E888"; // green
  else if (score >= 6) color = "#F6C144"; // yellow

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-10" style={{ backgroundColor: color }}></div>
      <h3 className="text-lg font-bold font-manrope text-on-surface mb-4 flex items-center gap-2 relative z-10">
         <Target className="w-5 h-5 text-secondary" /> Latest Interview
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <h2 className="text-5xl font-manrope font-bold text-on-surface mb-1">{score}<span className="text-2xl text-on-surface-variant">/10</span></h2>
        <p className="text-sm text-on-surface-variant uppercase tracking-widest font-semibold mt-2">Overall Eval</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant/10 relative z-10 text-center">
        <Link to="/interview" className="text-xs font-semibold text-secondary hover:underline">
          Take another interview
        </Link>
      </div>
    </div>
  );
}
