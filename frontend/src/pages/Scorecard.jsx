import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Target, BrainCircuit, Activity, BarChart2, Briefcase } from 'lucide-react';
import { API_URL, getLongitudinalProfile } from '../utils/api';

const COLORS = ['#E97862', '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B'];

export default function Scorecard() {
  const { profile } = useContext(UserContext);
  const [timeRange, setTimeRange] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [longitudinal, setLongitudinal] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchScorecardData = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const authKey = profile?.email || profile?.id || storedUser.email || localStorage.getItem('activeUser');

        if (!authKey) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [dashRes, growthRes, actRes, longRes] = await Promise.allSettled([
          fetch(`${API_URL}/analytics/dashboard/${encodeURIComponent(authKey)}`, { headers }),
          fetch(`${API_URL}/analytics/growth/${encodeURIComponent(authKey)}`, { headers }),
          fetch(`${API_URL}/analytics/activity/${encodeURIComponent(authKey)}`, { headers }),
          getLongitudinalProfile()
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
          const dashJson = await dashRes.value.json();
          if (dashJson.success) setAnalytics(dashJson.data);
        }

        if (growthRes.status === 'fulfilled' && growthRes.value.ok) {
          const growthJson = await growthRes.value.json();
          if (growthJson.success) setGrowth(growthJson.data);
        }

        if (actRes.status === 'fulfilled' && actRes.value.ok) {
          const actJson = await actRes.value.json();
          if (actJson.success && Array.isArray(actJson.data)) {
            setActivities(actJson.data);
          }
        }

        if (longRes.status === 'fulfilled' && longRes.value?.success && longRes.value?.data) {
          setLongitudinal(longRes.value.data);
        }
      } catch (err) {
        console.error("Scorecard fetch error:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchScorecardData();
  }, [profile]);

  // 1. Interview Performance Trend from backend history
  const historyList = growth?.history || analytics?.recentHistory || [];
  let interviewData = historyList.map((item, i) => ({
    name: item.name || `Int ${i + 1}`,
    score: item.score || 0,
    confidence: item.confidence || 0
  }));
  if (interviewData.length === 0) {
    interviewData = [{ name: 'No Data', score: 0, confidence: 0 }];
  }

  // 2. Behavioral Radar Chart - 5 Authoritative Pillars
  const dimensions = analytics?.dimensions || {
    technicalKnowledge: 0,
    problemSolving: 0,
    communication: 0,
    roleKnowledge: 0,
    confidence: 0
  };

  const radarData = [
    { subject: 'Technical Knowledge', A: dimensions.technicalKnowledge || 0, fullMark: 100 },
    { subject: 'Problem Solving', A: dimensions.problemSolving || 0, fullMark: 100 },
    { subject: 'Communication', A: dimensions.communication || 0, fullMark: 100 },
    { subject: 'Role Knowledge', A: dimensions.roleKnowledge || 0, fullMark: 100 },
    { subject: 'Confidence', A: dimensions.confidence || 0, fullMark: 100 },
  ];

  // 3. ATS Score Progression from authentic activities
  const atsActivities = activities.filter(a => (a.activity_type === 'resume_upload' || a.activity_type === 'ATS_SCAN') && a.metadata?.score);
  let atsData = atsActivities.map((act, i) => ({
    name: `Scan ${i + 1}`,
    score: act.metadata.score
  }));
  if (atsData.length === 0 && analytics?.atsScore) {
    atsData = [{ name: 'Current Resume', score: analytics.atsScore }];
  }
  if (atsData.length === 0) {
    atsData = [{ name: 'No Data', score: 0 }];
  }

  // 4. Activity Distribution from backend metrics
  const pieData = [
    { name: 'Mock Interviews', value: analytics?.interviewCount || (historyList.length > 0 ? historyList.length : 0) },
    { name: 'Resume Scans', value: atsActivities.length || (analytics?.atsScore ? 1 : 0) },
    { name: 'Lessons Completed', value: analytics?.lessonsCompleted || 0 },
    { name: 'Assessments Passed', value: analytics?.assessmentsPassed || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">Progress Analytics</h1>
          <p className="text-gray-500 mt-1 font-inter text-sm max-w-2xl">
            A C-suite view of your longitudinal career readiness. Track your interview performance, resume ATS scores, and behavioral metrics over time.
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['1w', '1m', '3m', 'YTD'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                timeRange === range 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interview Trend (Line Chart) */}
        <Card className="h-96 flex flex-col border-0 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Interview Readiness Trend</h2>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={interviewData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Line type="monotone" dataKey="score" name="Overall Score" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="confidence" name="Confidence Metric" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Behavioral Radar (Radar Chart) */}
        <Card className="h-96 flex flex-col border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-purple-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Behavioral Analytics</h2>
            </div>
          </div>
          <div className="flex-1 -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(156, 163, 175, 0.3)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Your Profile" dataKey="A" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.3} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ATS Score Trend (Bar Chart) */}
        <Card className="h-96 flex flex-col border-0 shadow-lg relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ATS Score Progression</h2>
          </div>
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(156, 163, 175, 0.2)"/>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(233, 120, 98, 0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="score" name="ATS Score" fill="#E97862" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {atsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22C55E' : entry.score >= 60 ? '#F59E0B' : '#E97862'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Distribution (Pie Chart) */}
        <Card className="h-96 flex flex-col border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Distribution</h2>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Longitudinal Skill Intelligence & Mastery Breakdown (Phase 9) */}
      {longitudinal && (
        <Card className="border-0 shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Longitudinal Intelligence Engine
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  longitudinal.trend === 'improving' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  longitudinal.trend === 'declining' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  Trajectory: {longitudinal.trend === 'improving' ? 'Improving' : longitudinal.trend === 'declining' ? 'Declining' : longitudinal.trend === 'steady' ? 'Steady' : 'Insufficient Evidence'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                Multi-Session Mastery &amp; Weakness Evolution
              </h2>
            </div>
            {longitudinal.totalInterviews > 1 && (
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary self-start sm:self-auto">
                Delta: {longitudinal.scoreDelta >= 0 ? `+${longitudinal.scoreDelta}` : longitudinal.scoreDelta} pts ({longitudinal.totalInterviews} sessions)
              </div>
            )}
          </div>

          {longitudinal.totalInterviews === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-500 font-medium">
                No multi-session interview history recorded yet. Complete sequential mock interviews to track recurring weaknesses, intervention outcomes, and topic mastery states.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recurring / Persistent Weaknesses */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  Recurring Weaknesses ({longitudinal.recurringWeaknesses?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {longitudinal.recurringWeaknesses?.length > 0 ? (
                    longitudinal.recurringWeaknesses.map((w, i) => (
                      <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                        {w.topic} ({w.occurrenceCount}x)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">No recurring weaknesses detected</span>
                  )}
                </div>
              </div>

              {/* Resolved Weaknesses */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Resolved Weaknesses ({longitudinal.resolvedWeaknesses?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {longitudinal.resolvedWeaknesses?.length > 0 ? (
                    longitudinal.resolvedWeaknesses.map((w, i) => (
                      <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        {w.topic} ({w.resolvedScore}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">No resolved weaknesses yet</span>
                  )}
                </div>
              </div>

              {/* Consistent Strengths */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  Demonstrated Strengths ({longitudinal.strengths?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {longitudinal.strengths?.length > 0 ? (
                    longitudinal.strengths.map((s, i) => (
                      <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40">
                        {s.topic} ({s.averageScore}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">Take more rounds to identify strengths</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}

