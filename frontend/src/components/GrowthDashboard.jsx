import React, { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Target, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

export default function GrowthDashboard() {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Fetch from the analytics backend endpoint
    const fetchAnalytics = async () => {
      if (!user.id) return;
      try {
        const res = await fetch(`http://localhost:8000/analytics/growth/${user.id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch(e) {
        console.error("Failed to fetch analytics");
      }
    };
    fetchAnalytics();
  }, [user.id]);

  if (!data) return <div className="h-48 flex items-center justify-center text-on-surface-variant font-medium">Loading Growth Analytics...</div>;

  // Radar logic mapping for skills (using hardcoded fallback if needed, or deriving from gaps)
  const radarData = [
    { subject: 'System Design', score: data.weak_areas.includes('System Design') ? 40 : 85, fullMark: 100 },
    { subject: 'SQL', score: data.weak_areas.includes('SQL') ? 35 : 90, fullMark: 100 },
    { subject: 'Algorithms', score: 80, fullMark: 100 },
    { subject: 'React', score: 95, fullMark: 100 },
    { subject: 'Communication', score: data.history.length > 0 ? data.history[data.history.length-1].fluency : 50, fullMark: 100 },
    { subject: 'ATS Formatting', score: data.history.length > 0 ? data.history[data.history.length-1].ats : 50, fullMark: 100 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 hover-grid">
         <div className="glass-card flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
               <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="text-3xl font-manrope font-bold text-on-surface">{data.growth_percentage.toFixed(1)}%</h4>
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Growth</p>
         </div>
         
         <div className="glass-card flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#00D4FF]/10 flex items-center justify-center mb-4">
               <Target className="w-6 h-6 text-[#00D4FF]" />
            </div>
            <h4 className="text-3xl font-manrope font-bold text-on-surface">{data.score_trend}</h4>
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Score Trend</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/5 rounded-full blur-[40px]"></div>
         </div>
         
         <div className="glass-card flex flex-col items-center justify-center p-6 text-center lg:col-span-2">
            <h3 className="font-bold text-on-surface font-manrope self-start w-full border-b border-outline-variant/20 pb-2 mb-4 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-tertiary" /> Targeted Weak Areas
            </h3>
            <div className="flex flex-wrap gap-2 w-full">
               {data.weak_areas.map((wa, i) => (
                 <span key={i} className="px-3 py-1 bg-tertiary/10 text-tertiary text-xs rounded-full border border-tertiary/20 font-bold tracking-wide">
                   {wa}
                 </span>
               ))}
               {data.weak_areas.length === 0 && <span className="text-sm text-on-surface-variant">No weak areas detected!</span>}
            </div>
         </div>
       </div>

       <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card">
            <h3 className="text-lg font-bold font-manrope text-on-surface mb-6 flex items-center gap-2">
               <Zap className="w-5 h-5 text-primary" /> Longitudinal Score Growth
            </h3>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#CC97FF" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#CC97FF" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#686F7A" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#686F7A" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1A1821', borderColor: 'rgba(204,151,255,0.2)', borderRadius: '12px' }}
                     itemStyle={{ color: '#E8E4EC' }}
                   />
                   <Area type="monotone" dataKey="score" stroke="#CC97FF" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card flex flex-col items-center">
            <h3 className="text-lg font-bold font-manrope text-on-surface flex items-center gap-2 mb-2 w-full text-center justify-center">
               <CheckCircle2 className="w-5 h-5 text-secondary" /> Skill Balance Radar
            </h3>
            <div className="h-64 w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#A09CA8', fontSize: 10 }} />
                   <Radar name="Candidate" dataKey="score" stroke="#34B5FA" fill="#34B5FA" fillOpacity={0.3} />
                   <Tooltip contentStyle={{ backgroundColor: '#1A1821', borderColor: 'rgba(52,181,250,0.2)', borderRadius: '8px' }}/>
                 </RadarChart>
               </ResponsiveContainer>
            </div>
          </div>
       </div>
    </div>
  );
}

// Ensure icon fallback for missing import
function AlertTriangle(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
