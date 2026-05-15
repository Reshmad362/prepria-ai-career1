import React from 'react';
import { Target, ArrowRight } from 'lucide-react';

export default function CareerSuggestionCard({ role }) {
  return (
    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/15 flex flex-col h-full group hover:bg-surface-container transition-all hover:shadow-[0_0_20px_rgba(204,151,255,0.15)] relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-[30px] transition-transform group-hover:scale-150"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <h4 className="text-on-surface font-bold text-lg">{role.name}</h4>
      </div>
      
      <p className="text-sm text-on-surface-variant flex-1 mb-4 relative z-10">
        {role.reason}
      </p>
      
      <div className="pt-4 border-t border-outline-variant/10 relative z-10">
        <button className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:text-secondary transition-colors">
          View Path <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
