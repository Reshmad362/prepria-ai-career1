import React from 'react';

export default function DashboardStatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="glass-card flex items-center p-6 gap-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-[30px] opacity-20`} style={{ backgroundColor: color }}></div>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div className="relative z-10">
        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-manrope font-bold text-on-surface leading-none">{value}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}
