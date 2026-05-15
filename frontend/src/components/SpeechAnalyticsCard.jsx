import React, { useEffect, useState } from 'react';
import { Mic, CheckCircle2, AlertTriangle, AlertCircle, MessageSquare, PauseCircle } from 'lucide-react';

const SpeechAnalyticsCard = ({ data }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!data) return;
    
    let start = 0;
    const target = data.fluency_score || 0;
    const duration = 1000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [data]);

  if (!data) return null;

  const { filler_count, pause_count, long_pauses, fluency_score } = data;

  const getScoreColor = (score) => {
    if (score >= 80) return { bgClass: 'bg-tertiary', textClass: 'text-tertiary' };
    if (score >= 50) return { bgClass: 'bg-secondary', textClass: 'text-secondary' };
    return { bgClass: 'bg-error', textClass: 'text-error' };
  };

  const getQualityBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', bgClass: 'bg-tertiary/10', textClass: 'text-tertiary', borderClass: 'border-tertiary/20', icon: CheckCircle2 };
    if (score >= 50) return { label: 'Moderate', bgClass: 'bg-secondary/10', textClass: 'text-secondary', borderClass: 'border-secondary/20', icon: AlertCircle };
    return { label: 'Poor', bgClass: 'bg-error/10', textClass: 'text-error', borderClass: 'border-error/20', icon: AlertTriangle };
  };

  const colorClasses = getScoreColor(fluency_score);
  const badge = getQualityBadge(fluency_score);

  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="flex items-center gap-3 m-0 text-xl text-on-surface">
          <Mic className="w-6 h-6 text-primary" /> Speech Fluency
        </h3>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${badge.bgClass} ${badge.textClass} border ${badge.borderClass}`}>
          <badge.icon className="w-4 h-4" /> {badge.label}
        </span>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-3 text-sm font-medium">
          <span className="text-on-surface-variant">Overall Fluency Score</span>
          <span className={`font-bold text-xl ${colorClasses.textClass}`}>{animatedScore}%</span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${animatedScore}%`, backgroundColor: fluency_score >= 80 ? '#f472b6' : fluency_score >= 50 ? '#0ea5e9' : '#ef4444' }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 bg-surface-container/50 backdrop-blur-md p-4 rounded-xl border border-outline-variant/15 hover:bg-surface-container transition-colors">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Fillers</p>
            <p className="text-2xl font-bold text-on-surface leading-none">{filler_count}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-container/50 backdrop-blur-md p-4 rounded-xl border border-outline-variant/15 hover:bg-surface-container transition-colors">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <PauseCircle className="w-5 h-5 text-error" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Pauses</p>
            <p className="text-2xl font-bold text-on-surface leading-none">
              {pause_count} <span className="text-sm font-normal text-on-surface-variant">({long_pauses} long)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechAnalyticsCard;
