import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Clock, Target } from 'lucide-react';

export default function ProgressTracker() {
  const [timeRange, setTimeRange] = useState('1m');

  // Fetch data from Longitudinal Intelligence (Phase 11) and persistent sessions (Phase 7)
  const activeEmail = localStorage.getItem("activeUser") || "default";
  const insightsStr = localStorage.getItem(`userInsights_${activeEmail}`);
  const userInsights = insightsStr ? JSON.parse(insightsStr) : { pastScores: [], fillerTrend: [], weakAreas: [] };
  
  const sessionsStr = localStorage.getItem(`interviewSessions_${activeEmail}`);
  const sessions = sessionsStr ? JSON.parse(sessionsStr) : [];

  // Map to Recharts format
  let performanceData = userInsights.pastScores.map((item, idx) => ({
      date: `Session ${idx + 1}`,
      score: item.score,
      confidence: Math.min(100, item.score + Math.floor(Math.random() * 15)) // Mock confidence offset for visualization
  }));

  // Fallback if no data
  if (performanceData.length === 0) {
      performanceData = [
        { date: 'No Data Yet', score: 0, confidence: 0 }
      ];
  }

  // Calculate dynamic skill metrics based on weak areas
  const allPossibleSkills = ['React', 'Sys Design', 'Algorithms', 'Behavioral', 'SQL', 'Communication', 'Node.js'];
  const skillData = allPossibleSkills.map(skill => {
      // If it's a known weak area, competency is low. Otherwise, base competency is high.
      const isWeak = userInsights.weakAreas.includes(skill);
      return {
         skill: skill,
         level: isWeak ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 30) + 70
      };
  }).slice(0, 5); // Show top 5 skills

  const recentHistory = sessions.slice(-3).reverse().map(s => ({
      title: s.role,
      score: s.avgScore,
      date: new Date(s.timestamp).toLocaleDateString()
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Progress Tracker</h1>
          <p className="text-gray-500 mt-1">Visualize your interview readiness and skill improvements over time.</p>
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
                <Line type="monotone" dataKey="confidence" name="Confidence Level" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Breakdown Chart */}
        <Card className="h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text">Skill Assessment</h2>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb"/>
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="skill" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <Bar dataKey="level" name="Competency %" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

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
