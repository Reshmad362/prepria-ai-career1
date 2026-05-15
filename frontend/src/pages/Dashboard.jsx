import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Target, FileText, CheckCircle, TrendingUp, Clock, FileUp, Sparkles, MessageSquare, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/activityLogger';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, profileCompletion, missingFields } = useContext(UserContext);
  const [userName, setUserName] = useState('User');
  const [activities, setActivities] = useState([]);
  
  // Real data state
  const [atsScore, setAtsScore] = useState(0);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [profileMatch, setProfileMatch] = useState('N/A');

  useEffect(() => {
    if (profile) {
      setUserName(profile.name && profile.name !== 'Not found' ? profile.name : 'User');
      const extractedScore = profile.score || 0;
      setAtsScore(extractedScore);
      
      if (extractedScore > 80) setProfileMatch('Excellent');
      else if (extractedScore > 60) setProfileMatch('Good');
      else if (extractedScore > 0) setProfileMatch('Needs Work');
      else setProfileMatch('Upload Resume');
    } else {
      setUserName('User');
      setAtsScore(0);
      setProfileMatch('Upload Resume');
    }
  }, [profile]);

  useEffect(() => {
    // Fetch Interview Sessions
    const sessions = JSON.parse(localStorage.getItem('mockInterviewSessions')) || [];
    setTotalInterviews(sessions.length);
    
    if (sessions.length > 0) {
       const totalScore = sessions.reduce((sum, session) => sum + session.avgScore, 0);
       setAvgConfidence(Math.round(totalScore / sessions.length));
    } else {
       setAvgConfidence(0);
    }
    
    const fetchActivities = () => {
      const stored = JSON.parse(localStorage.getItem('activities') || '[]');
      setActivities(stored);
    };
    
    fetchActivities();
    window.addEventListener('activityLogged', fetchActivities);
    return () => window.removeEventListener('activityLogged', fetchActivities);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back, {userName}! 👋</h1>
          <p className="text-gray-500 font-medium mt-1">Here is a summary of your career progress.</p>
        </div>
        <Button onClick={() => navigate('/resume-upload')} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-105 shadow-md">Upload Resume</Button>
      </div>

      {/* Profile Completion Alert in Dashboard */}
      {profileCompletion < 100 && (
        <Card className="bg-indigo-50 border-l-4 border-indigo-500 dark:bg-indigo-900/10 mb-6 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Complete Your Profile ({profileCompletion}%)
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Unlock tailored opportunities and better AI insights by finishing your profile.</p>
            {missingFields?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <span className="text-xs font-semibold text-indigo-500">Missing:</span>
                {missingFields.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-800">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => navigate('/profile')} variant="primary" className="whitespace-nowrap shrink-0">
            Complete Now
          </Button>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-500">ATS Score</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text">{atsScore}</span>
            <span className="text-sm font-medium text-gray-400">/100</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-500">Mock Interviews</h3>
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text">{totalInterviews}</span>
            <span className="text-sm text-gray-400">Total</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-500">Avg. Confidence</h3>
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text">{avgConfidence}%</span>
            <span className="text-sm font-medium text-gray-400">Score</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-500">Profile Match</h3>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${profileMatch === 'Excellent' ? 'text-green-500' : profileMatch === 'Good' ? 'text-blue-500' : 'text-orange-500'}`}>
              {profileMatch}
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <h2 className="text-lg font-bold text-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => navigate('/mock-interview')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all gap-3">
              <MessageSquareIcon className="w-8 h-8 text-indigo-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Start Mock Interview</span>
            </button>
            <button onClick={() => navigate('/role-suggestions')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all gap-3">
              <BriefcaseIcon className="w-8 h-8 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Find Roles</span>
            </button>
            <button onClick={() => navigate('/contact')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all gap-3">
              <MailIcon className="w-8 h-8 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Contact Support</span>
            </button>
            <button onClick={() => navigate('/why-us')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all gap-3">
              <StarIcon className="w-8 h-8 text-orange-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Why Us</span>
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-text mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm border border-dashed border-border rounded-lg p-6 font-medium text-gray-500 text-center">No activity yet. Start by uploading your resume.</p>
            ) : activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-border">
                <div className={`p-2 rounded-full flex-shrink-0 ${activity.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : activity.status === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                  {activity.type === 'resume_upload' ? <FileUp className="w-4 h-4" /> :
                   activity.type === 'ats_analysis' ? <Sparkles className="w-4 h-4" /> :
                   activity.type === 'interview_complete' ? <CheckCircle className="w-4 h-4" /> :
                   activity.type === 'role_suggestion' ? <Target className="w-4 h-4" /> :
                   activity.type === 'login' ? <LogIn className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
                {activity.metadata?.score && (
                  <Badge variant={activity.status === 'warning' ? 'warning' : 'success'} className="ml-auto flex-shrink-0 mt-2 sm:mt-0">Score: {activity.metadata.score}</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Inline icons for quick actions to avoid extra imports above
function MessageSquareIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function BriefcaseIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
function MailIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function StarIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
