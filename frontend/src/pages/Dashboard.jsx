import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardStatCard from '../components/DashboardStatCard';
import { Target, FileSearch, CheckCircle, TrendingUp, Sparkles, MessageSquare, Briefcase, Award, Zap, BrainCircuit, Activity, Clock, FileUp, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/activityLogger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, profileCompletion, missingFields } = useContext(UserContext);
  const [userName, setUserName] = useState('User');
  const [activities, setActivities] = useState([]);
  
  // Dashboard Metrics State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    aiCareerScore: 0,
    careerReadiness: 'Low',
    atsScore: 0,
    resumeMatch: '0%',
    technicalScore: 0,
    communicationScore: 0,
    confidenceScore: 0,
    currentStreak: 0,
    learningHours: 0,
    interviewScore: 0,
    profileCompletion: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
    targetCompany: 'Not Set',
    targetRole: 'Not Set',
    recommendedNextStep: 'Upload Resume',
    careerProgress: '0%',
    resumeUpdatedDate: 'N/A',
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    interviewReadiness: '0%',
    recentHistory: [],
    trend: 'No Data'
  });

  useEffect(() => {
    if (profile) {
      setUserName(profile.name && profile.name !== 'Not found' ? profile.name : 'User');
    }
  }, [profile]);

  useEffect(() => {
    // Fetch Activities
    const fetchActivities = () => {
      const stored = JSON.parse(localStorage.getItem('activities') || '[]');
      setActivities(stored);
    };
    fetchActivities();
    window.addEventListener('activityLogged', fetchActivities);
    
    // Fetch Dashboard Analytics
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const email = profile?.email || localStorage.getItem('userEmail');
        if (!email) {
            setLoading(false);
            return;
        }

        const response = await fetch(`http://localhost:8000/analytics/dashboard/${email}`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            setMetrics(result.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (profile?.email || localStorage.getItem('userEmail')) {
        fetchAnalytics();
    }

    return () => window.removeEventListener('activityLogged', fetchActivities);
  }, [profile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">Welcome back, {userName}! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 font-inter">Here is your executive career overview.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/resume-upload')} variant="outline" className="shadow-sm border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            Update Resume
          </Button>
          <Button onClick={() => navigate('/mock-interview')} className="bg-primary hover:bg-primaryHover text-white shadow-md shadow-primary/20 border-0">
            Start Interview
          </Button>
        </div>
      </div>

      {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => window.location.reload()} className="text-sm underline font-medium">Retry</button>
          </div>
      )}

      {/* Profile Completion Alert in Dashboard */}
      {profileCompletion < 100 && (
        <Card className="bg-primary/5 border-l-4 border-primary dark:bg-primary/10 mb-6 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 font-poppins">
              <Target className="w-5 h-5 text-primary" /> Complete Your Profile ({profileCompletion}%)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-inter">Unlock tailored opportunities and better AI insights by finishing your profile.</p>
            {missingFields?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <span className="text-xs font-semibold text-primary">Missing:</span>
                {missingFields.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-300 rounded-md shadow-sm border border-gray-200 dark:border-gray-800">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => navigate('/profile')} className="whitespace-nowrap shrink-0 bg-[#111111] text-white hover:bg-gray-800">
            Complete Now
          </Button>
        </Card>
      )}

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard 
          loading={loading}
          title="AI Career Score" 
          value={metrics.aiCareerScore} 
          icon={BrainCircuit} 
          trend={metrics.weeklyGrowth >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(metrics.weeklyGrowth)}%`}
          subtitle={`Readiness: ${metrics.careerReadiness}`}
          colorClass="text-primary bg-primary/10" 
        />
        <DashboardStatCard 
          loading={loading}
          title="ATS Score" 
          value={metrics.atsScore} 
          icon={FileSearch} 
          trend="neutral"
          trendValue="Updated"
          subtitle={`Match: ${metrics.resumeMatch}`}
          colorClass="text-blue-500 bg-blue-500/10" 
        />
        <DashboardStatCard 
          loading={loading}
          title="Interview Score" 
          value={`${metrics.interviewScore}%`} 
          icon={Target} 
          trend={metrics.monthlyGrowth >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(metrics.monthlyGrowth)}%`}
          subtitle={`Target: ${metrics.targetCompany}`}
          colorClass="text-green-500 bg-green-500/10" 
        />
        <DashboardStatCard 
          loading={loading}
          title="Communication" 
          value={`${metrics.communicationScore}%`} 
          icon={Activity} 
          trend="up"
          trendValue="Top 20%"
          subtitle="Fluency & Pacing"
          colorClass="text-purple-500 bg-purple-500/10" 
        />
      </div>

      {/* Growth Charts & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Trend Chart */}
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Longitudinal Performance</h2>
                <div className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                    Trend: <span className={metrics.trend === 'Increasing' ? 'text-green-500' : metrics.trend === 'Decreasing' ? 'text-red-500' : ''}>{metrics.trend}</span>
                </div>
            </div>
            
            {loading ? (
                <div className="h-[300px] flex items-center justify-center animate-pulse bg-gray-50 dark:bg-gray-900 rounded-xl">
                     <span className="text-gray-400 font-medium">Loading Chart Data...</span>
                </div>
            ) : metrics.recentHistory.length > 0 ? (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.recentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E97862" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#E97862" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: 'var(--card)' }}
                                itemStyle={{ fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="score" name="Overall Score" stroke="#E97862" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            <Line type="monotone" dataKey="fluency" name="Fluency" stroke="#2ECC71" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Analytics Yet</h3>
                    <p className="text-gray-500 max-w-sm mt-1 mb-4">Complete a mock interview or resume analysis to generate your longitudinal growth charts.</p>
                    <Button onClick={() => navigate('/mock-interview')} className="bg-[#111111] text-white hover:bg-gray-800">Generate Data</Button>
                </div>
            )}
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#222222] text-white border-0">
            <h2 className="text-lg font-bold mb-6 font-poppins flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Recommended Next Steps
            </h2>
            
            <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <h3 className="font-semibold text-lg text-accent">Top Priority</h3>
                    <p className="text-gray-300 text-sm mt-1 mb-3">{metrics.recommendedNextStep}</p>
                    <Button 
                        onClick={() => navigate(metrics.recommendedNextStep.includes("Resume") ? '/resume-upload' : '/mock-interview')}
                        className="w-full bg-primary hover:bg-primaryHover text-white border-0"
                    >
                        Take Action
                    </Button>
                </div>
                
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h3 className="font-medium text-sm text-gray-400 mb-2">Secondary Goals</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><Briefcase className="w-3 h-3" /></div>
                            <span className="text-sm text-gray-300">Review new Job Recommendations matching {metrics.targetRole}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5"><Award className="w-3 h-3" /></div>
                            <span className="text-sm text-gray-300">Complete missing profile achievements ({metrics.profileCompletion}%)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
      </div>

      {/* Meta Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-poppins">Engagement</h2>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 rounded-lg"><Zap className="w-4 h-4" /></div>
                          <span className="font-medium">Current Streak</span>
                      </div>
                      <span className="font-bold">{metrics.currentStreak} Days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg"><Clock className="w-4 h-4" /></div>
                          <span className="font-medium">Learning Hours</span>
                      </div>
                      <span className="font-bold">{metrics.learningHours} Hrs</span>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 rounded-lg"><Award className="w-4 h-4" /></div>
                          <span className="font-medium">Certificates</span>
                      </div>
                      <span className="font-bold">{metrics.certificatesEarned}</span>
                  </div>
              </div>
          </Card>

          <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-poppins">Recent Activity</h2>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 font-medium text-gray-500 text-center">No activity yet. Start by uploading your resume.</p>
            ) : activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-[#141414] rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${activity.status === 'success' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' : activity.status === 'warning' ? 'bg-[#FF9A3C]/10 text-[#FF9A3C]' : 'bg-blue-500/10 text-blue-500'}`}>
                  {activity.type === 'resume_upload' ? <FileUp className="w-5 h-5" /> :
                   activity.type === 'ats_analysis' ? <FileSearch className="w-5 h-5" /> :
                   activity.type === 'interview_complete' ? <CheckCircle className="w-5 h-5" /> :
                   activity.type === 'role_suggestion' ? <Target className="w-5 h-5" /> :
                   activity.type === 'login' ? <LogIn className="w-5 h-5" /> :
                   <Activity className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium tracking-wide">{formatTime(activity.timestamp)}</p>
                </div>
                {activity.metadata?.score && (
                  <div className={`ml-auto flex-shrink-0 mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-bold ${activity.status === 'warning' ? 'bg-[#FF9A3C]/10 text-[#FF9A3C]' : 'bg-[#2ECC71]/10 text-[#2ECC71]'}`}>
                    Score: {activity.metadata.score}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
