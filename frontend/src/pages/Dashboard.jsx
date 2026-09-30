import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardStatCard from '../components/DashboardStatCard';
import StartInterviewModal from '../components/StartInterviewModal';
import { 
  Target, FileSearch, CheckCircle, CheckCircle2, FileCheck, TrendingUp, 
  Sparkles, MessageSquare, Briefcase, Award, Zap, BrainCircuit, Activity, 
  Clock, FileUp, LogIn, ArrowRight, Flame, BookOpen, Layers, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/activityLogger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { API_URL, getRecommendations, getLongitudinalProfile } from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, profileCompletion, missingFields, completionData } = useContext(UserContext);
  const [userName, setUserName] = useState('User');
  const [activities, setActivities] = useState([]);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [longitudinalData, setLongitudinalData] = useState(null);
  
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
    learningTimeFormatted: '0m',
    lessonsCompleted: 0,
    assessmentsPassed: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
    skillsDemonstrated: [],
    skillsDemonstratedCount: 0,
    weeklyActivity: [],
    interviewScore: 0,
    profileCompletion: 0,
    targetCompany: 'Not Set',
    targetRole: 'Not Set',
    recommendedNextStep: 'Upload Resume',
    careerProgress: '0%',
    resumeUpdatedDate: 'N/A',
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    interviewReadiness: '0%',
    recentHistory: [],
    recentActivities: [],
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
    
    // Fetch Dashboard Analytics, Recommendations, and Longitudinal Data
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const authenticatedUserId =
          profile?.email ||
          localStorage.getItem('activeUser'); // set by UserContext during login

        if (!authenticatedUserId) {
          throw new Error('Failed to load dashboard data: user not authenticated');
        }

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [dashRes, recsRes, longRes] = await Promise.allSettled([
          fetch(`${API_URL}/analytics/dashboard/${encodeURIComponent(authenticatedUserId)}`, { headers }),
          getRecommendations(),
          getLongitudinalProfile()
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
          const result = await dashRes.value.json();
          if (result?.success && result?.data) setMetrics((prev) => ({ ...prev, ...result.data }));
        }

        if (recsRes.status === 'fulfilled' && recsRes.value?.success && recsRes.value?.recommendations) {
          setRecommendations(recsRes.value.recommendations);
        }

        if (longRes.status === 'fulfilled' && longRes.value?.success && longRes.value?.data) {
          setLongitudinalData(longRes.value.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
    window.addEventListener('activityLogged', fetchAnalytics);

    return () => {
      window.removeEventListener('activityLogged', fetchActivities);
      window.removeEventListener('activityLogged', fetchAnalytics);
    };
  }, [profile]);

  // Combine backend recentActivities with local activities fallback
  const displayActivities = (metrics.recentActivities && metrics.recentActivities.length > 0)
    ? metrics.recentActivities
    : activities.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-manrope">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-sm">Here is your executive career intelligence overview.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => navigate('/resume-upload')} 
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            Update Resume
          </button>
          <button 
            onClick={() => setIsInterviewModalOpen(true)} 
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Start AI Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Profile Completion Alert in Dashboard */}
      {profileCompletion < 100 && (
        <div className="bg-white dark:bg-[#111215] border border-orange-200 dark:border-orange-900/30 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" /> Profile Completion
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30">
                {profileCompletion}% Complete
              </span>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Complete your profile to unlock tailored AI mock interviews and career readiness insights.
            </h3>

            {/* Missing Fields & Resume Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {missingFields?.length > 0 && (
                <>
                  <span className="text-xs font-bold text-gray-400">Missing:</span>
                  {missingFields.map((field, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-semibold px-2.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30"
                    >
                      {field}
                    </span>
                  ))}
                </>
              )}

              {completionData?.resumeStatus?.isAnalyzed ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Resume Analyzed</span>
                  <span className="font-bold">• ATS: {completionData.resumeStatus.score || 0}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/40">
                  <FileSearch className="w-3.5 h-3.5 text-amber-500" />
                  <span>Resume not uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            <button 
              onClick={() => navigate('/resume-upload')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              {completionData?.resumeStatus?.isAnalyzed ? 'View Resume Analysis' : 'Upload Resume'}
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Longitudinal Performance</h2>
            <div className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              Trend: <span className={(longitudinalData?.trend === 'improving' || metrics.trend === 'Increasing') ? 'text-green-500' : (longitudinalData?.trend === 'declining' || metrics.trend === 'Decreasing') ? 'text-red-500' : ''}>
                {longitudinalData?.trend ? (longitudinalData.trend === 'improving' ? 'Improving' : longitudinalData.trend === 'declining' ? 'Declining' : longitudinalData.trend === 'steady' ? 'Steady' : 'Insufficient Evidence') : metrics.trend}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center animate-pulse bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span className="text-gray-400 font-bold text-xs">Loading Chart Data...</span>
            </div>
          ) : metrics.recentHistory.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.recentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: 'var(--card)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="score" name="Overall Score" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  <Line type="monotone" dataKey="fluency" name="Fluency" stroke="#2ECC71" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-extrabold text-gray-700 dark:text-gray-300">No Longitudinal Analytics Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">Complete an AI mock interview or curriculum lesson to generate longitudinal performance trends.</p>
              <Button onClick={() => navigate('/mock-interview')} className="bg-primary hover:bg-primaryHover text-white">Start First Interview</Button>
            </div>
          )}
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#1E2028] text-white border-0">
          <h2 className="text-base font-extrabold mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Career Recommendation
          </h2>
          
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              <>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    Top Priority • {recommendations[0].priority?.toUpperCase()}
                  </span>
                  <h4 className="text-white text-xs font-bold mt-1">{recommendations[0].title}</h4>
                  <p className="text-gray-200 text-xs mt-1 mb-3 font-medium leading-relaxed">{recommendations[0].description}</p>
                  <Button 
                    onClick={() => {
                      const top = recommendations[0];
                      if (top.type === 'resume') navigate('/resume-upload');
                      else if (top.type === 'learning') navigate(top.relatedCourseId ? `/course/${top.relatedCourseId}` : '/my-courses');
                      else if (top.type === 'interview') navigate('/mock-interview');
                      else navigate('/career-roadmap');
                    }}
                    className="w-full bg-primary hover:bg-primaryHover text-white border-0 text-xs font-bold"
                  >
                    Take Action
                  </Button>
                </div>
                
                {recommendations.slice(1, 3).length > 0 && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Personalized Guidance</span>
                    <ul className="space-y-2 text-xs">
                      {recommendations.slice(1, 3).map((r, idx) => (
                        <li key={r.recommendationId || idx} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            {r.type === 'learning' ? <BookOpen className="w-3 h-3" /> : r.type === 'interview' ? <Target className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                          </div>
                          <span className="text-gray-300 font-medium">{r.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">Top Priority</span>
                  <p className="text-gray-200 text-xs mt-1 mb-3 font-semibold leading-relaxed">{metrics.recommendedNextStep}</p>
                  <Button 
                    onClick={() => navigate(metrics.recommendedNextStep.includes("Resume") ? '/resume-upload' : '/my-courses')}
                    className="w-full bg-primary hover:bg-primaryHover text-white border-0 text-xs font-bold"
                  >
                    Take Action
                  </Button>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Secondary Goals</span>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><Briefcase className="w-3 h-3" /></div>
                      <span className="text-gray-300">Review jobs matching {metrics.targetRole}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5"><Award className="w-3 h-3" /></div>
                      <span className="text-gray-300">Earn {metrics.targetRole} course certificate</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ==================================================
          CENTRALIZED LEARNING MOMENTUM & RECENT ACTIVITY
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1 & 2: Learning Momentum (2 Cols) */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
                <Flame className="w-4 h-4 fill-primary" />
                <span>Learning Momentum</span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                Weekly Engagement &amp; Skill Progression
              </h3>
            </div>

            <button 
              onClick={() => navigate('/my-courses')}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Explore Learning Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Momentum Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">Current Streak</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.currentStreak} Days 🔥
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Consecutive active days</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Learning Time</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.learningTimeFormatted || `${metrics.learningHours}h`}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                {metrics.weeklyGrowth > 0 ? `↑ ${metrics.weeklyGrowth}% this week` : 'Active tracking'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Lessons Completed</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.lessonsCompleted} Lessons
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Across guided courses</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Assessments</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.assessmentsPassed} Passed
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Checkpoint quizzes</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Certificates</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.certificatesEarned} Earned
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">300 DPI Verifiable</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Skills Demonstrated</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                {metrics.skillsDemonstratedCount || metrics.skillsDemonstrated?.length || 0} Skills
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Via practical tasks</span>
            </div>
          </div>

          {/* Weekly Heatmap Activity Row */}
          <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-gray-400 text-[10px]">
                This Week Activity Heatmap
              </span>
              <span className="text-gray-500 font-bold">
                {metrics.learningTimeFormatted || '0m'} active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {(metrics.weeklyActivity && metrics.weeklyActivity.length === 7 
                ? metrics.weeklyActivity 
                : [
                    { dayName: 'Mon', active: false, minutes: 0 },
                    { dayName: 'Tue', active: false, minutes: 0 },
                    { dayName: 'Wed', active: false, minutes: 0 },
                    { dayName: 'Thu', active: false, minutes: 0 },
                    { dayName: 'Fri', active: false, minutes: 0 },
                    { dayName: 'Sat', active: false, minutes: 0 },
                    { dayName: 'Sun', active: false, minutes: 0 }
                  ]
              ).map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400">{day.dayName}</span>
                  <div 
                    title={`${day.dayName}: ${day.minutes || 0} mins (${day.lessons || 0} lessons)`}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      day.active || day.minutes > 0
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : day.isToday
                        ? 'border-2 border-primary text-primary'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {day.active || day.minutes > 0 ? <Check className="w-3.5 h-3.5" /> : '•'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Card 3: Meaningful Recent Activity (1 Col) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Recent Activity</h2>
            <span className="text-[11px] font-bold text-gray-400">Live Stream</span>
          </div>

          <div className="space-y-3">
            {displayActivities.length > 0 ? (
              displayActivities.map((act, index) => (
                <div key={act.id || index} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary shrink-0 mt-0.5">
                    {act.activity_type === 'CERTIFICATE_EARNED' ? (
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                    ) : act.activity_type === 'LESSON_COMPLETED' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    ) : act.activity_type === 'interview_complete' ? (
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                      {act.title || act.type}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                      {act.timestamp ? formatTime(new Date(act.timestamp).getTime()) : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 space-y-2">
                <Activity className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium">No learning activity recorded yet.</p>
                <button 
                  onClick={() => navigate('/my-courses')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Start your first lesson →
                </button>
              </div>
            )}
          </div>
        </Card>

      </div>

      <StartInterviewModal 
        isOpen={isInterviewModalOpen} 
        onClose={() => setIsInterviewModalOpen(false)} 
      />
    </div>
  );
}
