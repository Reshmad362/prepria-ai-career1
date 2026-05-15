import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Target, Phone, User as UserIcon, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
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

  // Initialize form data from context
  useEffect(() => {
    if (profile || preferences) {
      setFormData(prev => ({
        phone: profile?.phone || '',
        gender: profile?.gender || '',
        targetRole: preferences?.targetRole || ''
      }));
    }
  }, [profile, preferences]);

  // Recalculate progress dynamically as user types
  useEffect(() => {
    const required = [
      { key: 'name', label: 'Full Name', isFilled: true }, // Assumed true from signup/login
      { key: 'phone', label: 'Phone Number', isFilled: !!formData.phone.trim() },
      { key: 'gender', label: 'Gender', isFilled: !!formData.gender && formData.gender !== 'Select Gender' },
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
  };

  const isFormValid = formData.phone.trim() && formData.gender && formData.gender !== 'Select Gender' && formData.targetRole.trim();

  const handleSave = () => {
    // Save to context
    updateProfile({ ...profile, phone: formData.phone, gender: formData.gender });
    updatePreferences({ ...preferences, targetRole: formData.targetRole });
    
    logActivity({
      type: "profile_updated",
      title: "Profile Onboarding Completed",
      description: "Initial profile setup completed successfully",
      status: "success"
    });

    navigate('/dashboard');
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

  const getProgressColor = (val) => {
    if (val < 50) return "bg-yellow-500";
    if (val <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-2xl text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Complete your profile to unlock personalized roles, courses, and interviews
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          We need a few details to tailor the AI Career Intelligence platform specifically for you.
        </p>
      </div>

      <Card className="w-full max-w-xl p-8 shadow-2xl border-t-4 border-t-indigo-500 animate-in zoom-in-95 duration-500">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Profile Completion</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-md text-white shadow-sm ${getProgressColor(localProgress)}`}>
              {localProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden shadow-inner">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ease-out ${getProgressColor(localProgress)}`} 
              style={{ width: `${localProgress}%` }}
            ></div>
          </div>
          
          {localMissing.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
              <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-1">
                 Missing details limit your platform features:
              </p>
              <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 pl-4 list-disc">
                {localMissing.find(m => m.key === 'targetRole') && <li>Add Target Role to unlock AI role suggestions.</li>}
                {localMissing.find(m => m.key === 'resume') && <li>Upload Resume to unlock ATS analysis (available on Dashboard).</li>}
                {localMissing.find(m => m.key === 'phone' || m.key === 'gender') && <li>Complete basic info for better personalization.</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="targetRole"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="e.g. Backend Engineer, Data Scientist"
                value={formData.targetRole}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="gender"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-800">
            <Button 
              onClick={handleSave} 
              disabled={!isFormValid}
              className={`w-full py-3 text-lg font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}`}
            >
              Continue to Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="mt-4 text-center">
              <button 
                onClick={handleSkip}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center w-full gap-1"
              >
                Skip for now <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-gray-400 mt-1">Some features will be limited until your profile is complete.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
