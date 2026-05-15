import React from 'react';
import { Target, Zap, LayoutDashboard, MessageSquare } from 'lucide-react';

export default function ProfileStats({ stats }) {
  const defaultStats = {
    interviews_taken: stats?.interviews_taken || 0,
    best_score: stats?.best_score || 0,
    ats_score: stats?.ats_score || 0,
    role_matches: stats?.role_matches || 0
  };

  const statItems = [
    { title: "Mock Interviews", value: defaultStats.interviews_taken, icon: MessageSquare, color: "text-[#34B5FA]", bg: "bg-[#34B5FA]/10", border: "border-[#34B5FA]/20" },
    { title: "Best Interview Score", value: `${defaultStats.best_score}%`, icon: Zap, color: "text-[#CC97FF]", bg: "bg-[#CC97FF]/10", border: "border-[#CC97FF]/20" },
    { title: "ATS Match Average", value: `${defaultStats.ats_score}%`, icon: Target, color: "text-[#68E888]", bg: "bg-[#68E888]/10", border: "border-[#68E888]/20" },
    { title: "Target Role Matches", value: defaultStats.role_matches, icon: LayoutDashboard, color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10", border: "border-[#00D4FF]/20" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className={`glass-card !p-5 ${item.border} hover:bg-surface-container/50 transition-colors flex flex-col items-center justify-center text-center group`}>
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <h4 className="text-2xl font-bold text-on-surface mb-1">{item.value}</h4>
            <p className="text-xs text-on-surface-variant font-medium">{item.title}</p>
          </div>
        );
      })}
    </div>
  );
}
