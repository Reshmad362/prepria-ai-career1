import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { logActivity } from '../utils/activityLogger';
import { 
  User, Mail, Briefcase, CheckCircle2, Award, Target, FileText, Activity, 
  MessageSquare, Edit3, X, Smartphone, MapPin, Files, Loader2, ArrowRight, 
  ShieldCheck, Sparkles, Lock, Camera, Check, Code, Compass
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { 
    profile, 
    preferences, 
    updatePreferences, 
    updateProfile, 
    user, 
    profileCompletion, 
    missingFields, 
    completionData 
  } = useContext(UserContext);
  
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('Career Identity');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', gender: '', state: '', city: '', pincode: '',
    targetRole: '', techStack: '', workPreference: 'Remote', careerGoals: '',
    experienceLevel: 'Fresher', learningFocus: [], preferredCompanies: '',
    picture: null
  });

  useEffect(() => {
    const savedActs = JSON.parse(localStorage.getItem('activities')) || [];
    setActivities(savedActs);
  }, []);

  const syncFormFromContext = () => {
    setEditForm({
      name: profile?.name || user?.name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      gender: profile?.gender || '',
      state: profile?.state || '',
      city: profile?.city || '',
      pincode: profile?.pincode || '',
      targetRole: preferences?.targetRole || profile?.targetRole || '',
      techStack: preferences?.techStack || '',
      workPreference: preferences?.workPreference || 'Remote',
      careerGoals: preferences?.careerGoals || '',
      experienceLevel: preferences?.experienceLevel || 'Fresher',
      learningFocus: preferences?.learningFocus || [],
      preferredCompanies: preferences?.preferredCompanies || '',
      picture: profile?.picture || user?.picture || null
    });
  };

  useEffect(() => {
    if (profile || preferences || user) {
      syncFormFromContext();
    }
  }, [profile, preferences, user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("Image size must be under 3MB.");
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setEditForm(prev => ({ ...prev, picture: dataUrl }));
      if (!isEditing) {
        updateProfile({ picture: dataUrl });
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        if (token) {
          fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ picture: dataUrl })
          }).catch(err => console.error("Photo auto-save error:", err));
        }
        setSaveMessage({ type: 'success', text: 'Profile photo updated.' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = () => {
    syncFormFromContext();
    setSaveMessage(null);
    setIsEditing(true);
    if (activeTab !== 'Career Identity') {
      setActiveTab('Career Identity');
    }
  };

  const handleCancelEdit = () => {
    syncFormFromContext();
    setSaveMessage(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    const updatedProfile = {
      ...profile,
      name: editForm.name.trim(),
      email: editForm.email,
      phone: editForm.phone.trim(),
      gender: editForm.gender,
      state: editForm.state,
      city: editForm.city.trim(),
      pincode: editForm.pincode,
      picture: editForm.picture
    };
    const updatedPrefs = {
      ...preferences,
      targetRole: editForm.targetRole.trim(),
      techStack: editForm.techStack.trim(),
      workPreference: editForm.workPreference,
      careerGoals: editForm.careerGoals.trim(),
      experienceLevel: editForm.experienceLevel,
      learningFocus: editForm.learningFocus,
      preferredCompanies: editForm.preferredCompanies
    };

    try {
      if (token) {
        const res = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editForm.name.trim(),
            phone: editForm.phone.trim(),
            gender: editForm.gender,
            city: editForm.city.trim(),
            state: editForm.state,
            pincode: editForm.pincode,
            picture: editForm.picture,
            targetRole: editForm.targetRole.trim(),
            techStack: editForm.techStack.trim(),
            careerGoals: editForm.careerGoals.trim(),
            workPreference: editForm.workPreference,
            experienceLevel: editForm.experienceLevel,
            preferredCompanies: editForm.preferredCompanies,
            learningFocus: editForm.learningFocus
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Unable to save profile changes. Please try again.');
        }
      }

      // Synchronize frontend context and persistence
      updateProfile(updatedProfile);
      updatePreferences(updatedPrefs);
      
      logActivity({ 
        type: "profile_updated", 
        title: "Profile Updated", 
        description: "Your profile details were updated", 
        status: "success" 
      });

      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      // Synchronize locally as fallback
      updateProfile(updatedProfile);
      updatePreferences(updatedPrefs);
      
      const isDemo = localStorage.getItem('isDemo') === 'true';
      if (isDemo) {
        setIsEditing(false);
        setSaveMessage({ type: 'success', text: 'Profile updated successfully (Demo Mode).' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: err.message || 'Unable to save profile changes. Please try again.' 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Real Metric Activities
  const interviewActs = activities.filter(a => a.type === 'interview_complete');
  const uploadActs = activities.filter(a => a.type === 'resume_upload');
  const totalInterviews = interviewActs.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(interviewActs.reduce((acc, a) => acc + (a.metadata?.score || 85), 0) / totalInterviews)
    : 0;

  // Icon Map for Canonical Sections
  const sectionIconMap = {
    name: User,
    email: Mail,
    phone: Smartphone,
    gender: User,
    city: MapPin,
    targetRole: Target,
    techStack: Code,
    careerGoals: Compass,
    workPreference: Briefcase,
    resume: FileText
  };

  // User Initials Fallback
  const currentName = profile?.name || user?.name || 'Candidate';
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const currentPicture = profile?.picture || user?.picture || editForm.picture;
  const tabs = ['Career Identity', 'Resume Intelligence', 'Scorecard'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* Hidden File Input for Profile Photo */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoSelect} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      {/* Top Header Row with Document Center Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your unified career intelligence identity and readiness snapshot</p>
        </div>
        <Button 
          onClick={() => navigate('/document-center')} 
          variant="outline" 
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Files className="w-4 h-4" /> Go to Document Center
        </Button>
      </div>

      {/* ==================================================
          1. PROFILE HERO / IDENTITY CARD
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden transition-all">
        {/* Subtle Ambient Background Blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/[0.04] rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Circular Profile Photo with PREPRIA Orange Ring */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-[#FF6B00]/20 border-2 border-[#FF6B00] overflow-hidden bg-gradient-to-br from-[#111111] to-[#222222] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
                {currentPicture ? (
                  <img 
                    src={currentPicture} 
                    alt={currentName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(currentName)}</span>
                )}
              </div>
              
              {/* Photo Upload Trigger Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change profile picture"
                className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF6B00] hover:bg-[#E05D00] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#111215] transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Identity Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {currentName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Verified Student
                </span>
              </div>

              <p className="text-base font-bold text-primary">
                {preferences?.targetRole || profile?.targetRole || 'Target Role Not Specified'}
              </p>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap font-medium">
                <span>{profile?.city ? `${profile.city}${profile?.state ? `, ${profile.state}` : ''}` : 'Location Not Set'}</span>
                <span>•</span>
                <span>{preferences?.techStack || 'Tech Stack Not Set'}</span>
              </p>
            </div>

          </div>

          {/* Top-Right Action Button */}
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start sm:self-center shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-900/40 self-start sm:self-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Editing Mode</span>
            </div>
          )}

        </div>

        {photoError && (
          <p className="text-xs text-red-500 font-semibold mt-3 animate-fadeIn">{photoError}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'Career Identity') setIsEditing(false);
            }}
            className={`px-4 py-2.5 whitespace-nowrap border-b-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ==================================================
          CAREER IDENTITY TAB (MAIN HUB)
      ================================================== */}
      {activeTab === 'Career Identity' && (
        <div className="space-y-6">

          {/* Notification Banner */}
          {saveMessage && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 animate-fadeIn ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{saveMessage.text}</span>
            </div>
          )}

          {/* ──────────────────────────────────────────────────
              VIEW MODE (DEFAULT STATE)
          ────────────────────────────────────────────────── */}
          {!isEditing ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ==================================================
                  2 & 3. PROFILE STRENGTH & ACTIONABLE CHECKLIST
              ================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Strength Meter (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-[#111215] p-6 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Profile Strength
                      </span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        profileCompletion >= 100 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-950/40 text-primary'
                      }`}>
                        {completionData?.status || "Building Profile"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {profileCompletion}%
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">
                        {profileCompletion >= 100 ? 'Complete & Career Ready' : `${completionData?.remaining || 0} ${completionData?.remaining === 1 ? 'item' : 'items'} left to complete`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-4">
                      <div 
                        className={`h-full transition-all duration-700 ${completionData?.barColor || 'bg-primary'}`} 
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>

                    {missingFields?.length > 0 && (
                      <div className="mb-4 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <span className="text-xs font-bold text-primary block mb-1">Missing required items:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {missingFields.map((field, idx) => (
                            <span 
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                      A complete career profile maximizes your ATS match score, unlocks role-specific mock interview simulations, and refines learning roadmaps.
                    </p>
                  </div>

                  {/* Quick CTAs */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Completed {completionData?.completed || 0} of {completionData?.total || 10} sections
                    </span>
                    {completionData?.remaining > 0 ? (
                      <button 
                        onClick={handleStartEdit}
                        className="text-primary hover:text-primary-dark font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Finish Profile <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> All Complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: What is Missing / Canonical Actionable Checklist (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111215] p-6 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Complete Your Profile
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">Canonical Checklist</span>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(completionData?.sections || []).map((item) => {
                      const IconComponent = sectionIconMap[item.id] || Sparkles;
                      return (
                        <div 
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            item.isComplete 
                              ? 'bg-gray-50/70 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800/60'
                              : 'bg-orange-50/30 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/20 hover:border-orange-300 dark:hover:border-orange-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              item.isComplete 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-orange-100 dark:bg-orange-900/30 text-primary'
                            }`}>
                              {item.isComplete ? <Check className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-bold truncate ${item.isComplete ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {item.label}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{item.desc}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {item.isComplete ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                                <Check className="w-3 h-3" /> Complete
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.actionRoute === '/resume-upload') {
                                    navigate('/resume-upload');
                                  } else {
                                    handleStartEdit();
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-white px-3 py-1 rounded-lg bg-white dark:bg-gray-800 hover:bg-primary border border-orange-200 dark:border-orange-800/40 transition-colors shadow-xs cursor-pointer"
                              >
                                <span>{item.actionText}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ==================================================
                  5. CAREER IDENTITY SECTION
              ================================================== */}
              <div className="bg-white dark:bg-[#111215] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Career Identity
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
                  >
                    Edit Information →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Target Role Card */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span>Target Role</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {preferences?.targetRole || profile?.targetRole || 'Not specified'}
                    </p>
                  </div>

                  {/* Location Card */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Location</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {profile?.city ? `${profile.city}${profile?.state ? `, ${profile.state}` : ''}` : 'Not specified'}
                    </p>
                  </div>

                  {/* Gender & Work Preference */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Gender</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {profile?.gender && profile.gender !== 'Select Gender' ? profile.gender : 'Not specified'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>Work Preference</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {preferences?.workPreference || 'Remote'}
                    </p>
                  </div>

                  {/* Tech Stack Card (Full Width) */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                      <Code className="w-3.5 h-3.5 text-primary" />
                      <span>Tech Stack &amp; Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences?.techStack ? (
                        preferences.techStack.split(',').map((skill, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[#FFF1E8] dark:bg-orange-950/40 text-primary border border-[#FFE0CC] dark:border-orange-900/30"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-gray-400">No tech stack added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Career Goals Card (Full Width) */}
                  <div className="sm:col-span-2 p-5 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      <span>Career Goals &amp; Long-term Vision</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {preferences?.careerGoals || 'Define your short and long-term aspirations so PREPRIA can generate precision role roadmaps.'}
                    </p>
                  </div>

                  {/* Contact Row */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>Email Address</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {profile?.email || user?.email || 'Not specified'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-primary" />
                      <span>Phone Number</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile?.phone || 'Not specified'}
                    </p>
                  </div>

                </div>
              </div>

              {/* ==================================================
                  6. CAREER SNAPSHOT (REAL DATA ONLY)
              ================================================== */}
              <div className="bg-white dark:bg-[#111215] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Career Snapshot
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">Activity Tracker</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* ATS Score */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center">
                    <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {profile?.score !== undefined ? `${profile.score}` : '--'}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">ATS Resume Score</div>
                  </div>

                  {/* Skills Assessed */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center">
                    <Award className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {profile?.skills?.length || 0}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Skills Extracted</div>
                  </div>

                  {/* Mock Interviews */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center">
                    <MessageSquare className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {totalInterviews}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Mock Interviews</div>
                  </div>

                  {/* Resume Scans */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center">
                    <Activity className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {uploadActs.length}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Resume Scans</div>
                  </div>

                </div>
              </div>

              {/* ==================================================
                  7. PREPRIA PERSONALIZATION NOTICE
              ================================================== */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 flex items-start gap-4">
                <div className="p-2 rounded-2xl bg-primary text-white shrink-0 shadow-md shadow-primary/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Why Profile Completion Matters
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Complete your profile to help PREPRIA personalize your career roadmap, role recommendations, learning suggestions, and interview preparation.
                  </p>
                </div>
              </div>

            </div>
          ) : (

            /* ──────────────────────────────────────────────────
                EDIT MODE (INTERACTIVE FORM)
            ────────────────────────────────────────────────── */
            <div className="bg-white dark:bg-[#111215] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-sm animate-fadeIn">
              
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Career Profile</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your personal details, target career role, and skill preferences.</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-900/40">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Editing Mode</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name <span className="text-primary">*</span>
                        </label>
                        <input 
                          type="text"
                          name="name" 
                          required
                          value={editForm.name} 
                          onChange={handleEditChange} 
                          placeholder="e.g. Reshma D"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                          <span>Email Address</span>
                          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Read-only
                          </span>
                        </label>
                        <input 
                          type="email"
                          name="email" 
                          value={editForm.email} 
                          disabled 
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 opacity-60 cursor-not-allowed" 
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone Number <span className="text-primary">*</span>
                        </label>
                        <input 
                          type="tel"
                          name="phone" 
                          required
                          value={editForm.phone} 
                          onChange={handleEditChange} 
                          placeholder="e.g. +91 6361288806"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    {/* Gender Dropdown */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Gender <span className="text-primary">*</span>
                        </label>
                        <select 
                          name="gender" 
                          value={editForm.gender} 
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Target Role */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Target Role <span className="text-primary">*</span>
                        </label>
                        <input 
                          type="text"
                          name="targetRole" 
                          required
                          value={editForm.targetRole} 
                          onChange={handleEditChange} 
                          placeholder="e.g. Full Stack Developer"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          City / Location
                        </label>
                        <input 
                          type="text"
                          name="city" 
                          value={editForm.city} 
                          onChange={handleEditChange} 
                          placeholder="e.g. Bengaluru"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    {/* Work Preference */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Work Preference
                        </label>
                        <select 
                          name="workPreference" 
                          value={editForm.workPreference} 
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none cursor-pointer"
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                        </select>
                    </div>

                    {/* Tech Stack */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Tech Stack (comma separated)
                        </label>
                        <input 
                          type="text"
                          name="techStack" 
                          value={editForm.techStack} 
                          onChange={handleEditChange} 
                          placeholder="e.g. React, Node.js, MongoDB, Express"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    {/* Career Goals */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          Career Goals &amp; Aspirations
                        </label>
                        <textarea 
                          name="careerGoals" 
                          value={editForm.careerGoals} 
                          onChange={handleEditChange} 
                          rows="3" 
                          placeholder="e.g. Become a technical lead in a high-growth product company"
                          className="w-full px-4 py-3 border rounded-xl text-sm font-medium bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Actions: Cancel & Save Changes */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit" 
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Changes</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ==================================================
          RESUME INTELLIGENCE TAB
      ================================================== */}
      {activeTab === 'Resume Intelligence' && (
        <div className="space-y-6 animate-fadeIn">
          {!profile?.skills || profile.skills.length === 0 ? (
            <Card className="text-center py-20 rounded-3xl border border-gray-200 dark:border-gray-800">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Resume Found</h3>
              <p className="text-gray-500 mb-6">Upload your resume to extract skills, experience, and receive ATS insights.</p>
              <Button onClick={() => navigate('/resume-upload')} className="bg-[#111111] text-white hover:bg-gray-800 cursor-pointer">Upload Resume</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="text-center rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Current ATS Score</h3>
                  <div className="text-5xl font-black text-primary mb-2">{profile.score || 0}</div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Based on latest analysis</p>
                  <Button onClick={() => navigate('/resume-upload')} variant="outline" className="w-full mt-6 cursor-pointer">Scan New Resume</Button>
                </Card>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary"/> Extracted Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => <Badge key={i}>{skill}</Badge>)}
                  </div>
                </Card>
                <Card className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500"/> Experience Summary</h3>
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

      {/* ==================================================
          SCORECARD TAB
      ================================================== */}
      {activeTab === 'Scorecard' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center py-8 rounded-3xl border border-gray-200 dark:border-gray-800">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-black text-gray-900 dark:text-white">{totalInterviews}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Interviews</div>
            </Card>
            <Card className="text-center py-8 rounded-3xl border border-gray-200 dark:border-gray-800">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-black text-gray-900 dark:text-white">{avgScore}%</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Avg Score</div>
            </Card>
            <Card className="text-center py-8 rounded-3xl border border-gray-200 dark:border-gray-800">
              <Activity className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-black text-gray-900 dark:text-white">{uploadActs.length}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Resume Scans</div>
            </Card>
          </div>
          
          <Card className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
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
      
    </div>
  );
}
