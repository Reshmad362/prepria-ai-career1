import React from 'react';
import { Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuggestionPanel({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center">
        <Lightbulb className="w-10 h-10 text-outline-variant mb-4" />
        <h3 className="text-on-surface font-semibold mb-2">No Suggestions Yet</h3>
        <p className="text-on-surface-variant text-sm border-b border-outline-variant/10 pb-4">Take an interview or upload your resume to get career advice.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold font-manrope text-on-surface mb-6 flex items-center gap-2">
         <Lightbulb className="w-5 h-5 text-secondary" /> AI Recommendations
      </h3>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 flex items-start gap-3 group hover:bg-surface-container transition-colors">
            <div className="mt-1">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 text-sm">
              <p className="text-on-surface font-medium mb-1">{suggestion}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-outline-variant/10">
        <Link to="/career-suggestions" className="btn-secondary w-full flex justify-center items-center py-2 text-sm gap-2">
          View Detail Plan <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
