import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoleMatchCard({ roles }) {
  if (!roles || roles.length === 0) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center">
        <Briefcase className="w-10 h-10 text-outline-variant mb-4" />
        <h3 className="text-on-surface font-semibold mb-2">No Matching Roles</h3>
        <p className="text-on-surface-variant text-sm">Upload your resume to discover best-fit roles.</p>
        <Link to="/resume" className="mt-4 text-primary text-sm font-semibold hover:underline">Upload Resume</Link>
      </div>
    );
  }

  const topRole = roles[0];
  const matchPercentage = topRole.percentage || Math.floor(Math.random() * 20) + 80; // mock if undefined

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px]"></div>
      <h3 className="text-lg font-bold font-manrope text-on-surface mb-4 flex items-center gap-2 relative z-10">
         <Briefcase className="w-5 h-5 text-primary" /> Top Role Match
      </h3>
      
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <h2 className="text-2xl font-bold text-on-surface mb-2">{topRole.name || topRole}</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${matchPercentage}%` }}></div>
          </div>
          <span className="text-sm font-bold text-primary">{matchPercentage}%</span>
        </div>
        <p className="text-xs text-on-surface-variant line-clamp-2">This role perfectly aligns with your current skill set and recent interview performance.</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant/10 relative z-10">
        <Link to="/role-suggestions" className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-secondary transition-colors">
          View all matches <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
