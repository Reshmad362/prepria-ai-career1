import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  Briefcase, MapPin, DollarSign, Search, Filter, Star, Clock, 
  CheckCircle2, ChevronDown, Zap, ArrowRight, X, Bookmark, 
  ExternalLink, Sparkles, AlertTriangle, BookOpen, Target, 
  Compass, ArrowUpRight, Check, PlayCircle, ShieldCheck, 
  Layers, Users, Building2, HelpCircle, RefreshCw, BarChart3
} from 'lucide-react';
import { INITIAL_CAREER_OPPORTUNITIES } from '../data/jobsData';
import { calculateJobAnalysis, getTrackedJobs, updateJobTrackingStatus } from '../utils/jobMatchingService';

export default function JobBoard() {
  const navigate = useNavigate();
  const { user, profile, preferences } = useContext(UserContext);

  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail') || 'guest';
  
  // User Profile Intelligence
  const userSkills = useMemo(() => {
    if (Array.isArray(profile?.skills) && profile.skills.length > 0) return profile.skills;
    if (Array.isArray(user?.skills) && user.skills.length > 0) return user.skills;
    
    // Check ATS data in localStorage
    try {
      const ats = JSON.parse(localStorage.getItem(`atsData_${activeEmail}`) || '{}');
      if (Array.isArray(ats.skills) && ats.skills.length > 0) return ats.skills;
    } catch (e) {}

    // Sensible domain default fallback
    return ['React', 'JavaScript', 'TypeScript', 'Git', 'REST APIs', 'HTML5', 'CSS3'];
  }, [profile, user, activeEmail]);

  const targetRole = profile?.targetRole || preferences?.targetRole || 'Full Stack Developer';
  const experienceLevel = profile?.experience || preferences?.experienceLevel || 'Fresher';
  const atsScore = profile?.score || 85;
  const workPreference = preferences?.workPreference || 'Remote';

  // State
  const [jobsList, setJobsList] = useState(INITIAL_CAREER_OPPORTUNITIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'RECOMMENDED' | 'HIGH_MATCH' | 'SAVED' | 'APPLIED'
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState(INITIAL_CAREER_OPPORTUNITIES[0]?.id || null);
  const [trackedJobs, setTrackedJobs] = useState(() => getTrackedJobs(activeEmail));
  const [prepareModalJob, setPrepareModalJob] = useState(null);

  // Sync tracked jobs on mount and storage events
  useEffect(() => {
    const handleStorageChange = () => {
      setTrackedJobs(getTrackedJobs(activeEmail));
    };
    window.addEventListener("jobTrackingUpdated", handleStorageChange);
    return () => window.removeEventListener("jobTrackingUpdated", handleStorageChange);
  }, [activeEmail]);

  // Fetch from backend API if available, fallback to rich local dataset
  useEffect(() => {
    const fetchApiJobs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/jobs/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: userSkills, target_role: targetRole })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setJobsList(data);
          }
        }
      } catch (err) {
        // Fallback to client-side calculated INITIAL_CAREER_OPPORTUNITIES
      }
    };

    fetchApiJobs();
  }, [userSkills, targetRole]);

  // Compute live match intelligence for all jobs
  const analyzedJobs = useMemo(() => {
    return jobsList.map(job => {
      const analysis = calculateJobAnalysis(job, {
        userSkills,
        targetRole,
        experienceLevel,
        atsScore,
        workPreference
      });

      const tracking = trackedJobs[job.id] || null;

      return {
        ...job,
        ...analysis,
        trackingStatus: tracking?.status || null,
        isSaved: tracking?.status === 'Saved' || Boolean(tracking)
      };
    });
  }, [jobsList, userSkills, targetRole, experienceLevel, atsScore, workPreference, trackedJobs]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalJobs = analyzedJobs.length;
    const highMatchCount = analyzedJobs.filter(j => j.matchScore >= 80).length;
    const avgReadiness = Math.round(
      analyzedJobs.reduce((acc, j) => acc + (j.readiness?.overall || 70), 0) / (totalJobs || 1)
    );
    const avgMatchedCount = Math.round(
      analyzedJobs.reduce((acc, j) => acc + (j.matchedSkills?.length || 0), 0) / (totalJobs || 1)
    );

    return {
      targetRole,
      careerReadiness: `${avgReadiness}%`,
      skillsMatched: `${avgMatchedCount}/8`,
      recommendedApplications: highMatchCount || 4
    };
  }, [analyzedJobs, targetRole]);

  // Filtering Logic
  const filteredJobs = useMemo(() => {
    return analyzedJobs.filter(job => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.requiredSkills || []).some(s => s.toLowerCase().includes(q)) ||
        (job.category || '').toLowerCase().includes(q);

      // Main Tabs
      let matchesTab = true;
      if (activeTab === 'RECOMMENDED') {
        matchesTab = job.matchScore >= 70;
      } else if (activeTab === 'HIGH_MATCH') {
        matchesTab = job.matchScore >= 80;
      } else if (activeTab === 'SAVED') {
        matchesTab = job.trackingStatus === 'Saved' || job.isSaved;
      } else if (activeTab === 'APPLIED') {
        matchesTab = job.trackingStatus === 'Applied' || job.trackingStatus === 'Interview' || job.trackingStatus === 'Offer';
      }

      // Work Type Filter
      const matchesWorkType = selectedWorkType === 'All' || job.workType === selectedWorkType;

      // Experience Level Filter
      const matchesLevel = selectedLevel === 'All' || job.experienceLevel === selectedLevel;

      // Category Filter
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory || job.domain === selectedCategory;

      return matchesSearch && matchesTab && matchesWorkType && matchesLevel && matchesCategory;
    });
  }, [analyzedJobs, searchQuery, activeTab, selectedWorkType, selectedLevel, selectedCategory]);

  // Selected active job
  const activeSelectedJob = useMemo(() => {
    return filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || analyzedJobs[0] || null;
  }, [filteredJobs, selectedJobId, analyzedJobs]);

  // Toggle Save Job
  const handleToggleSave = (jobId, e) => {
    if (e) e.stopPropagation();
    const current = trackedJobs[jobId];
    if (current?.status === 'Saved') {
      updateJobTrackingStatus(jobId, null, activeEmail);
    } else {
      updateJobTrackingStatus(jobId, 'Saved', activeEmail, { jobTitle: activeSelectedJob?.title });
    }
  };

  // Update Status
  const handleStatusChange = (jobId, newStatus) => {
    updateJobTrackingStatus(jobId, newStatus, activeEmail);
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveTab('ALL');
    setSelectedWorkType('All');
    setSelectedLevel('All');
    setSelectedCategory('All');
  };

  // Dynamic available categories list
  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    jobsList.forEach(j => {
      if (j.category) cats.add(j.category);
    });
    return Array.from(cats);
  }, [jobsList]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-manrope animate-in fade-in duration-300">
      
      {/* ==================================================
          1. PAGE HEADER & COMPACT SUMMARY ROW
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-MATCHED TO YOUR CAREER GOALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Career Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              Discover roles that match your profile, track your readiness, and close the gaps before you apply.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/career-roadmap')}
              className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>View Career Roadmap</span>
            </button>
          </div>
        </div>

        {/* Compact Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Target Role</span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white block mt-0.5 truncate">{summaryMetrics.targetRole}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Career Readiness</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">{summaryMetrics.careerReadiness} Ready</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Avg Skills Matched</span>
            <span className="text-xs font-extrabold text-primary block mt-0.5">{summaryMetrics.skillsMatched} Skills</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Top Recommended</span>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 block mt-0.5">{summaryMetrics.recommendedApplications} Roles (&ge;80%)</span>
          </div>
        </div>

      </div>

      {/* ==================================================
          2. FILTER & SEARCH WORKSPACE
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
        
        {/* Top Search Input & Primary Tabs */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search opportunities by title, company, required skill, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: `All (${analyzedJobs.length})` },
              { id: 'RECOMMENDED', label: 'Recommended' },
              { id: 'HIGH_MATCH', label: 'High Match (80%+)' },
              { id: 'SAVED', label: `Saved (${Object.values(trackedJobs).filter(t => t.status === 'Saved').length})` },
              { id: 'APPLIED', label: `Applied (${Object.values(trackedJobs).filter(t => t.status === 'Applied').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns / Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category / Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-hidden cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Work Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Work Type:</span>
              <select
                value={selectedWorkType}
                onChange={(e) => setSelectedWorkType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Experience Level Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Experience:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
              </select>
            </div>

          </div>

          {/* Result Count & Reset */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-bold text-xs">
              Showing <strong>{filteredJobs.length}</strong> opportunities
            </span>
            {(searchQuery || activeTab !== 'ALL' || selectedWorkType !== 'All' || selectedLevel !== 'All' || selectedCategory !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="text-primary hover:underline font-bold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ==================================================
          3. MAIN TWO-COLUMN WORKSPACE
      ================================================== */}
      {filteredJobs.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-12 text-center border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            No opportunities match these filters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try loosening your search query, selecting different work types, or clearing category filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================================================
              LEFT: JOB OPPORTUNITY CARDS LIST
          ================================================== */}
          <div className="lg:col-span-6 space-y-4">
            {filteredJobs.map((job) => {
              const isSelected = activeSelectedJob?.id === job.id;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`bg-white dark:bg-[#111215] rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer space-y-4 relative ${
                    isSelected
                      ? 'border-primary shadow-md ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-gray-700 shadow-2xs'
                  }`}
                >
                  {/* Top Row: Company Badge, Title, Save Bookmark, Match Dial */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${job.logoBg || 'bg-primary'} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs`}>
                        {job.logoText || job.company?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                          {job.title}
                        </h3>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {job.company} • {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleToggleSave(job.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          job.isSaved
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600'
                        }`}
                        title={job.isSaved ? "Saved Job" : "Save Job"}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                        job.matchScore >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200'
                          : job.matchScore >= 60
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 border border-gray-200'
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{job.matchScore}% Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Chips: Salary, Work Type, Experience */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                      {job.salary}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                      {job.workType}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                      {job.experienceLevel}
                    </span>
                  </div>

                  {/* Explainable Match Checklist */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                    {(job.checklist || []).slice(0, 3).map((item, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {item.type === 'success' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : item.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-medium leading-tight">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* 3-Pillar Readiness Gauge */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-400 uppercase tracking-wider">Your Readiness</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {job.readiness?.overall}% Overall Ready
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold">Resume</span>
                        <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{job.readiness?.resume}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold">Skills</span>
                        <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{job.readiness?.skills}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold">Interview</span>
                        <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{job.readiness?.interview}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Matched & Missing Skills Preview */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(job.matchedSkills || []).slice(0, 3).map((sk, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> {sk}
                      </span>
                    ))}
                    {(job.missingSkills || []).slice(0, 2).map((gap, gIdx) => (
                      <span key={gIdx} className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> {gap}
                      </span>
                    ))}
                    {job.missingSkills?.length > 2 && (
                      <span className="text-[10px] text-gray-400 font-bold">+{job.missingSkills.length - 2} gaps</span>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobId(job.id);
                      }}
                      className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>View Full Analysis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {job.recommendedActionTier === 'HIGH_MATCH' ? (
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrepareModalJob(job);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-orange-100 cursor-pointer"
                      >
                        <span>Prepare &amp; Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* ==================================================
              RIGHT: DETAILED JOB ANALYSIS & PREPARATION PANEL
          ================================================== */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-6 lg:sticky lg:top-6 max-h-[90vh] overflow-y-auto">
            
            {activeSelectedJob ? (
              <div className="space-y-6">
                
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl ${activeSelectedJob.logoBg || 'bg-primary'} text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm`}>
                      {activeSelectedJob.logoText || activeSelectedJob.company?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        {activeSelectedJob.title}
                      </h2>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {activeSelectedJob.company} • {activeSelectedJob.department || activeSelectedJob.category}
                      </span>
                    </div>
                  </div>

                  {/* Save Bookmark */}
                  <button
                    onClick={() => handleToggleSave(activeSelectedJob.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      activeSelectedJob.isSaved
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600'
                    }`}
                    title={activeSelectedJob.isSaved ? "Saved" : "Save Job"}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Primary CTA & Application Status Manager */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Status:</span>
                    <select
                      value={activeSelectedJob.trackingStatus || 'Not Applied'}
                      onChange={(e) => handleStatusChange(activeSelectedJob.id, e.target.value === 'Not Applied' ? null : e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                      <option value="Not Applied">Not Applied</option>
                      <option value="Saved">Saved</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview Scheduled</option>
                      <option value="Offer">Offer Received</option>
                    </select>
                  </div>

                  <a
                    href={activeSelectedJob.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Apply on Company Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Section 1: PREPRIA Career Analysis */}
                <div className="p-5 rounded-3xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Your PREPRIA Analysis
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-primary">
                      {activeSelectedJob.matchScore}% Match Score
                    </span>
                  </div>

                  {/* 3-Pillar Readiness Meter */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase">Resume Alignment</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 block">{activeSelectedJob.readiness?.resume}%</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase">Skill Coverage</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 block">{activeSelectedJob.readiness?.skills}%</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase">Interview Ready</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 block">{activeSelectedJob.readiness?.interview}%</span>
                    </div>
                  </div>

                  {/* AI Recommendation Quote */}
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium bg-white/70 dark:bg-gray-900/60 p-3.5 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                    <strong className="text-primary font-bold">Why PREPRIA recommends this: </strong>
                    {activeSelectedJob.aiRecommendation}
                  </p>
                </div>

                {/* Section 2: Matched Skills vs Skill Gaps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Skills Breakdown
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5">
                        ✓ Matched Required Skills ({activeSelectedJob.matchedSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeSelectedJob.matchedSkills?.map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {activeSelectedJob.missingSkills?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1.5">
                          ⚠ Skill Gaps to Close ({activeSelectedJob.missingSkills?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeSelectedJob.missingSkills?.map((gap, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Prepare for This Role (Action Hub) */}
                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-primary" />
                      <span>Prepare for This Role</span>
                    </h4>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {activeSelectedJob.readiness?.overall}% Ready
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Follow these 4 recommended steps to maximize your chances before submitting:
                  </p>

                  <div className="space-y-2 text-xs">
                    <div 
                      onClick={() => navigate('/resume-intelligence')}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">1</span>
                        <span className="font-bold text-gray-900 dark:text-white">Align Resume for ATS Scoring</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => navigate('/my-courses')}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">2</span>
                        <span className="font-bold text-gray-900 dark:text-white">Close Missing Skill Gaps in Hub</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => navigate('/mock-interview')}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">3</span>
                        <span className="font-bold text-gray-900 dark:text-white">Practice Role-Specific AI Mock Interview</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Full Job Description & Responsibilities */}
                <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-5">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      About the Role
                    </h4>
                    <p>{activeSelectedJob.description}</p>
                  </div>

                  {activeSelectedJob.responsibilities?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Key Responsibilities
                      </h4>
                      <div className="space-y-1.5">
                        {activeSelectedJob.responsibilities.map((resp, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                            <span>{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSelectedJob.benefits?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Perks &amp; Benefits
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activeSelectedJob.benefits.map((ben, bIdx) => (
                          <div key={bIdx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

          </div>

        </div>
      )}

      {/* ==================================================
          PREPARE FOR ROLE MODAL
      ================================================== */}
      {prepareModalJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Prepare for {prepareModalJob.title}
                </h3>
              </div>
              <button 
                onClick={() => setPrepareModalJob(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Current Readiness</span>
                  <span className="text-xl font-extrabold text-primary">{prepareModalJob.readiness?.overall}% Ready</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{prepareModalJob.company}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Recommended Next Best Actions:</span>
                
                {prepareModalJob.recommendedCourses?.map((rc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-600 block">{rc.estimatedReadinessBoost} Readiness Boost</span>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5">{rc.courseTitle}</h4>
                      <span className="text-[10px] text-gray-400">Closes gap in {rc.skillGap}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/course/${rc.courseId}`)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-all cursor-pointer shrink-0"
                    >
                      Start Course
                    </button>
                  </div>
                ))}

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-600 block">+5% Readiness Boost</span>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5">Practice {prepareModalJob.category || 'Role'} AI Mock Interview</h4>
                    <span className="text-[10px] text-gray-400">Validate real interview questions</span>
                  </div>
                  <button
                    onClick={() => navigate('/mock-interview')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shrink-0"
                  >
                    Practice
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setPrepareModalJob(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Close
              </button>
              <a
                href={prepareModalJob.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-all cursor-pointer"
              >
                Proceed to Apply
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
