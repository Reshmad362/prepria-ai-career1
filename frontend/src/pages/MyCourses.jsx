import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Clock, Flame, Award, Bell, Search, Sparkles, Target, Lightbulb, CheckCircle2, PlayCircle, BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesData as coursesDataRaw } from '../data/coursesData';
import { UserContext } from '../contexts/UserContext';

const coursesData = Array.isArray(coursesDataRaw) ? coursesDataRaw : [];

const getSafeData = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export default function MyCourses() {
  const navigate = useNavigate();
  const { user, profile, preferences } = useContext(UserContext);
  const email = user?.email || "guest";
  const [activeInterest, setActiveInterest] = useState('All');
  const [activeGroup, setActiveGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Temporary debug logs
  console.log("User:", user);
  console.log("Courses:", coursesData);

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "Explore"
  ); // Tabs: Explore, Ongoing, Certificates

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const [insights, setInsights] = useState({});
  const [streakCount, setStreakCount] = useState(1);

  // Streak tracking logic
  useEffect(() => {
    if (!user?.email) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedLastVisit = localStorage.getItem(`lastVisitDate_${user.email}`);
      const storedStreak = parseInt(localStorage.getItem(`streakCount_${user.email}`) || '1', 10);
      
      if (!storedLastVisit) {
        localStorage.setItem(`lastVisitDate_${user.email}`, today);
        localStorage.setItem(`streakCount_${user.email}`, '1');
        setStreakCount(1);
      } else if (storedLastVisit !== today) {
        const lastVisitDate = new Date(storedLastVisit);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastVisitDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          const newStreak = storedStreak + 1;
          localStorage.setItem(`lastVisitDate_${user.email}`, today);
          localStorage.setItem(`streakCount_${user.email}`, newStreak.toString());
          setStreakCount(newStreak);
        } else {
          localStorage.setItem(`lastVisitDate_${user.email}`, today);
          localStorage.setItem(`streakCount_${user.email}`, '1');
          setStreakCount(1);
        }
      } else {
        setStreakCount(storedStreak);
      }
    } catch (e) {
      console.error("Streak calculation error", e);
    }
  }, [user]);

  // Process courses to append progress data
  const processedCourses = useMemo(() => {
    return coursesData.map(course => {
      let progress = { completedModules: [], isCompleted: false };
      try {
        const stored = localStorage.getItem(`progress_${course.id}`);
        if (stored) progress = JSON.parse(stored);
      } catch (e) {}

      const totalModules = course.modules?.length || 8; // Fallback to 8 minimum
      const completedCount = progress.completedModules?.length || 0;
      let progressPercentage = Math.round((completedCount / totalModules) * 100);
      
      if (progressPercentage > 100) progressPercentage = 100;
      if (progress.isCompleted) progressPercentage = 100;
      
      let status = 'not-started';
      if (progress.isCompleted) status = 'completed';
      else if (completedCount > 0) status = 'in-progress';

      return {
        ...course,
        progressPercentage,
        status,
        completedCount,
        totalModules
      };
    });
  }, []);

  const continueCourses = useMemo(() => processedCourses.filter(c => c.status === 'in-progress'), [processedCourses]);
  
  const completedCoursesIds = getSafeData(`completedCourses_${email}`, []);
  const completedCourses = useMemo(() => {
    return processedCourses.filter(c => completedCoursesIds.includes(String(c.id)));
  }, [processedCourses, completedCoursesIds]);

  // PHASE: USER SPECIFIC CERTIFICATES
  const completedCoursesList = useMemo(() => {
    if (!email || email === "guest") return [];
    const stored = getSafeData(`completedCourses_${email}`, []);
    return stored.map((courseId) => {
      const course = coursesData.find((c) => String(c.id) === String(courseId));
      if (!course) return null;
      const cert = JSON.parse(localStorage.getItem(`cert_${email}_${courseId}`) || "null") || {};
      return { ...course, cert };
    }).filter(Boolean);
  }, [email]);

  useEffect(() => {
    try {
      if (email !== "guest") {
        const storedInsights = JSON.parse(localStorage.getItem(`userInsights_${email}`) || '{}');
        setInsights(storedInsights);
      }
    } catch (e) {
      console.error("Error parsing userInsights", e);
    }
  }, [email]);

  const filterGroups = {
    "General": ["All"],
    "Tech": ["Frontend", "Backend", "Full Stack", "AI / Machine Learning", "Data Science", "Cloud Computing", "Cyber Security", "DevOps", "Software Engineering", "Mobile App Development", "Game Development", "Blockchain / Web3", "IoT (Internet of Things)"],
    "Non-Tech": ["Finance", "Accounting", "Investment Banking", "Business & Management", "Human Resources (HR)", "Marketing", "Digital Marketing", "Sales", "Product Management", "Operations Management", "Supply Chain Management", "Consulting", "Entrepreneurship", "Business Analytics"],
    "Creative": ["UI/UX Design", "Graphic Design", "Video Editing", "Animation", "Content Creation", "Social Media Management", "Branding"],
    "Emerging": ["Generative AI", "Prompt Engineering", "AI Product Management", "Data Engineering", "MLOps", "Cyber Forensics", "AR/VR Development", "Robotics"],
    "Soft Skills": ["Communication", "Interview Skills", "Resume Building", "Public Speaking", "Leadership", "Time Management", "Critical Thinking", "Problem Solving", "Negotiation Skills", "Emotional Intelligence"]
  };

  // PHASE 2 — MAP TARGET ROLE -> DOMAIN
  const roleToDomainMap = {
    "Software Engineer": "tech",
    "Frontend Developer": "tech",
    "Backend Developer": "tech",
    "Full Stack Developer": "tech",
    "Data Scientist": "tech",
    "Data Analyst": "tech",

    "Investment Banking": "finance",
    "Financial Analyst": "finance",
    "Accountant": "finance",

    "HR Manager": "business",
    "Marketing Manager": "business",
    "Product Manager": "business",
    "Business Analyst": "business",
    "Sales Representative": "business",

    "UI/UX Designer": "creative",
    "UI Designer": "creative",
    "Graphic Designer": "creative",

    "AI Engineer": "emerging",
    "Prompt Engineering": "emerging"
  };

  // PHASE 3 — FILTER COURSES BASED ON DOMAIN
  const selectedDomain = useMemo(() => {
    return roleToDomainMap[preferences?.targetRole] || null;
  }, [preferences?.targetRole]);

  const domainCourses = useMemo(() => {
    if (!selectedDomain) return processedCourses;
    return processedCourses.filter(course => course.domain === selectedDomain);
  }, [selectedDomain, processedCourses]);

  // PHASE 5 — CATEGORY FILTER INSIDE DOMAIN
  const visibleFilterGroups = useMemo(() => {
    if (!selectedDomain) return filterGroups;
    
    const availableCategories = new Set(domainCourses.map(c => c.category));
    
    const visible = { "General": ["All"] };
    Object.entries(filterGroups).forEach(([groupName, categories]) => {
      if (groupName === "General") return;
      
      const matchedCategories = categories.filter(cat => availableCategories.has(cat));
      if (matchedCategories.length > 0) {
        visible[groupName] = matchedCategories;
      }
    });
    
    
    return visible;
  }, [selectedDomain, domainCourses]);

  // PHASE 6 — DEFAULT STATES
  useEffect(() => {
    const groupKeys = Object.keys(visibleFilterGroups);
    if (groupKeys.length > 0 && !activeGroup) {
      const firstGroup = groupKeys[0];
      setActiveGroup(firstGroup);
      setActiveInterest(visibleFilterGroups[firstGroup][0]);
    }
  }, [visibleFilterGroups, activeGroup]);

  const categoryMap = useMemo(() => ({
    // Tech
    'react': 'Frontend', 'frontend': 'Frontend', 'nextjs': 'Frontend',
    'backend': 'Backend', 'node': 'Backend', 'system design': 'Backend', 'microservices': 'Backend',
    'full stack': 'Full Stack', 
    'data': 'Data Science', 'python': 'Data Science', 'analysis': 'Data Science',
    'security': 'Cyber Security', 'cyber': 'Cyber Security',
    'devops': 'DevOps', 'docker': 'DevOps', 'kubernetes': 'DevOps',
    'ai': 'AI / Machine Learning', 'ml': 'AI / Machine Learning', 'machine learning': 'AI / Machine Learning',
    
    // Non-Tech
    'finance': 'Finance', 'accounting': 'Accounting', 'investment': 'Investment Banking',
    'hr': 'Human Resources (HR)', 'recruitment': 'Human Resources (HR)',
    'marketing': 'Marketing', 'seo': 'Digital Marketing', 'social media': 'Social Media Management',
    'product': 'Product Management', 'business': 'Business & Management', 'management': 'Business & Management',
    'sales': 'Sales', 'negotiation': 'Sales',

    // Creative
    'design': 'UI/UX Design', 'ui': 'UI/UX Design', 'ux': 'UI/UX Design', 'figma': 'UI/UX Design',
    'video': 'Video Editing', 'content': 'Content Creation',

    // Emerging
    'generative': 'Generative AI', 'llm': 'Generative AI', 'prompt': 'Prompt Engineering',
    
    // Soft Skills
    'communication': 'Communication', 'speaking': 'Public Speaking',
    'confidence': 'Interview Skills', 'interview': 'Interview Skills',
    'leadership': 'Leadership', 'emotional intelligence': 'Emotional Intelligence', 'conflict': 'Emotional Intelligence'
  }), []);

  const swimlanes = useMemo(() => {
    const lanes = [];

    // Helper to find courses by keywords
    const getCoursesByKeywords = (keywords, excludeIds = new Set()) => {
      const matches = new Map();
      if (!keywords || !Array.isArray(keywords)) return [];
      
      keywords.forEach(kw => {
        const lowerKw = kw.toLowerCase();
        for (const [key, category] of Object.entries(categoryMap)) {
          if (lowerKw.includes(key) || key.includes(lowerKw)) {
            processedCourses.forEach(course => {
              if (course.category === category && !excludeIds.has(course.id)) {
                matches.set(course.id, course);
              }
            });
          }
        }
      });
      return Array.from(matches.values());
    };

    const usedIds = new Set();

    // 1. Weak Areas (Focus Areas)
    if (insights?.weakAreas && insights.weakAreas.length > 0) {
      const weakCourses = getCoursesByKeywords(insights.weakAreas, usedIds).slice(0, 6);
      if (weakCourses.length > 0) {
        lanes.push({
          title: "Improve Your Focus Areas",
          icon: Lightbulb,
          color: "text-yellow-500",
          courses: weakCourses
        });
        weakCourses.forEach(c => usedIds.add(c.id));
      }
    }

    // 2. Based on Profile / Role
    let roleKeywords = [];
    if (preferences?.targetRole) roleKeywords.push(preferences.targetRole);
    if (profile?.skills) roleKeywords.push(...profile.skills);
    
    if (roleKeywords.length > 0) {
      const roleCourses = getCoursesByKeywords(roleKeywords, usedIds).slice(0, 6);
      if (roleCourses.length > 0) {
        lanes.push({
          title: "Recommended For You",
          icon: Target,
          color: "text-purple-500",
          courses: roleCourses
        });
        roleCourses.forEach(c => usedIds.add(c.id));
      }
    }

    // 3. Domain specific trending
    if (selectedDomain) {
      const domainCrs = processedCourses.filter(c => c.domain === selectedDomain && !usedIds.has(c.id)).slice(0, 6);
      if (domainCrs.length > 0) {
        lanes.push({
          title: `Trending in ${selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)}`,
          icon: Flame,
          color: "text-orange-500",
          courses: domainCrs
        });
        domainCrs.forEach(c => usedIds.add(c.id));
      }
    }

    // 4. Just added / Top Rated (Fallback)
    const topRated = processedCourses.filter(c => !usedIds.has(c.id)).slice(0, 8);
    if (topRated.length > 0) {
      lanes.push({
        title: "Top Rated Courses",
        icon: Award,
        color: "text-blue-500",
        courses: topRated
      });
    }

    return lanes;
  }, [profile, preferences, insights, categoryMap, processedCourses, selectedDomain]);

  const filteredCourses = useMemo(() => {
    // Search Mode: Filter across ALL processed courses
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const results = processedCourses.filter(course => {
        return (
          course.title?.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.level?.toLowerCase().includes(query) ||
          (course.skills && course.skills.some(skill => skill.toLowerCase().includes(query)))
        );
      });
      // Temporary debug log
      console.log("SearchQuery:", searchQuery);
      console.log("FilteredCourses:", results);
      return results;
    }

    // PHASE 2 — FIX FILTERING (NO MIXING)
    if (!activeInterest || activeInterest === 'All') return [];
    
    return domainCourses.filter(course => course.category === activeInterest);
  }, [activeInterest, domainCourses, searchQuery, processedCourses]);

  if (!coursesData || coursesData.length === 0) {
    return <div className="flex justify-center items-center h-64 text-lg font-bold text-gray-500">Loading courses...</div>;
  }

  try {
  return (
    <div className="font-sans pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* TOP STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-border">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl font-bold text-sm sm:text-base">
            <Flame className="w-5 h-5 text-orange-500" /> {streakCount} Days Streak
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl font-bold text-sm sm:text-base">
            <Award className="w-5 h-5 text-green-500" /> Complete Profile 100%
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Courses</h1>
          
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl overflow-x-auto scrollbar-hide">
             {['Explore', 'Ongoing', 'Certificates'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab 
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800'
                   }`}
                >
                   {tab}
                </button>
             ))}
          </div>
        </div>
      </div>

      {activeTab === 'Explore' && (
        <>
          {/* CONTINUE LEARNING */}
          {continueCourses.length > 0 && !searchQuery && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-indigo-500" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {continueCourses?.length > 0 ? (
                continueCourses.map(course => (
                <div key={`continue-${course.id}`} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-indigo-100 dark:border-indigo-900/30 flex flex-col h-full relative overflow-hidden group cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">{course.category}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{course.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                      <span>Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{course.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${course.progressPercentage}%` }}></div>
                    </div>
                    <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                      <PlayCircle className="w-4 h-4" /> Continue
                    </button>
                  </div>
                </div>
              ))) : (
                <div className="col-span-full text-center text-gray-500">No ongoing courses available</div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED COURSES */}
        {completedCourses?.length > 0 && !searchQuery && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" /> Completed Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {completedCourses?.length > 0 ? (
                completedCourses.map(course => (
                <div key={`completed-${course.id}`} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 dark:border-green-900/30 flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{course.description}</p>
                  
                  <div className="mt-auto">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `100%` }}></div>
                    </div>
                    <button 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors text-sm"
                    >
                      Review Course
                    </button>
                  </div>
                </div>
              ))) : (
                <div className="col-span-full text-center text-gray-500">No completed courses</div>
              )}
            </div>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="mb-2">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses by title or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-border bg-white dark:bg-gray-800 text-text outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all"
            />
          </div>

        {processedCourses.length === 0 && (
          <div className="text-center text-gray-500 my-12">
            No courses available. Reloading...
          </div>
        )}

          {/* SWIMLANES (Netflix Style) */}
          <div className="flex flex-col gap-10 mb-12">
            {searchQuery.trim() !== '' ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-500" /> Search Results for "{searchQuery}"
                </h2>
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full relative overflow-hidden group cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-100 dark:border-purple-800">{course.category}</span>
                            {course.status === 'completed' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>}
                            {course.status === 'in-progress' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> {course.progressPercentage}%</span>}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{course.level}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{course.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-purple-500" /> {course.duration}
                          </span>
                          <button className="px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-xl transition-colors text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-border shadow-sm">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 max-w-md mx-auto text-lg font-bold">No matching courses found.</p>
                    <p className="text-gray-400 mt-2 text-sm">Try using different keywords or check your spelling.</p>
                  </div>
                )}
              </div>
            ) : (
              swimlanes.map((lane, idx) => (
                <div key={idx} className="relative group animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2 px-2">
                    <lane.icon className={`w-6 h-6 ${lane.color}`} /> {lane.title}
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {lane.courses.map(course => (
                      <div 
                        key={course.id} 
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="snap-start shrink-0 w-80 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative overflow-hidden cursor-pointer group/card hover:-translate-y-1"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform origin-left scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">{course.category}</span>
                            {course.status === 'completed' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{course.level}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover/card:text-purple-600 transition-colors">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-purple-500" /> {course.duration}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover/card:bg-purple-500 group-hover/card:text-white transition-colors">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}

      {activeTab === 'Ongoing' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           {continueCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {continueCourses.map(course => (
                   <div key={`ongoing-${course.id}`} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-indigo-100 dark:border-indigo-900/30 flex flex-col h-full relative overflow-hidden group cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                     <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800 mb-4 self-start">{course.category}</span>
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                     <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{course.description}</p>
                     <div className="mt-auto">
                       <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                         <span>Progress</span>
                         <span className="text-indigo-600 dark:text-indigo-400">{course.progressPercentage}%</span>
                       </div>
                       <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
                         <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: `${course.progressPercentage}%` }}></div>
                       </div>
                       <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                         <PlayCircle className="w-4 h-4" /> Continue Learning
                       </button>
                     </div>
                   </div>
                 ))}
              </div>
           ) : (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <PlayCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Ongoing Courses</h3>
                <p className="text-gray-500 mb-6">Start a course from the Explore tab to see it here.</p>
                <button onClick={() => setActiveTab('Explore')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                   Explore Courses
                </button>
             </div>
           )}
        </div>
      )}

      {activeTab === 'Certificates' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           {completedCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {completedCoursesList.map(course => {
                    const issueDate = course.cert?.completedAt ? new Date(course.cert.completedAt).toLocaleDateString() : "Recently";

                    return (
                       <div key={`cert-${course.id}`} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-900/30 flex flex-col h-full relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="w-24 h-24 text-yellow-500" />
                         </div>
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                               <Award className="w-6 h-6 text-yellow-500" />
                               <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Verified Certificate</span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">Issued on: {issueDate}</p>
                            
                            <button 
                              onClick={() => navigate(`/certificate/${course.id}`)}
                              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <FileText className="w-5 h-5" /> View Certificate
                            </button>
                         </div>
                       </div>
                    );
                 })}
              </div>
           ) : (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Award className="w-16 h-16 text-yellow-300 dark:text-yellow-600/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Certificates Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Complete a course 100% to unlock your professional, industry-grade certificate.</p>
                <button onClick={() => setActiveTab('Explore')} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors">
                   Find a Course
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error("MyCourses crash:", error);
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
        <p className="text-gray-500 mb-6">We encountered an error loading your courses. Please try again later.</p>
      </div>
    );
  }
}
