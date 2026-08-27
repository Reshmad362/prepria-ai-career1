import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { Target, Phone, User as UserIcon, ArrowRight, ShieldCheck, ChevronRight, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

export default function ProfileOnboarding() {
  const navigate = useNavigate();
  const { profile, preferences, updateProfile, updatePreferences } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    targetRole: ''
  });

  const [localProgress, setLocalProgress] = useState(0);
  const [localMissing, setLocalMissing] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize form data from context
  useEffect(() => {
    if (profile || preferences) {
      setFormData(prev => ({
        phone: prev.phone || profile?.phone || '',
        gender: prev.gender || profile?.gender || '',
        targetRole: prev.targetRole || preferences?.targetRole || profile?.targetRole || ''
      }));
    }
  }, [profile, preferences]);

  // Recalculate progress dynamically as user types
  useEffect(() => {
    const required = [
      { key: 'name', label: 'Full Name', isFilled: true }, // Assumed true from signup/login
      { key: 'phone', label: 'Phone Number', isFilled: !!formData.phone.trim() },
      { key: 'gender', label: 'Gender', isFilled: !!formData.gender && formData.gender !== 'Select Gender' && formData.gender !== '' },
      { key: 'targetRole', label: 'Target Role', isFilled: !!formData.targetRole.trim() },
      { key: 'resume', label: 'Resume Upload', isFilled: (profile?.score !== undefined) || (profile?.skills && profile.skills.length > 0) }
    ];

    let completed = 0;
    let missing = [];

    required.forEach(field => {
      if (field.isFilled) {
        completed++;
      } else {
        missing.push(field);
      }
    });

    setLocalProgress(Math.round((completed / required.length) * 100));
    setLocalMissing(missing);
  }, [formData, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const isFormValid = Boolean(
    formData.phone.trim() && 
    formData.gender && 
    formData.gender !== 'Select Gender' && 
    formData.gender !== '' && 
    formData.targetRole.trim()
  );

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;
    setIsSaving(true);
    setErrorMsg('');

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    try {
      if (token) {
        const res = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            phone: formData.phone.trim(),
            gender: formData.gender,
            targetRole: formData.targetRole.trim()
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Unable to save profile to server. Please try again.");
        }
      }

      // Save to context and user-scoped storage
      updateProfile({ phone: formData.phone.trim(), gender: formData.gender, targetRole: formData.targetRole.trim() });
      updatePreferences({ targetRole: formData.targetRole.trim() });

      logActivity({
        type: "profile_updated",
        title: "Profile Onboarding Completed",
        description: "Initial profile setup completed successfully",
        status: "success"
      });

      navigate('/dashboard');
    } catch (err) {
      console.error("Onboarding profile save error:", err);
      setErrorMsg(err.message || "Failed to save profile. Please check your connection and try again.");
      // Fallback local update
      updateProfile({ phone: formData.phone.trim(), gender: formData.gender, targetRole: formData.targetRole.trim() });
      updatePreferences({ targetRole: formData.targetRole.trim() });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    logActivity({
      type: "activity",
      title: "Onboarding Skipped",
      description: "User skipped the initial onboarding profile setup",
      status: "warning"
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] dark:bg-[#0B0B0D] text-[#111118] dark:text-white px-4 py-12 relative overflow-hidden font-manrope selection:bg-[#FF6B00] selection:text-white transition-colors duration-200">
      
      {/* Subtle Warm Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FF6B00]/[0.06] dark:bg-[#FF6B00]/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E05D00] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-manrope text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">PREPRIA</span>
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Career Intelligence</span>
          </div>
        </Link>
      </div>

      {/* Main Heading & Subtitle */}
      <div className="w-full max-w-2xl text-center mb-8 px-2 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1E8] dark:bg-orange-950/40 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE0CC] dark:border-orange-900/40 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 1 • Profile Setup</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#111118] dark:text-white tracking-tight leading-[1.18] mb-3 font-manrope">
          Complete your profile to unlock personalized roles, courses, and interviews
        </h1>
        
        <p className="text-base sm:text-lg text-[#666677] dark:text-[#9999AA] max-w-xl mx-auto leading-relaxed font-normal">
          We need a few details to tailor the PREPRIA Career Intelligence platform specifically for you.
        </p>
      </div>

      {/* Main Profile Setup Card */}
      <div className="w-full max-w-xl bg-white dark:bg-[#111214] rounded-3xl border border-[#EAEAEF] dark:border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden relative transition-all duration-200">
        
        {/* Subtle Orange Accent Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#E05D00]" />

        <div className="p-7 sm:p-10">
          
          {/* Profile Completion Header & Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#666677] dark:text-[#9999AA]">
                  Profile Completion
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                localProgress >= 100 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' 
                  : 'bg-[#FFF1E8] dark:bg-orange-950/40 text-[#FF6B00] border border-[#FFE0CC] dark:border-orange-900/40'
              }`}>
                {localProgress}% Complete
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-[#F0F0F4] dark:bg-white/[0.08] rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  localProgress >= 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-[#FF6B00] to-[#FF8533]'
                }`}
                style={{ width: `${localProgress}%` }}
              />
            </div>
            
            {/* Missing Info Notification Banner */}
            {localMissing.length > 0 && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-[#FFF9F5] dark:bg-orange-950/20 border border-[#FFE2D1] dark:border-orange-900/30 text-xs">
                <p className="font-bold text-[#8A3B00] dark:text-[#FFA873] mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  Complete these details to unlock full AI recommendations:
                </p>
                <ul className="text-[#995522] dark:text-[#CC8855] space-y-1 pl-4 list-disc font-medium">
                  {localMissing.find(m => m.key === 'targetRole') && <li>Add Target Role to unlock personalized AI mock interviews and role matches.</li>}
                  {localMissing.find(m => m.key === 'phone' || m.key === 'gender') && <li>Provide contact & demographic info for tailored placement alerts.</li>}
                  {localMissing.find(m => m.key === 'resume') && <li>Upload your resume later on Dashboard to activate ATS score analysis.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            
            {/* Target Role */}
            <div>
              <label className="block text-xs sm:text-[13px] font-bold text-[#2E2E3A] dark:text-[#E0E0EA] mb-1.5">
                Target Role <span className="text-[#FF6B00]">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  focusedField === 'targetRole' ? 'text-[#FF6B00]' : 'text-[#9999AA]'
                }`}>
                  <Target className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('targetRole')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager"
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#F8F9FB] dark:bg-[#0B0B0D] border border-[#E2E5EA] dark:border-white/[0.1] rounded-xl text-sm font-medium text-[#111118] dark:text-white placeholder-[#9999AA] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
              </div>
            </div>

            {/* Phone Number & Gender (2 Columns on Tablet/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Phone Number */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-[#2E2E3A] dark:text-[#E0E0EA] mb-1.5">
                  Phone Number <span className="text-[#FF6B00]">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'phone' ? 'text-[#FF6B00]' : 'text-[#9999AA]'
                  }`}>
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#F8F9FB] dark:bg-[#0B0B0D] border border-[#E2E5EA] dark:border-white/[0.1] rounded-xl text-sm font-medium text-[#111118] dark:text-white placeholder-[#9999AA] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-[#2E2E3A] dark:text-[#E0E0EA] mb-1.5">
                  Gender <span className="text-[#FF6B00]">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'gender' ? 'text-[#FF6B00]' : 'text-[#9999AA]'
                  }`}>
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('gender')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-11 pr-8 py-3.5 bg-[#F8F9FB] dark:bg-[#0B0B0D] border border-[#E2E5EA] dark:border-white/[0.1] rounded-xl text-sm font-medium text-[#111118] dark:text-white focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#9999AA]">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-3 border-t border-[#F0F0F4] dark:border-white/[0.08] space-y-3">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <button 
                type="button"
                onClick={handleSave} 
                disabled={!isFormValid || isSaving}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#FF6B00] hover:bg-[#E05D00] shadow-[0_3px_14px_rgba(255,107,0,0.32)] hover:shadow-[0_5px_20px_rgba(255,107,0,0.42)] transition-all flex justify-center items-center gap-2 cursor-pointer ${
                  !isFormValid || isSaving
                    ? 'opacity-50 cursor-not-allowed shadow-none hover:bg-[#FF6B00]' 
                    : 'hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={handleSkip}
                  className="text-xs sm:text-sm font-semibold text-[#666677] hover:text-[#FF6B00] dark:text-[#9999AA] dark:hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1 cursor-pointer py-1"
                >
                  <span>Skip for now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-[#9999AA] dark:text-[#666677] mt-1.5">
                  Some features will be limited until your profile is complete.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
