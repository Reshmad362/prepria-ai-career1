import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Clock, Target, CheckCircle, AlertTriangle, ShieldCheck, Award } from 'lucide-react';
import { API_URL, authenticatedFetch } from '../utils/api';

export default function ProgressTracker() {
  const [timeRange, setTimeRange] = useState('1m');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLongitudinalProfile() {
      try {
        const res = await authenticatedFetch(`${API_URL}/longitudinal/profile`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProfile(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch longitudinal profile from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLongitudinalProfile();
  }, []);

  // Map backend history to Recharts format deterministically without artificial offsets
  let performanceData = [];
  if (profile && profile.difficultyHistory && profile.difficultyHistory.length > 0) {
    performanceData = profile.difficultyHistory.map((item, idx) => ({
      date: `Session ${item.sessionIndex || idx + 1}`,
      score: item.score,
      difficulty: item.difficulty || 'medium'
    }));
  } else {
    // Fallback to local storage sessions if backend profile is loading or empty
    const activeEmail = localStorage.getItem("activeUser") || "default";
    const insightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
    const userInsights = insightsStr ? JSON.parse(insightsStr) : { pastScores: [] };
    performanceData = (userInsights.pastScores || []).map((item, idx) => ({
      date: `Session ${idx + 1}`,
      score: item.score
    }));
  }

  if (performanceData.length === 0) {
    performanceData = [{ date: 'No Data Yet', score: 0 }];
  }

  // Calculate skill assessment data from backend topicProgress
  let skillData = [];
  if (profile && profile.topicProgress && profile.topicProgress.length > 0) {
    skillData = profile.topicProgress.map(t => ({
      skill: t.topic,
      level: Math.round(t.averageScore || t.latestScore || 0)
    })).slice(0, 6);
  } else if (profile && profile.masteryStates && profile.masteryStates.length > 0) {
    skillData = profile.masteryStates.map(m => ({
      skill: m.topic,
      level: Math.round(m.averageScore || m.latestScore || 0)
    })).slice(0, 6);
  }

  const recentHistory = (profile && profile.difficultyHistory && profile.difficultyHistory.length > 0)
    ? profile.difficultyHistory.slice(-3).reverse().map(s => ({
        title: `Mock Interview (${s.difficulty || 'medium'})`,
        score: s.score,
        date: s.completedAt ? new Date(s.completedAt).toLocaleDateString() : 'Recent'
      }))
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Progress Tracker</h1>
          <p className="text-gray-500 mt-1">Visualize your interview readiness and multi-session skill progression.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['1w', '1m', '3m', 'YTD'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-card text-text shadow-sm' 
                  : 'text-gray-500 hover:text-text'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-medium">Total Sessions</span>
            <span className="text-2xl font-bold text-primary mt-1">{profile.totalInterviews || 0}</span>
          </Card>
          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-medium">Latest Score</span>
            <span className="text-2xl font-bold text-text mt-1">{profile.latestScore || 0}%</span>
          </Card>
          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-medium">Overall Trend</span>
            <span className={`text-lg font-bold mt-1 capitalize ${
              profile.trend === 'improving' ? 'text-green-600' :
              profile.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {profile.trend ? profile.trend.replace('_', ' ') : 'Insufficient Data'}
            </span>
          </Card>
          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-medium">Score Delta</span>
            <span className={`text-2xl font-bold mt-1 ${profile.scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profile.scoreDelta > 0 ? `+${profile.scoreDelta}` : profile.scoreDelta}
            </span>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <Card className="h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text">Overall Performance Trend</h2>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="score" name="Interview Score" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Breakdown Chart */}
        <Card className="h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text">Topic Assessment</h2>
          </div>
          <div className="flex-1">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb"/>
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="skill" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <Bar dataKey="level" name="Average Score %" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No topic evaluation data recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Weakness & Strength Intelligence Summary */}
      {profile && (profile.recurringWeaknesses.length > 0 || profile.resolvedWeaknesses.length > 0 || profile.strengths.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profile.recurringWeaknesses.length > 0 && (
            <Card className="p-4 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-text text-sm">Recurring Weaknesses</h3>
              </div>
              <div className="space-y-2">
                {profile.recurringWeaknesses.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    <span className="font-medium text-amber-900 dark:text-amber-200">{w.topic}</span>
                    <Badge variant="warning">{w.occurrenceCount}x</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {profile.resolvedWeaknesses.length > 0 && (
            <Card className="p-4 border-l-4 border-emerald-500">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-text text-sm">Resolved Weaknesses</h3>
              </div>
              <div className="space-y-2">
                {profile.resolvedWeaknesses.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">{w.topic}</span>
                    <Badge variant="success">{w.resolvedScore}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {profile.strengths.length > 0 && (
            <Card className="p-4 border-l-4 border-indigo-500">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-text text-sm">Consistent Strengths</h3>
              </div>
              <div className="space-y-2">
                {profile.strengths.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                    <span className="font-medium text-indigo-900 dark:text-indigo-200">{s.topic}</span>
                    <Badge variant="info">{s.latestScore}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* History log */}
      <h2 className="text-xl font-bold text-text mt-8 mb-4">Recent History</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentHistory.length > 0 ? recentHistory.map((item, i) => (
          <Card key={i} className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text">{item.title}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {item.date}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1">Score</span>
              <Badge variant={item.score > 80 ? 'success' : 'warning'}>{item.score}</Badge>
            </div>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500">
             No interview history found. Complete a mock interview to see your progress!
          </div>
        )}
      </div>
    </div>
  );
}

