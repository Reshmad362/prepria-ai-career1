import React from 'react';
import { Target, TrendingUp, AlertTriangle, Briefcase, Zap, CheckCircle2 } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  const notifications = [
    { type: 'growth', message: 'Your score improved by 8% overall this week!', time: '10m ago', icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
    { type: 'alert', message: 'SQL & Query Optimization remains a weak area', time: '1h ago', icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
    { type: 'achievement', message: 'ATS Formatting Score increased to 84', time: '2h ago', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
    { type: 'system', message: 'New Full Stack Developer roles matched', time: '1d ago', icon: Briefcase, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10' }
  ];

  return (
    <div className="absolute top-16 right-0 w-80 glass-card !p-0 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/50 rounded-t-2xl">
        <h3 className="font-bold text-on-surface font-manrope">Notifications</h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-primary/20 text-primary rounded-full">4 New</span>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notif, idx) => {
          const Icon = notif.icon;
          return (
            <div key={idx} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer flex gap-3 last:border-b-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg}`}>
                <Icon className={`w-5 h-5 ${notif.color}`} />
              </div>
              <div>
                <p className="text-sm text-on-surface font-medium leading-snug">{notif.message}</p>
                <p className="text-xs text-on-surface-variant mt-1">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 text-center border-t border-outline-variant/15 bg-surface-container-lowest/50 rounded-b-2xl">
        <button onClick={onClose} className="text-xs font-bold text-secondary hover:text-primary transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
}
