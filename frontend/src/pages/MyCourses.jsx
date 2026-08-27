import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Flame, Award, Search, Sparkles, Target, Lightbulb, 
  CheckCircle2, PlayCircle, BookOpen, FileText, ArrowRight, 
  Layers, Check, Compass, ShieldCheck, Filter, X, RefreshCw, ChevronRight, Zap,
  TrendingUp, BarChart3, GraduationCap, CheckCircle
} from 'lucide-react';
import { coursesData, categoryLearningPaths, CATEGORY_CONFIG, normalizeCategorySlug } from '../data/coursesData';
import { UserContext } from '../contexts/UserContext';
import { getCourseActionState, fetchEngagementMetrics } from '../utils/engagementService';

export default function MyCourses() {
  const navigate = useNavigate();
  const { user, profile, preferences } = useContext(UserContext);
  const email = user?.email || profile?.email || localStorage.getItem('userEmail') || 'guest';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [engagement, setEngagement] = useState({
    currentStreak: 0,
    learningTime: { thisWeekFormatted: "0m", thisWeekMinutes: 0 },
    lessonsCompleted: 0,
    assessmentsPassed: 0,
    coursesCompleted: 0,
    certificatesEarned: 0
  });

  const targetRole = profile?.targetRole || preferences?.targetRole || 'Full Stack Developer';
  const extractedSkills = profile?.skills || [];

  // Fetch true engagement stats
  useEffect(() => {
    const loadEngagement = async () => {
      const data = await fetchEngagementMetrics(email);
      if (data) setEngagement(data);
    };
    loadEngagement();
    window.addEventListener('activityLogged', loadEngagement);
    window.addEventListener('progressUpdated', loadEngagement);
    return () => {
      window.removeEventListener('activityLogged', loadEngagement);
      window.removeEventListener('progressUpdated', loadEngagement);
    };
  }, [email]);

  // Process courses with dynamic real-time progress state
  const processedCourses = useMemo(() => {
    return coursesData.map(course => {
      const actionState = getCourseActionState(course, email);
      const modulesList = Array.isArray(course.modules) ? course.modules : [];
      const totalItems = modulesList.reduce((acc, m) => acc + (m.items?.length || 0), 0);

      let status = 'not-started';
      if (actionState.isCompleted) status = 'completed';
      else if (actionState.progressPercentage > 0) status = 'in-progress';

      return {
        ...course,
        progressPercentage: actionState.progressPercentage,
        completedItemIds: actionState.completedItemIds,
        targetItemId: actionState.targetItemId,
        targetModuleIndex: actionState.targetModuleIndex,
        isCompleted: actionState.isCompleted,
        actionType: actionState.actionType,
        buttonLabel: actionState.buttonLabel,
        status,
        completedItemsCount: actionState.completedItemsCount,
        totalItems
      };
    });
  }, [email]);

  // Overall Statistics
  const inProgressCourses = processedCourses.filter(c => c.status === 'in-progress');
  const completedCourses = processedCourses.filter(c => c.status === 'completed');
  const overallProgress = processedCourses.length > 0
    ? Math.round(processedCourses.reduce((acc, c) => acc + c.progressPercentage, 0) / processedCourses.length)
    : 0;

  // Compute dynamic category counts
  const categoriesList = useMemo(() => {
    const cats = [
      'DevOps & Cloud',
      'Frontend Engineering',
      'Backend Engineering',
      'Human Resources',
      'Marketing',
      'Data & Analytics'
    ];

    const counts = {
      All: processedCourses.length
    };

    cats.forEach(cat => {
      counts[cat] = processedCourses.filter(c => c.category === cat).length;
    });

    return [
      { label: 'All', count: counts.All },
      ...cats.map(cat => ({ label: cat, count: counts[cat] || 0 }))
    ];
  }, [processedCourses]);

  // Personalized Recommended Courses Engine
  const recommendedCourses = useMemo(() => {
    const targetLower = targetRole.toLowerCase();
    const skillsLower = extractedSkills.map(s => s.toLowerCase());

    return processedCourses
      .map(course => {
        let score = 0;
        if (course.priority === 'HIGH PRIORITY') score += 10;
        
        // Match career roles
        if (course.careerRoles?.some(role => targetLower.includes(role.toLowerCase()) || role.toLowerCase().includes(targetLower))) {
          score += 15;
        }

        // Match skills
        course.skillsGained?.forEach(skill => {
          if (skillsLower.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
            score += 5;
          }
        });

        // Priority for matching category domain
        if (targetLower.includes('cloud') || targetLower.includes('devops')) {
          if (course.category === 'DevOps & Cloud') score += 8;
        } else if (targetLower.includes('frontend') || targetLower.includes('react') || targetLower.includes('ui')) {
          if (course.category === 'Frontend Engineering') score += 8;
        } else if (targetLower.includes('backend') || targetLower.includes('node') || targetLower.includes('system')) {
          if (course.category === 'Backend Engineering') score += 8;
        } else if (targetLower.includes('hr') || targetLower.includes('human') || targetLower.includes('talent')) {
          if (course.category === 'Human Resources') score += 8;
        } else if (targetLower.includes('market') || targetLower.includes('growth') || targetLower.includes('brand')) {
          if (course.category === 'Marketing') score += 8;
        } else if (targetLower.includes('data') || targetLower.includes('analytics') || targetLower.includes('bi')) {
          if (course.category === 'Data & Analytics') score += 8;
        }

        return { ...course, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [processedCourses, targetRole, extractedSkills]);

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return processedCourses.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.subcategory && c.subcategory.toLowerCase().includes(q)) ||
        c.skillsGained.some(s => s.toLowerCase().includes(q)) ||
        (c.careerRoles && c.careerRoles.some(r => r.toLowerCase().includes(q))) ||
        (c.modules && c.modules.some(m => 
          m.title.toLowerCase().includes(q) || 
          (m.items && m.items.some(i => i.title.toLowerCase().includes(q)))
        ));

      const matchesCategory = selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesDifficulty = selectedDifficulty === 'All' || c.level.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchesStatus = selectedStatus === 'All' || 
        (selectedStatus === 'in-progress' && c.status === 'in-progress') ||
        (selectedStatus === 'completed' && c.status === 'completed') ||
        (selectedStatus === 'not-started' && c.status === 'not-started');

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [processedCourses, searchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  // Primary active course to continue
  const primaryActiveCourse = inProgressCourses[0] || recommendedCourses[0] || processedCourses[0];

  const handleCourseAction = (e, course) => {
    e.stopPropagation();
    if (course.actionType === 'CERTIFICATE') {
      navigate(`/certificate/${course.id}`);
    } else if (course.actionType === 'CONTINUE' || course.actionType === 'START' || course.actionType === 'REVIEW') {
      navigate(`/course/${course.id}?item=${course.targetItemId || ''}`);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  const currentPathMeta = selectedCategory !== 'All' ? categoryLearningPaths[selectedCategory] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* ==================================================
          1. HERO DASHBOARD & CAREER PROGRESS SUMMARY
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> AI Career Learning Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1.5">
              Your Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Master role-verified skills across technology, human resources, marketing, and data analytics with pedagogical AI courses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {primaryActiveCourse && (
              <button
                onClick={(e) => handleCourseAction(e, primaryActiveCourse)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{primaryActiveCourse.buttonLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Personalized Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Target Role</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block mt-0.5">
              {targetRole}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Total Catalog</span>
            <span className="text-xs sm:text-sm font-bold text-primary block mt-0.5">
              {coursesData.length} Courses
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Active Courses</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {inProgressCourses.length} In Progress
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Completed</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {completedCourses.length} Certified
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Current Streak</span>
            <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-500" /> {engagement.currentStreak} Days
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          2. AI LEARNING INSIGHT & ROADMAP CONNECTION
      ================================================== */}
      {primaryActiveCourse && (
        <div className="bg-gradient-to-br from-[#111215] to-[#1C1E26] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/[0.06]">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1.5 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#FF6B00] text-[10px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>AI Career Roadmap Insight</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Prioritized for {targetRole} Roadmap
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Based on your resume and current roadmap milestone, your highest-leverage learning area is <strong className="text-white font-bold">{primaryActiveCourse.title}</strong> to close verified skill gaps.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
              <span>Career Impact: <strong className="text-emerald-400">{primaryActiveCourse.careerImpact?.readinessBoost || '+8% Placement Readiness'}</strong></span>
              <span>•</span>
              <span>Est. Duration: <strong className="text-gray-300">{primaryActiveCourse.duration}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0 self-end sm:self-center">
            <button
              onClick={(e) => handleCourseAction(e, primaryActiveCourse)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>{primaryActiveCourse.buttonLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          3. CATEGORY DOMAIN PATHWAY BANNER (WHEN CATEGORY SELECTED)
      ================================================== */}
      {currentPathMeta && (
        <div className={`rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] bg-gradient-to-r ${currentPathMeta.color} dark:bg-[#111215] shadow-xs space-y-4`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${currentPathMeta.badgeColor}`}>
                  {selectedCategory} Career Learning Path
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {filteredCourses.length} Courses Available
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentPathMeta.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                {currentPathMeta.tagline}
              </p>
            </div>
          </div>

          {/* Stepped Learning Progression Bar */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
              Structured Pathway Progression
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {currentPathMeta.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between"
                >
                  <span className="text-[9px] font-extrabold text-primary block">STEP 0{idx + 1}</span>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight mt-1">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          4. SEARCH & CATEGORY FILTER TABS
      ================================================== */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="w-full sm:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, modules, skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty & Status Selectors */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>

        </div>

        {/* Category Filter Chips with Dynamic Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((catObj) => (
            <button
              key={catObj.label}
              onClick={() => setSelectedCategory(catObj.label)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === catObj.label
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span>{catObj.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === catObj.label
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {catObj.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* ==================================================
          5. COURSE GRID (INFORMATION-DENSE CARDS)
      ================================================== */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.status === 'completed';

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div>
                  {/* Top Metadata Strip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {course.category}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      course.priority === 'HIGH PRIORITY'
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-primary border-orange-200 dark:border-orange-900/30'
                        : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200'
                    }`}>
                      {isCompleted ? '✓ Completed' : course.level}
                    </span>
                  </div>

                  {/* Course Title & Description */}
                  <h3 
                    className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight"
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Skills Pill Row */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {course.skillsGained.slice(0, 3).map((sk, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                        {sk}
                      </span>
                    ))}
                    {course.skillsGained.length > 3 && (
                      <span className="text-[10px] font-semibold text-gray-400 px-1 py-0.5">
                        +{course.skillsGained.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Why This is Recommended Callout */}
                  {course.whyRecommended && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-[11px] text-gray-700 dark:text-gray-300">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block mb-0.5">
                        Why Recommended:
                      </span>
                      <p className="line-clamp-2 leading-tight">
                        {course.whyRecommended}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-400">{course.duration} • {course.estimatedHours || '12 Hours'}</span>
                      <span className={isCompleted ? 'text-emerald-600' : 'text-primary'}>
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={(e) => handleCourseAction(e, course)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        course.actionType === 'CERTIFICATE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 hover:bg-emerald-100'
                          : course.actionType === 'CONTINUE'
                          ? 'bg-primary hover:bg-primaryHover text-white'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white'
                      }`}
                    >
                      {course.actionType === 'CERTIFICATE' && <Award className="w-3.5 h-3.5" />}
                      <span>{course.buttonLabel}</span>
                      {course.actionType !== 'CERTIFICATE' && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-[#111215] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-4">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              No courses match your active search
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your keyword query or resetting your difficulty filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
