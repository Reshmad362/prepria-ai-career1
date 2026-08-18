import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { logActivity } from '../utils/activityLogger';
import { 
  User, Mail, GraduationCap, Briefcase, CheckCircle2, TrendingUp,
  Settings, Award, Target, FileText, ChevronDown, ChevronUp, Clock, Activity, MessageSquare, Edit3, X, Smartphone, MapPin, Files
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, preferences, updatePreferences, updateProfile, profileCompletion, missingFields } = useContext(UserContext);
  const [activities, setActivities] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [showEdit, setShowEdit] = useState(false);
  
  const [emailVerified, setEmailVerified] = useState(localStorage.getItem('emailVerified') === 'true');
  const [phoneVerified, setPhoneVerified] = useState(localStorage.getItem('phoneVerified') === 'true');

  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', gender: '', state: '', city: '', pincode: '',
    targetRole: '', techStack: '', workPreference: 'Remote', careerGoals: '',
    experienceLevel: 'Fresher', learningFocus: [], preferredCompanies: ''
  });

  useEffect(() => {
    const savedActs = JSON.parse(localStorage.getItem('activities')) || [];
    setActivities(savedActs);
  }, []);

  useEffect(() => {
    if (profile || preferences) {
      setEditForm(prev => ({
        ...prev,
        name: profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        gender: profile?.gender || '',
        state: profile?.state || '',
        city: profile?.city || '',
        pincode: profile?.pincode || '',
        targetRole: preferences?.targetRole || '',
        techStack: preferences?.techStack || '',
        workPreference: preferences?.workPreference || 'Remote',
        careerGoals: preferences?.careerGoals || '',
        experienceLevel: preferences?.experienceLevel || 'Fresher',
        learningFocus: preferences?.learningFocus || [],
        preferredCompanies: preferences?.preferredCompanies || ''
      }));
    }
  }, [profile, preferences]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLearningFocusChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({
      ...prev,
      learningFocus: prev.learningFocus.includes(val) 
        ? prev.learningFocus.filter(i => i !== val)
        : [...prev.learningFocus, val]
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      name: editForm.name, email: editForm.email, phone: editForm.phone,
      gender: editForm.gender, state: editForm.state, city: editForm.city, pincode: editForm.pincode,
    };
    const updatedPrefs = {
      ...preferences,
      targetRole: editForm.targetRole, techStack: editForm.techStack,
      workPreference: editForm.workPreference, careerGoals: editForm.careerGoals,
      experienceLevel: editForm.experienceLevel, learningFocus: editForm.learningFocus,
      preferredCompanies: editForm.preferredCompanies
    };

    updateProfile(updatedProfile);
    updatePreferences(updatedPrefs);
    logActivity({ type: "profile_updated", title: "Profile Updated", description: "Your profile details were updated", status: "success" });
    setShowEdit(false);
  };

  const interviewActs = activities.filter(a => a.type === 'interview_complete');
  const uploadActs = activities.filter(a => a.type === 'resume_upload');
  const totalInterviews = interviewActs.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(interviewActs.reduce((acc, a) => acc + (a.metadata?.score || 85), 0) / totalInterviews)
    : 0;

  const getProgressColor = (val) => {
    if (val < 50) return "bg-yellow-500";
    if (val <= 80) return "bg-blue-500";
    return "bg-primary";
  };

  const tabs = ['Overview', 'Resume Intelligence', 'Scorecard', 'Settings'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="section-title text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="profile-headline mt-1">Here, you can view & edit your profile</p>
            </div>
            <Button onClick={() => navigate('/document-center')} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5">
                <Files className="w-4 h-4" /> Go to Document Center
            </Button>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
          {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`tab-item px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                  {tab}
              </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gradient-to-br from-[#111111] to-[#222222] text-white border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <User className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center p-4">
                    <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-4xl font-black mb-4">
                        {profile?.name ? profile.name.charAt(0) : "U"}
                    </div>
                    <h2 className="profile-name text-white">{profile?.name || 'Unknown User'}</h2>
                    <p className="profile-headline text-gray-300 mt-1">{preferences?.targetRole || 'Role Not Set'}</p>
                    
                    <div className="w-full mt-6 space-y-3 text-left">
                        <div className="flex items-center gap-3 body-text text-gray-300">
                            <Mail className="w-4 h-4 text-primary" /> {profile?.email || 'No email'}
                        </div>
                        <div className="flex items-center gap-3 body-text text-gray-300">
                            <Smartphone className="w-4 h-4 text-primary" /> {profile?.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-3 body-text text-gray-300">
                            <MapPin className="w-4 h-4 text-primary" /> {profile?.city ? `${profile.city}, ${profile.state}` : 'Location Not Set'}
                        </div>
                    </div>
                    
                    <Button onClick={() => setActiveTab('Settings')} className="w-full mt-6 bg-primary hover:bg-primaryHover text-white border-0">
                        Edit Profile
                    </Button>
                </div>
            </Card>
            
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="section-title text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> Profile Strength
                        </h3>
                        <span className="section-title text-primary">{profileCompletion}% Profile Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${getProgressColor(profileCompletion)}`} style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                    {missingFields?.length > 0 && (
                        <p className="text-sm text-gray-500">
                            Missing: <span className="font-medium text-gray-700 dark:text-gray-300">{missingFields.join(', ')}</span>
                        </p>
                    )}
                </Card>
                
                <Card>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Career Preferences</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Target Role</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{preferences?.targetRole || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Experience Level</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{preferences?.experienceLevel || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Work Type</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{preferences?.workPreference || '-'}</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                            {preferences?.techStack ? preferences.techStack.split(',').map((s,i) => (
                                <Badge key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{s.trim()}</Badge>
                            )) : <span className="text-sm text-gray-400">Not specified</span>}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      )}

      {/* RESUME INTELLIGENCE TAB */}
      {activeTab === 'Resume Intelligence' && (
        <div className="space-y-6">
            {!profile?.skills || profile.skills.length === 0 ? (
                <Card className="text-center py-20">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Resume Found</h3>
                    <p className="text-gray-500 mb-6">Upload your resume to extract skills, experience, and receive ATS insights.</p>
                    <Button onClick={() => navigate('/resume-upload')} className="bg-[#111111] text-white hover:bg-gray-800">Upload Resume</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="text-center">
                            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Current ATS Score</h3>
                            <div className="text-5xl font-black text-primary mb-2">{profile.score || 0}</div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Based on latest analysis</p>
                            <Button onClick={() => navigate('/resume-upload')} variant="outline" className="w-full mt-6">Scan New Resume</Button>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-blue-500"/> Extracted Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, i) => <Badge key={i}>{skill}</Badge>)}
                            </div>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500"/> Experience Summary</h3>
                            {typeof profile.experience === 'string' ? (
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{profile.experience}</p>
                            ) : (
                                <ul className="space-y-3">
                                {profile.experience?.map((exp, i) => (
                                    <li key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{exp.role || exp.title}</h4>
                                        <p className="text-sm text-gray-500">{exp.company}</p>
                                    </li>
                                ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* SCORECARD TAB */}
      {activeTab === 'Scorecard' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{totalInterviews}</div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Interviews</div>
                </Card>
                <Card className="text-center py-8">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{avgScore}%</div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Avg Score</div>
                </Card>
                <Card className="text-center py-8">
                    <Activity className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{uploadActs.length}</div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Resume Scans</div>
                </Card>
            </div>
            
            <Card>
                <h3 className="font-bold text-lg mb-4">Interview History</h3>
                {interviewActs.length > 0 ? (
                    <div className="space-y-3">
                        {interviewActs.map((act, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{act.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-xl font-black text-primary">{act.metadata?.score || '--'}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No interviews completed yet.</p>
                )}
            </Card>
        </div>
      )}

      {/* SETTINGS / EDIT TAB */}
      {activeTab === 'Settings' && (
        <Card>
            <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
            <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Full Name</label>
                        <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Email</label>
                        <input name="email" value={editForm.email} onChange={handleEditChange} disabled className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Phone</label>
                        <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Target Role</label>
                        <input name="targetRole" value={editForm.targetRole} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">City</label>
                        <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tech Stack (comma separated)</label>
                        <input name="techStack" value={editForm.techStack} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-1">Career Goals</label>
                        <textarea name="careerGoals" value={editForm.careerGoals} onChange={handleEditChange} rows="3" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-800 resize-none"></textarea>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button type="submit" className="bg-[#111111] text-white hover:bg-gray-800">Save Changes</Button>
                </div>
            </form>
        </Card>
      )}
      
    </div>
  );
}
