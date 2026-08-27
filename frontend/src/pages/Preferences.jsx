import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  Save, User, Briefcase, Target, Settings, Code, MapPin, DollarSign, 
  BookOpen, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight, 
  Layers, Compass, Award, Building, Building2, Flame, HeartHandshake, 
  Video, FileText, Check, AlertCircle, HelpCircle, ChevronRight, RefreshCw, Zap
} from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

const DOMAIN_TOPICS = {
  'Technology': ['React', 'Node.js', 'Python', 'Java', 'SQL', 'System Design', 'Data Structures & Algorithms', 'Docker', 'AWS / Cloud', 'TypeScript'],
  'Human Resources': ['Talent Sourcing', 'Candidate Screening', 'HR Analytics', 'Employee Relations', 'HRMS Systems', 'POSH & Compliance', 'Onboarding Workflows', 'Performance Management'],
  'Marketing': ['SEO & Keyword Strategy', 'Content Marketing', 'Google Ads', 'Meta Ads Manager', 'GA4 Analytics', 'Brand Storytelling', 'Copywriting', 'Conversion Rate Optimization'],
  'Finance': ['3-Statement Financial Modeling', 'DCF Valuation', 'Corporate Accounting', 'Advanced Excel Formulas', 'Ratio Analysis', 'Budgeting & Forecasting', 'Trading Comps'],
  'Data & Analytics': ['Requirements Gathering', 'Advanced SQL', 'Python (Pandas)', 'Power BI / Tableau', 'BPMN Process Modeling', 'User Stories & BRD', 'A/B Testing & Statistics'],
  'Business & Sales': ['Lead Qualification', 'B2B Sales Strategy', 'Account Management', 'CRM Management', 'Cold Outreach', 'Contract Negotiation', 'Market Research'],
  'Design': ['Figma Component Systems', 'Wireframing & Prototyping', 'User Research & Personas', 'Design Systems', 'Usability Testing', 'Typography & Visual Hierarchy']
};

const CAREER_PRIORITIES = [
  { id: 'job', label: 'Get a Job', icon: '💼' },
  { id: 'growth', label: 'Career Growth', icon: '📈' },
  { id: 'salary', label: 'Increase Salary', icon: '💰' },
  { id: 'switch', label: 'Career Switch', icon: '🔄' },
  { id: 'skills', label: 'Learn New Skills', icon: '🎓' },
  { id: 'leadership', label: 'Move Into Leadership', icon: '🚀' },
  { id: 'remote', label: 'Find Remote Work', icon: '🌍' }
];

const LEARNING_STYLES = [
  { id: 'courses', label: 'Structured Courses', icon: '📚' },
  { id: 'projects', label: 'Hands-on Projects', icon: '🧪' },
  { id: 'questions', label: 'Practice Questions', icon: '🧠' },
  { id: 'mock', label: 'Mock Interviews', icon: '🎤' },
  { id: 'video', label: 'Video Learning', icon: '🎥' },
  { id: 'reading', label: 'Reading & Docs', icon: '📖' }
];

const COMPANY_TYPES = ['Startup', 'Product Company', 'Service Company', 'MNC', 'Government', 'Non-profit'];
const LOCATIONS = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Chennai', 'Pune', 'Delhi NCR', 'Remote', 'Anywhere in India'];
const SALARY_RANGES = ['₹3–5 LPA', '₹5–8 LPA', '₹8–12 LPA', '₹12–20 LPA', '₹20+ LPA', 'Flexible'];
const WORK_TYPES = ['Remote', 'Hybrid', 'On-site', 'Flexible'];
const EXP_LEVELS = ['Student', 'Fresher', '0–2 years', '2–5 years', '5+ years'];
const WEEKLY_HOURS = ['1–3 hours', '3–5 hours', '5–10 hours', '10+ hours'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Adaptive'];
const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'HR & Culture Fit', 'Case Study', 'Domain Specific', 'Communication'];
const INTERVIEW_FREQUENCIES = ['1 per week', '2 per week', '3 per week', 'Daily'];
const INTERVIEW_FOCUS_AREAS = ['Communication', 'Confidence', 'Technical Knowledge', 'Problem Solving', 'Domain Terminology', 'Behavioral STAR Answers'];

export default function Preferences() {
  const navigate = useNavigate();
  const { user, profile, preferences, updateProfile, updatePreferences } = useContext(UserContext);

  const [formData, setFormData] = useState({
    targetRole: 'Full Stack Developer',
    careerDomain: 'Technology',
    experienceLevel: 'Fresher',
    workPreference: 'Remote',
    preferredLocations: ['Bengaluru', 'Remote'],
    shortTermGoal: 'Secure a full-time role in a high-growth company',
    longTermGoal: 'Grow into a lead position and drive architectural decisions',
    careerPriorities: ['job', 'growth', 'skills'],
    preferredCompanies: 'Google, Microsoft, Fast-growing Startups',
    preferredIndustries: 'SaaS, FinTech, E-Commerce',
    companyTypes: ['Product Company', 'Startup'],
    companySize: '51–200',
    jobSearchPriorities: ['Role Fit', 'Learning & Growth', 'Salary'],
    salaryRange: '₹5–8 LPA',
    openToLowerSalary: true,
    learningStyles: ['projects', 'mock', 'courses'],
    weeklyLearningHours: '5–10 hours',
    difficultyPreference: 'Adaptive',
    learningTopics: ['React', 'Node.js', 'System Design'],
    interviewTypes: ['Technical', 'Behavioral'],
    interviewDifficulty: 'Adaptive',
    interviewFrequency: '2 per week',
    interviewFocus: ['Technical Knowledge', 'Communication', 'Behavioral STAR Answers'],
    willingToRelocate: 'Yes',
    workSchedule: 'Flexible',
    travelPreference: 'No travel',
    noticePeriod: 'Immediate'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const email = user?.email || localStorage.getItem('activeUser');
    const saved = email ? JSON.parse(localStorage.getItem(`userPreferences_${email}`) || localStorage.getItem(`preferences_${email}`) || 'null') : null;
    if (saved) {
      setFormData(prev => ({ ...prev, ...saved }));
    } else if (preferences && Object.keys(preferences).length > 0 && preferences.targetRole) {
      setFormData(prev => ({ ...prev, ...preferences }));
    } else if (profile?.targetRole) {
      setFormData(prev => ({ ...prev, targetRole: profile.targetRole }));
    }
  }, [preferences, profile, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || [];
      const updated = list.includes(item)
        ? list.filter(i => i !== item)
        : [...list, item];
      return { ...prev, [field]: updated };
    });
    setIsDirty(true);
  };

  const handleSavePreferences = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const email = user?.email || localStorage.getItem('activeUser');
    if (email) {
      localStorage.setItem(`userPreferences_${email}`, JSON.stringify(formData));
      localStorage.setItem(`preferences_${email}`, JSON.stringify(formData));
    }

    if (updatePreferences) {
      updatePreferences(formData);
    }

    if (updateProfile) {
      updateProfile({ 
        preferences: formData,
        targetRole: formData.targetRole,
        experience: formData.experienceLevel
      });
    }

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: formData,
          targetRole: formData.targetRole,
          experience: formData.experienceLevel
        })
      }).catch(err => console.error("Backend preference sync error:", err));
    }

    logActivity({
      type: "preferences_updated",
      title: "Career Preferences Saved",
      description: `Target set to ${formData.targetRole} (${formData.careerDomain})`,
      status: "success"
    });

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setIsDirty(false);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  // Calculate Completeness Score
  const computeCompleteness = () => {
    const checks = [
      { name: 'Target role', valid: Boolean(formData.targetRole) },
      { name: 'Career domain', valid: Boolean(formData.careerDomain) },
      { name: 'Experience level', valid: Boolean(formData.experienceLevel) },
      { name: 'Preferred location', valid: formData.preferredLocations?.length > 0 },
      { name: 'Career priorities', valid: formData.careerPriorities?.length > 0 },
      { name: 'Learning styles', valid: formData.learningStyles?.length > 0 },
      { name: 'Learning topics', valid: formData.learningTopics?.length > 0 },
      { name: 'Interview focus', valid: formData.interviewFocus?.length > 0 },
      { name: 'Salary preference', valid: Boolean(formData.salaryRange) }
    ];

    const completed = checks.filter(c => c.valid).length;
    const percentage = Math.round((completed / checks.length) * 100);
    const missing = checks.filter(c => !c.valid).map(c => c.name);

    return { percentage, missing };
  };

  const completeness = computeCompleteness();
  const currentDomainTopics = DOMAIN_TOPICS[formData.careerDomain] || DOMAIN_TOPICS['Technology'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* ==================================================
          1. PAGE HEADER
      ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Career Preferences
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Personalization Center
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Tell PREPRIA what you're aiming for. We'll personalize your roadmap, learning plan, interviews, and job recommendations around your goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty ? (
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          ) : isSaved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preferences synced ✓
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-400">
              Synced with Cloud
            </span>
          )}

          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          TWO-COLUMN MAIN GRID (8 + 4 COLS)
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==================================================
            LEFT COLUMN (8 COLS): PREFERENCE CARDS
        ================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: CAREER IDENTITY */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Career Identity
                </h2>
                <p className="text-xs text-gray-500">Help PREPRIA understand the career you're targeting</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Target Role */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Career Role <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.targetRole}
                  onChange={(e) => handleChange('targetRole', e.target.value)}
                  placeholder="e.g. Full Stack Developer, HR Executive, Marketing Lead"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                />
              </div>

              {/* Career Domain */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Career Domain
                </label>
                <select 
                  value={formData.careerDomain}
                  onChange={(e) => handleChange('careerDomain', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                >
                  <option value="Technology">Technology &amp; Software</option>
                  <option value="Data & Analytics">Data &amp; Analytics</option>
                  <option value="Human Resources">Human Resources &amp; Recruitment</option>
                  <option value="Marketing">Marketing &amp; Growth</option>
                  <option value="Finance">Finance &amp; Accounting</option>
                  <option value="Business & Sales">Business Development &amp; Sales</option>
                  <option value="Design">UI/UX &amp; Product Design</option>
                  <option value="Education">Education &amp; Training</option>
                  <option value="Operations">Operations &amp; Strategy</option>
                  <option value="Other">Other Specialized Domain</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Experience Level
                </label>
                <select 
                  value={formData.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                >
                  {EXP_LEVELS.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Work Preference */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Work Preference
                </label>
                <select 
                  value={formData.workPreference}
                  onChange={(e) => handleChange('workPreference', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                >
                  {WORK_TYPES.map(wt => (
                    <option key={wt} value={wt}>{wt}</option>
                  ))}
                </select>
              </div>

              {/* Preferred Location Chips */}
              <div className="sm:col-span-2 pt-1">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Location(s)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => {
                    const isSelected = formData.preferredLocations?.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleArrayItem('preferredLocations', loc)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-primary text-primary shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: CAREER DIRECTION & AMBITION */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Career Direction
                </h2>
                <p className="text-xs text-gray-500">Tell PREPRIA where you want your career to go</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Short-term Goal (Next 6–12 months)
                  </label>
                  <input 
                    type="text" 
                    value={formData.shortTermGoal}
                    onChange={(e) => handleChange('shortTermGoal', e.target.value)}
                    placeholder="e.g. Secure full-time role in a tier-1 company"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Long-term Career Ambition
                  </label>
                  <input 
                    type="text" 
                    value={formData.longTermGoal}
                    onChange={(e) => handleChange('longTermGoal', e.target.value)}
                    placeholder="e.g. Become a Team Lead / Principal Architect"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Career Priority Cards */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Career Priorities (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CAREER_PRIORITIES.map(cp => {
                    const isSelected = formData.careerPriorities?.includes(cp.id);
                    return (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => toggleArrayItem('careerPriorities', cp.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-primary text-primary shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-base">{cp.icon}</span>
                        <span className="text-xs font-bold leading-tight">{cp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: JOB PREFERENCES */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Job Preferences
                </h2>
                <p className="text-xs text-gray-500">Help us recommend opportunities that actually fit your criteria</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Target Organizations / Companies
                  </label>
                  <input 
                    type="text" 
                    value={formData.preferredCompanies}
                    onChange={(e) => handleChange('preferredCompanies', e.target.value)}
                    placeholder="e.g. Swiggy, Razorpay, Google, Target Startups"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Preferred Industries
                  </label>
                  <input 
                    type="text" 
                    value={formData.preferredIndustries}
                    onChange={(e) => handleChange('preferredIndustries', e.target.value)}
                    placeholder="e.g. FinTech, SaaS, HealthTech, Consulting"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Company Types Chips */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Company Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_TYPES.map(ct => {
                    const isSelected = formData.companyTypes?.includes(ct);
                    return (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => toggleArrayItem('companyTypes', ct)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {ct}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4: COMPENSATION PREFERENCES */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Compensation Preferences
                </h2>
                <p className="text-xs text-gray-500">Benchmark your compensation expectations for placement matching</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Expected Salary Range (Annual CTC)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SALARY_RANGES.map(sal => {
                    const isSelected = formData.salaryRange === sal;
                    return (
                      <button
                        key={sal}
                        type="button"
                        onClick={() => handleChange('salaryRange', sal)}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {sal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="openToLowerSalary"
                  checked={formData.openToLowerSalary}
                  onChange={(e) => handleChange('openToLowerSalary', e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="openToLowerSalary" className="text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                  Open to high-growth opportunities slightly below target salary for superior learning &amp; equity
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5: LEARNING PREFERENCES (DOMAIN-AWARE TOPICS) */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Learning Preferences
                </h2>
                <p className="text-xs text-gray-500">Tell PREPRIA how you prefer to prepare and study</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Learning Style Cards */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Learning Style (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LEARNING_STYLES.map(ls => {
                    const isSelected = formData.learningStyles?.includes(ls.id);
                    return (
                      <button
                        key={ls.id}
                        type="button"
                        onClick={() => toggleArrayItem('learningStyles', ls.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-primary text-primary shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-base">{ls.icon}</span>
                        <span className="text-xs font-bold">{ls.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Weekly Learning Goal
                  </label>
                  <select 
                    value={formData.weeklyLearningHours}
                    onChange={(e) => handleChange('weeklyLearningHours', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  >
                    {WEEKLY_HOURS.map(wh => (
                      <option key={wh} value={wh}>{wh}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Difficulty Calibration
                  </label>
                  <select 
                    value={formData.difficultyPreference}
                    onChange={(e) => handleChange('difficultyPreference', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topics I Want to Improve (Domain Aware!) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-gray-700 dark:text-gray-300">
                    Topics I Want to Improve ({formData.careerDomain})
                  </label>
                  <span className="text-[10px] text-gray-400">Tailored to your career domain</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDomainTopics.map(topic => {
                    const isSelected = formData.learningTopics?.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleArrayItem('learningTopics', topic)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-primary text-primary shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 6: INTERVIEW PREFERENCES */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Interview Preferences
                </h2>
                <p className="text-xs text-gray-500">Configure how PREPRIA schedules and conducts your AI Mock Interviews</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Interview Formats
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TYPES.map(it => {
                    const isSelected = formData.interviewTypes?.includes(it);
                    return (
                      <button
                        key={it}
                        type="button"
                        onClick={() => toggleArrayItem('interviewTypes', it)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-600 dark:text-rose-400 shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {it}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Target Interview Frequency
                  </label>
                  <select 
                    value={formData.interviewFrequency}
                    onChange={(e) => handleChange('interviewFrequency', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  >
                    {INTERVIEW_FREQUENCIES.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Simulation Difficulty
                  </label>
                  <select 
                    value={formData.interviewDifficulty}
                    onChange={(e) => handleChange('interviewDifficulty', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Interview Focus Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_FOCUS_AREAS.map(fa => {
                    const isSelected = formData.interviewFocus?.includes(fa);
                    return (
                      <button
                        key={fa}
                        type="button"
                        onClick={() => toggleArrayItem('interviewFocus', fa)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-600 dark:text-rose-400 shadow-2xs'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {fa}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 7: CAREER CONSTRAINTS (OPTIONAL) */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Career Constraints &amp; Availability
                </h2>
                <p className="text-xs text-gray-500">Optional filters for recruiter matching and scheduling</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Willing to Relocate
                </label>
                <select 
                  value={formData.willingToRelocate}
                  onChange={(e) => handleChange('willingToRelocate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>Maybe</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Notice Period / Availability
                </label>
                <select 
                  value={formData.noticePeriod}
                  onChange={(e) => handleChange('noticePeriod', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                >
                  <option>Immediate</option>
                  <option>15 days</option>
                  <option>30 days</option>
                  <option>60+ days</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ==================================================
            RIGHT COLUMN (4 COLS): PERSONALIZATION SNAPSHOT
        ================================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: PROFILE COMPLETENESS */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                PERSONALIZATION PROFILE
              </span>
              <span className="text-sm font-black text-primary">
                {completeness.percentage}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>

            {completeness.missing.length > 0 ? (
              <div className="space-y-1.5 pt-1 text-xs">
                <span className="text-[11px] font-bold text-gray-500 block">Missing Preferences:</span>
                {completeness.missing.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>All core preferences configured!</span>
              </div>
            )}
          </div>

          {/* Card 2: YOUR PREPRIA PROFILE SNAPSHOT */}
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                PROFILE SUMMARY
              </span>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                Your PREPRIA Profile
              </h3>
            </div>

            <div className="space-y-2.5 border-y border-gray-100 dark:border-gray-800 py-3.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Target Role:</span>
                <strong className="text-gray-900 dark:text-white truncate max-w-[140px] text-right">{formData.targetRole}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Experience:</span>
                <strong className="text-gray-900 dark:text-white">{formData.experienceLevel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Work Type:</span>
                <strong className="text-gray-900 dark:text-white">{formData.workPreference}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weekly Goal:</span>
                <strong className="text-primary font-bold">{formData.weeklyLearningHours}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <strong className="text-gray-900 dark:text-white truncate max-w-[140px] text-right">{formData.preferredLocations?.join(', ') || 'Remote'}</strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
                PREPRIA Will Personalize:
              </span>
              <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Career Roadmap</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> AI Mock Interviews</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Learning Recommendations</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Job Matching Algorithms</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Resume ATS Diagnostics</li>
              </ul>
            </div>
          </div>

          {/* Card 3: AI PERSONALIZATION PREVIEW */}
          <div className="bg-gradient-to-br from-[#111215] to-[#1C1E26] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden space-y-4 border border-white/[0.06]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#FF6B00] uppercase tracking-wider">
              <Zap className="w-3 h-3" /> AI Calibration Preview
            </div>

            <h4 className="text-sm font-extrabold tracking-tight">
              How PREPRIA Will Personalize Your Experience
            </h4>

            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Because you are targeting <strong className="text-white font-bold">{formData.targetRole}</strong> as a <strong className="text-white font-bold">{formData.experienceLevel}</strong> candidate preferring <strong className="text-white font-bold">{formData.workPreference}</strong> work, PREPRIA will prioritize:
            </p>

            <ul className="space-y-1.5 text-xs text-gray-300 pt-1">
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{formData.careerDomain} specific projects &amp; roadmap</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{formData.experienceLevel}-friendly mock interview questions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{formData.preferredLocations?.[0] || 'Remote'} job openings</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/career-roadmap')}
              className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/30"
            >
              <span>Preview My Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
