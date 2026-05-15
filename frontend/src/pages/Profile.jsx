import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { logActivity } from '../utils/activityLogger';
import { 
  User, Mail, GraduationCap, Briefcase, CheckCircle2, TrendingUp, AlertTriangle, 
  Settings, Award, Target, FileText, ChevronDown, ChevronUp, Clock, Activity, MessageSquare, Edit3, X, Smartphone, MapPin
} from 'lucide-react';

export default function Profile() {
  const { profile, scoreHistory, preferences, updatePreferences, updateProfile, profileCompletion, missingFields } = useContext(UserContext);
  const [activities, setActivities] = useState([]);
  const [showATS, setShowATS] = useState(false);
  const [prefForm, setPrefForm] = useState(preferences);

  // New State for Editor and Verification
  const [showEdit, setShowEdit] = useState(false);
  const [emailVerified, setEmailVerified] = useState(localStorage.getItem('emailVerified') === 'true');
  const [phoneVerified, setPhoneVerified] = useState(localStorage.getItem('phoneVerified') === 'true');

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    state: '',
    city: '',
    pincode: '',
    targetRole: '',
    techStack: '',
    workPreference: 'Remote',
    careerGoals: '',
    experienceLevel: 'Fresher',
    learningFocus: [],
    preferredCompanies: ''
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

  const handlePrefChangeNative = (e) => {
    setPrefForm({ ...prefForm, [e.target.name]: e.target.value });
  };

  const savePreferencesNative = (e) => {
    e.preventDefault();
    updatePreferences(prefForm);
  };

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

  const verifyEmail = () => {
    setEmailVerified(true);
    localStorage.setItem("emailVerified", "true");
  };

  const verifyPhone = () => {
    setPhoneVerified(true);
    localStorage.setItem("phoneVerified", "true");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      gender: editForm.gender,
      state: editForm.state,
      city: editForm.city,
      pincode: editForm.pincode,
    };
    
    const updatedPrefs = {
      ...preferences,
      targetRole: editForm.targetRole,
      techStack: editForm.techStack,
      workPreference: editForm.workPreference,
      careerGoals: editForm.careerGoals,
      experienceLevel: editForm.experienceLevel,
      learningFocus: editForm.learningFocus,
      preferredCompanies: editForm.preferredCompanies
    };

    // UserContext manages the persistence now.
    updateProfile(updatedProfile);
    updatePreferences(updatedPrefs);

    logActivity({
      type: "profile_updated",
      title: "Profile Updated",
      description: "Your profile details were updated",
      status: "success"
    });

    setShowEdit(false);
  };

  const inferExperienceLevel = (experience) => {
    if (!experience || experience === "Not found") return "Entry Level";
    const str = typeof experience === 'string' ? experience : JSON.stringify(experience);
    const yearsMatch = str.match(/(\d+)\+?\s*years?/i);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      if (years > 7) return "Senior";
      if (years > 3) return "Mid-Level";
    }
    return "Entry Level";
  };

  // Activity derived stats
  const interviewActs = activities.filter(a => a.type === 'interview_complete');
  const atsActs = activities.filter(a => a.type === 'ats_analysis');
  const uploadActs = activities.filter(a => a.type === 'resume_upload');
  
  const totalInterviews = interviewActs.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(interviewActs.reduce((acc, a) => acc + (a.metadata?.score || 85), 0) / totalInterviews)
    : 0;
  const lastInterviewDate = totalInterviews > 0 
    ? new Date(Math.max(...interviewActs.map(a => a.timestamp))).toLocaleDateString()
    : 'None';

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
           <FileText className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold dark:text-white">Your AI Career Hub is Empty</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Upload a resume to automatically generate your personalized career intelligence dashboard, track your progress, and get AI insights.</p>
        <Link to="/resume-upload">
          <Button className="mt-4 shadow-lg hover:shadow-xl transition-all">Upload Resume</Button>
        </Link>
      </div>
    );
  }

  const expLevel = inferExperienceLevel(profile.experience);

  const getProgressColor = (val) => {
    if (val < 50) return "bg-yellow-500";
    if (val <= 80) return "bg-blue-500";
    return "bg-green-500";
  };
  const learningOptions = ['DSA', 'System Design', 'Backend', 'Frontend', 'AI/ML'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Career Intelligence Hub</h1>
          <p className="text-gray-500 mt-1">Your dynamic profile and performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowEdit(!showEdit)} className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
          <Link to="/resume-upload">
            <Button variant="secondary" className="border-indigo-200 shadow-sm">Update Resume</Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Widget */}
      <Card className="p-5 border-l-4 border-indigo-500 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-md font-bold text-gray-900 dark:text-white">Profile Completion</h3>
          </div>
          <span className={`text-xs font-bold px-2 py-1 border rounded-md uppercase tracking-wide text-indigo-600 bg-indigo-100 border-indigo-200`}>
            <span>{profileCompletion}%</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-1 overflow-hidden">
          <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(profileCompletion)}`} style={{ width: `${profileCompletion}%` }}></div>
        </div>
        {profileCompletion < 100 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Complete your profile to unlock hyper-personalized AI insights and role matching.</p>
            {missingFields?.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-gray-500">Missing:</span>
                {missingFields.map((field, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md font-medium border border-red-100 dark:border-red-900/30">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* EXPANDABLE EDITOR */}
      {showEdit && (
        <Card className="animate-in slide-in-from-top-4 fade-in duration-300 border-2 border-indigo-100 dark:border-indigo-900/50 relative">
          <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Edit Full Profile
            </h2>
          </div>
          
          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Verification System */}
            <div className="grid md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${emailVerified ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{editForm.email || 'No email provided'}</p>
                      <p className="text-xs text-gray-500">Email Verification</p>
                    </div>
                 </div>
                 {emailVerified ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Verified</span>
                 ) : (
                    <Button type="button" variant="secondary" onClick={verifyEmail} className="text-xs py-1.5">Verify Email</Button>
                 )}
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Smartphone className={`w-5 h-5 ${phoneVerified ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{editForm.phone || 'No phone provided'}</p>
                      <p className="text-xs text-gray-500">Phone Verification</p>
                    </div>
                 </div>
                 {phoneVerified ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Verified</span>
                 ) : (
                    <Button type="button" variant="secondary" onClick={verifyPhone} className="text-xs py-1.5">Verify Phone</Button>
                 )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Basic Info</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input required name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email {!emailVerified && '*'}</label>
                  <input required={!emailVerified} disabled={emailVerified} name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                  <input required name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location Info</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                  <input name="state" value={editForm.state} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode</label>
                  <input name="pincode" value={editForm.pincode} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
              </div>

              {/* AI Learning Fields */}
              <div className="md:col-span-2 space-y-4 mt-2">
                <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2"><Target className="w-4 h-4"/> AI Learning Fields</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Role *</label>
                    <input required name="targetRole" value={editForm.targetRole} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="e.g. Backend Engineer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tech Stack</label>
                    <input name="techStack" value={editForm.techStack} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="e.g. React, Node.js" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Experience Level</label>
                    <select name="experienceLevel" value={editForm.experienceLevel} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <option>Fresher</option>
                      <option>Junior</option>
                      <option>Mid-Level</option>
                      <option>Senior</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Work Preference</label>
                    <select name="workPreference" value={editForm.workPreference} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred Companies</label>
                    <input name="preferredCompanies" value={editForm.preferredCompanies} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="e.g. Google, Stripe" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Career Goals</label>
                  <textarea name="careerGoals" value={editForm.careerGoals} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white h-20 resize-none" placeholder="e.g. Become a Senior Architect mastering high scale distributed systems..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Learning Focus</label>
                  <div className="flex flex-wrap gap-2">
                    {learningOptions.map(opt => {
                      const isSelected = editForm.learningFocus.includes(opt);
                      return (
                        <button key={opt} type="button" value={opt} onClick={handleLearningFocusChange}
                          className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${isSelected ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300'}`}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
               <Button type="submit" className="px-8">Save Profile Elements</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PROFILE OVERVIEW */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <Target className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-2xl shadow-inner relative">
                  {profile.name && profile.name !== "Not found" ? profile.name.charAt(0) : "U"}
                  {emailVerified && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-indigo-600 rounded-full"></div>}
                </div>
                <div>
                  <h2 className="font-bold text-xl">{profile.name !== "Not found" ? profile.name : "Unknown User"}</h2>
                  <div className="flex items-center gap-2 text-sm text-indigo-100 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email !== "Not found" ? profile.email : "No email linked"}
                  </div>
                  {phoneVerified && profile.phone && (
                    <div className="flex items-center gap-2 text-sm text-green-300 mt-0.5">
                      <Smartphone className="w-3h.5 h-3.5" />
                      {profile.phone}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                <div>
                  <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Target Level</p>
                  <p className="font-bold mt-0.5">{expLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Skills Logged</p>
                  <p className="font-bold mt-0.5">{profile.skills ? profile.skills.length : 0} Verified</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ACTIVITY SUMMARY */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-text">Activity Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumes Uploaded</span>
                </div>
                <span className="font-bold text-text">{uploadActs.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interviews Done</span>
                </div>
                <span className="font-bold text-text">{totalInterviews}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ATS Scans</span>
                </div>
                <span className="font-bold text-text">{atsActs.length}</span>
              </div>
            </div>
          </Card>

          {/* PREFERENCES (Mini Card) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-text">Career Preferences</h3>
              </div>
            </div>
            <form onSubmit={savePreferencesNative} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Target Role</label>
                <input 
                  type="text" 
                  name="targetRole"
                  value={prefForm.targetRole}
                  onChange={handlePrefChangeNative}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-text focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Preferred Stack</label>
                <input 
                  type="text" 
                  name="techStack"
                  value={prefForm.techStack}
                  onChange={handlePrefChangeNative}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-text focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  placeholder="e.g. React, Node.js"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Work Type</label>
                <select 
                  name="workPreference"
                  value={prefForm.workPreference}
                  onChange={handlePrefChangeNative}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-text focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
              <Button type="submit" className="w-full py-2 text-sm mt-2">Quick Save</Button>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* INTERVIEW INSIGHTS */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-text">Interview Performance</h2>
            </div>
            
            {totalInterviews > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
                     <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{avgScore}</p>
                     <p className="text-xs font-bold text-amber-800/70 dark:text-amber-500 mt-1 uppercase">Avg Score</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-center">
                     <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalInterviews}</p>
                     <p className="text-xs font-bold text-indigo-800/70 dark:text-indigo-500 mt-1 uppercase">Sessions</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30 text-center md:col-span-2 flex flex-col justify-center items-center">
                     <Clock className="w-5 h-5 text-green-500 mb-2" />
                     <p className="text-sm font-bold text-green-800 dark:text-green-400">Last Session</p>
                     <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{lastInterviewDate}</p>
                  </div>
               </div>
            ) : (
               <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 text-sm">No interviews completed yet.</p>
                  <Link to="/mock-interview">
                    <Button variant="secondary" className="mt-3 text-sm">Start Mock Interview</Button>
                  </Link>
               </div>
            )}
          </Card>

          {/* RESUME INTELLIGENCE */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold text-text">Resume Intelligence</h3>
              </div>
              {profile.score && (
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1 rounded-full font-bold text-sm">
                  <TrendingUp className="w-4 h-4" /> ATS Score: {profile.score}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                    <Badge key={i} variant="primary">{skill}</Badge>
                  )) : <span className="text-sm text-gray-500 italic">No skills extracted.</span>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Experience
                   </h4>
                   {typeof profile.experience === 'string' ? (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.experience}</p>
                   ) : (
                      <ul className="space-y-2">
                        {profile.experience?.slice(0, 2).map((exp, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-semibold text-text block">{exp.role || exp.title}</span>
                            <span className="text-gray-500">{exp.company}</span>
                          </li>
                        ))}
                      </ul>
                   )}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <GraduationCap className="w-4 h-4" /> Education
                   </h4>
                   {typeof profile.education === 'string' ? (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.education}</p>
                   ) : (
                      <ul className="space-y-2">
                        {profile.education?.map((edu, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-semibold text-text block">{edu.degree}</span>
                            <span className="text-gray-500">{edu.university || edu.institution}</span>
                          </li>
                        ))}
                      </ul>
                   )}
                </div>
              </div>
            </div>

            {/* ATS PANEL TOGGLE */}
            {profile.feedback && (
              <div className="mt-6 border border-indigo-100 dark:border-indigo-900/50 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setShowATS(!showATS)}
                  className="w-full bg-indigo-50/50 dark:bg-indigo-900/10 p-4 flex justify-between items-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> ATS Optimization Insights
                  </span>
                  {showATS ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-indigo-500" />}
                </button>
                
                <div className={`transition-all duration-300 ease-in-out origin-top ${showATS ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 bg-white dark:bg-card border-t border-indigo-50 dark:border-indigo-900/30">
                    <div className="grid md:grid-cols-2 gap-4">
                      {profile.feedback.suggestions?.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <h5 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2">Enhancement Suggestions</h5>
                          <ul className="space-y-1.5">
                            {profile.feedback.suggestions.slice(0, 3).map((sg, i) => (
                              <li key={i} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span> {sg}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {profile.feedback.weaknesses?.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                          <h5 className="font-bold text-red-800 dark:text-red-400 text-sm mb-2">Missing Keywords / Weaknesses</h5>
                          <ul className="space-y-1.5">
                            {profile.feedback.weaknesses.slice(0, 3).map((wk, i) => (
                              <li key={i} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                                <span className="text-red-500 mt-0.5">•</span> {wk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <Link to="/ats-dashboard" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">
                        Open Full ATS Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
        </div>
      </div>
    </div>
  );
}
