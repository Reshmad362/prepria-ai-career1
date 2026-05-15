import React from 'react';
import { Target, Award, ListChecks } from 'lucide-react';

export default function ScoreCard({ report }) {
  if (!report) return null;

  return (
    <div className="glass-card mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/15 pb-4">
        <Award className="w-6 h-6 text-tertiary" />
        <h3 className="text-xl font-bold font-manrope text-on-surface m-0">Evaluation Report</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="flex-1 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Score</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-highest" />
              <circle 
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * report.score) / 100}
                className="text-tertiary transition-all duration-1000 ease-out" 
              />
            </svg>
            <span className="absolute text-2xl font-black text-on-surface">{report.score}</span>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Answer Quality</p>
          <span className="px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-lg font-bold">
            {report.quality || 'N/A'}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
        <h4 className="flex items-center gap-2 text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">
          <ListChecks className="w-4 h-4 text-secondary" /> Actionable Feedback
        </h4>
        <div className="space-y-3">
          {Array.isArray(report.feedback) ? (
            report.feedback.map((item, index) => (
              <div key={index} className="flex gap-3 text-sm text-on-surface-variant bg-surface-container p-3 rounded-lg border border-outline-variant/10">
                <Target className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>{typeof item === 'object' ? JSON.stringify(item) : item}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {typeof report.feedback === 'string' ? report.feedback : JSON.stringify(report.feedback)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
