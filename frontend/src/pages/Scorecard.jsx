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

const COLORS = ['#FF6B00', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

export default function Scorecard() {
  const { profile } = useContext(UserContext);
  const [timeRange, setTimeRange] = useState('1m');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const savedActs = JSON.parse(localStorage.getItem('activities')) || [];
    setActivities(savedActs.reverse()); // Chronological order for charts
  }, []);

  // Filter activities
  const atsActivities = activities.filter(a => a.type === 'resume_upload' && a.metadata?.score);
  const interviewActivities = activities.filter(a => a.type === 'interview_complete');

  // 1. ATS Score Trend
  let atsData = atsActivities.map((act, i) => ({
      name: `Scan ${i + 1}`,
      score: act.metadata.score
  }));
  if (atsData.length === 0) atsData = [{ name: 'No Data', score: 0 }];

  // 2. Interview Performance Trend
  let interviewData = interviewActivities.map((act, i) => ({
      name: `Int ${i + 1}`,
      score: act.metadata?.score || 0,
      confidence: act.metadata?.confidence || (act.metadata?.score ? act.metadata.score - 10 : 0) // Mock confidence if missing
  }));
  if (interviewData.length === 0) interviewData = [{ name: 'No Data', score: 0, confidence: 0 }];

  // 3. Radar Chart (Skills & Behavioral)
  // We'll calculate a mock average based on the latest interview score, or default to 50
  const latestIntScore = interviewData[interviewData.length - 1].score || 50;
  const radarData = [
      { subject: 'Tech Skills', A: Math.min(100, latestIntScore + 5), fullMark: 100 },
      { subject: 'Communication', A: Math.min(100, latestIntScore + 10), fullMark: 100 },
      { subject: 'Problem Solving', A: latestIntScore, fullMark: 100 },
      { subject: 'STAR Method', A: Math.max(0, latestIntScore - 15), fullMark: 100 },
      { subject: 'Confidence', A: Math.max(0, latestIntScore - 5), fullMark: 100 },
      { subject: 'Eye Contact', A: Math.min(100, latestIntScore + 8), fullMark: 100 },
  ];

  // 4. Pie Chart (Time Spent or Activity Distribution)
  const pieData = [
      { name: 'Mock Interviews', value: interviewActivities.length || 1 },
      { name: 'Resume Scans', value: atsActivities.length || 1 },
      { name: 'Course Progress', value: 2 }, // Mock course progress
      { name: 'Profile Updates', value: activities.filter(a => a.type === 'profile_updated').length || 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
                  ? 'bg-white dark:bg-gray-700 text-[#FF6B00] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

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
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#FF6B00]/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#FF6B00]" />
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
                  cursor={{fill: 'rgba(255, 107, 0, 0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="score" name="ATS Score" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {atsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10B981' : entry.score >= 60 ? '#F59E0B' : '#FF6B00'} />
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

    </div>
  );
}
