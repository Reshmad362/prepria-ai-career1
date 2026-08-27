import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  MessageSquare, Sparkles, Search, Filter, PlayCircle, 
  CheckCircle2, Clock, Zap, Target, ArrowRight, ShieldCheck, 
  Briefcase, BarChart3, Users, Megaphone, DollarSign, Palette, 
  BrainCircuit, Database, Server, Code2, Layers, Check, X, AlertTriangle,
  Award, TrendingUp, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';
import { INTERVIEW_ROLES_CATALOG, getQuestionsForRole } from '../utils/interviewQuestionEngine';

export default function RoleInterviews() {
  const navigate = useNavigate();
  const { user, profile, preferences } = useContext(UserContext);

  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail') || 'guest';
  const targetRole = profile?.targetRole || preferences?.targetRole || 'Full Stack Developer';
  const userExperience = profile?.experience || preferences?.experienceLevel || 'Fresher';
  const userSkills = profile?.skills || user?.skills || ['React', 'JavaScript', 'Node.js', 'SQL', 'Git'];

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedRoleForSetup, setSelectedRoleForSetup] = useState(null);

  // Setup Modal Configuration
  const [interviewType, setInterviewType] = useState("Mixed");
  const [experienceLevel, setExperienceLevel] = useState(userExperience || "Fresher");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState(10);
  const [interviewMode, setInterviewMode] = useState("Mixed"); // 'Text' | 'Voice' | 'Mixed'

  // History state
  const [interviewHistory, setInterviewHistory] = useState([]);

  useEffect(() => {
    try {
      const historyKey = `interview_history_${activeEmail}`;
      const saved = JSON.parse(localStorage.getItem(historyKey) || '[]');
      setInterviewHistory(saved);
    } catch (e) {}
  }, [activeEmail]);

  // Find Recommended Role
  const recommendedRole = useMemo(() => {
    const found = INTERVIEW_ROLES_CATALOG.find(r => 
      r.name.toLowerCase() === targetRole.toLowerCase() ||
      targetRole.toLowerCase().includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().includes(targetRole.toLowerCase())
    );
    return found || INTERVIEW_ROLES_CATALOG[0];
  }, [targetRole]);

  // Compute Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalAttempts = interviewHistory.length;
    const scores = interviewHistory.map(h => h.score || 0);
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;
    const lastSession = interviewHistory[0] || null;

    return {
      targetRole: targetRole || "Not Selected",
      interviewReadiness: bestScore ? `${bestScore}%` : "78%",
      lastInterview: lastSession ? lastSession.date : "Not attempted",
      bestScore: bestScore ? `${bestScore}%` : "Not attempted"
    };
  }, [targetRole, interviewHistory]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return INTERVIEW_ROLES_CATALOG.filter(role => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        role.name.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.category.toLowerCase().includes(q) ||
        (role.skills || []).some(s => s.toLowerCase().includes(q));

      const matchesCat = selectedCategory === "All" || 
        role.category === selectedCategory || 
        role.domain?.includes(selectedCategory) ||
        (selectedCategory === "Operations" && (role.name.toLowerCase().includes("operations") || role.category === "Business" || role.category === "Operations"));
      const matchesDiff = selectedDifficulty === "All" || role.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  // Open Configuration for a role
  const handleOpenSetup = (role) => {
    setSelectedRoleForSetup(role);
    setDifficulty(role.difficulty || "Intermediate");
    setInterviewType(role.types?.[0] || "Mixed");
    setQuestionCount(role.questionCount || 10);
  };

  // Launch AI Interview
  const handleLaunchInterview = () => {
    if (!selectedRoleForSetup) return;

    const roleName = selectedRoleForSetup.name;
    const generatedQuestions = getQuestionsForRole(roleName, difficulty, interviewType, questionCount);

    const config = {
      roleId: selectedRoleForSetup.id,
      roleName: roleName,
      category: selectedRoleForSetup.category,
      difficulty: difficulty,
      interviewType: interviewType,
      experienceLevel: experienceLevel,
      questionCount: questionCount,
      interviewMode: interviewMode,
      durationMinutes: questionCount * 2.5,
      questions: generatedQuestions,
      userSkills: userSkills,
      createdAt: new Date().toISOString()
    };

    // Store in all standard keys to guarantee zero missing setup
    localStorage.setItem("activeInterviewConfig", JSON.stringify(config));
    localStorage.setItem("selectedInterviewRole", roleName);
    localStorage.setItem("selectedInterviewRound", interviewType);
    localStorage.setItem("selectedInterviewDuration", String(config.durationMinutes));

    setSelectedRoleForSetup(null);
    navigate('/practice-prerequisite');
  };

  // Get Domain Icon
  const getRoleIcon = (iconName) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-5 h-5 text-primary" />;
      case 'Server': return <Server className="w-5 h-5 text-blue-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-purple-500" />;
      case 'Cloud': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-emerald-500" />;
      case 'Users': return <Users className="w-5 h-5 text-rose-500" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-orange-500" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'Palette': return <Palette className="w-5 h-5 text-indigo-500" />;
      default: return <Briefcase className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-manrope animate-in fade-in duration-300">
      
      {/* ==================================================
          1. PAGE HEADER & SUMMARY STRIP
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-POWERED INTERVIEW PRACTICE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              AI Mock Interview Studio
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              Practice realistic interviews tailored to your target role, experience level, and career goals.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenSetup(recommendedRole)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Target Interview</span>
            </button>
          </div>
        </div>

        {/* Compact Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Target Role</span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white block mt-0.5 truncate">{summaryMetrics.targetRole}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Interview Readiness</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">{summaryMetrics.interviewReadiness}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Last Session</span>
            <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 block mt-0.5 truncate">{summaryMetrics.lastInterview}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Best Score</span>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 block mt-0.5">{summaryMetrics.bestScore}</span>
          </div>
        </div>

      </div>

      {/* ==================================================
          2. RECOMMENDED INTERVIEW BANNER
      ================================================== */}
      {recommendedRole && (
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-orange-200 dark:border-orange-900/30 shadow-xs relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                  Recommended for You
                </span>
                <span className="text-xs font-bold text-gray-400">• Based on your career profile</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {recommendedRole.name} AI Mock Interview
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {recommendedRole.description}
              </p>
            </div>

            <button
              onClick={() => handleOpenSetup(recommendedRole)}
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Recommended Interview</span>
            </button>
          </div>

          {/* Recommendation Reasons & Evaluation Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs relative z-10">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Why AI recommends this:</span>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> <span>Directly mapped to your target career role ({targetRole})</span></div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> <span>Tests competencies highlighted on your resume</span></div>
                <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> <span>Evaluates role knowledge and STAR communication</span></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Evaluated Dimensions:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Technical / Role Knowledge', 'Problem Solving', 'Communication', 'STAR Structure', 'Confidence'].map((dim, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] border border-gray-200 dark:border-gray-700">
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================
          3. EXPLORE INTERVIEW ROLES & FILTERS
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Explore Interview Roles
            </h3>
            <p className="text-xs text-gray-500">Practice for the role you want — technical or non-technical</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Technology', 'Data & Analytics', 'Human Resources', 'Marketing', 'Business', 'Finance', 'Sales', 'Design'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ==================================================
          4. COMPACT ROLE CARDS GRID
      ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map(role => (
          <div
            key={role.id}
            onClick={() => handleOpenSetup(role)}
            className="bg-white dark:bg-[#111215] rounded-3xl p-5 border border-gray-200 dark:border-white/[0.08] hover:border-primary/50 dark:hover:border-primary/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                  {getRoleIcon(role.icon)}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-extrabold uppercase tracking-wider">
                  {role.difficulty}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                  {role.category}
                </span>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 group-hover:text-primary transition-colors">
                  {role.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                  {role.description}
                </p>
              </div>

              {/* Sample Topics / Skills Preview */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(role.skills || []).slice(0, 3).map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-[10px] font-bold border border-gray-100 dark:border-gray-800">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-gray-400">
                {role.questionCount} Questions • {role.duration}
              </span>
              <span className="font-extrabold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Configure <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================
          5. ROLE INTERVIEW SETUP MODAL
      ================================================== */}
      {selectedRoleForSetup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                  {selectedRoleForSetup.category}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                  Configure {selectedRoleForSetup.name} Interview
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoleForSetup(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Interview Type */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-900 dark:text-white block uppercase tracking-wider">
                Interview Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(selectedRoleForSetup.types || ["Technical", "Behavioral", "Mixed"]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInterviewType(t)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      interviewType === t
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-900 dark:text-white block uppercase tracking-wider">
                Target Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Fresher', '1–3 Years', '3–5 Years', '5+ Years'].map(exp => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperienceLevel(exp)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      experienceLevel === exp
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Difficulty & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-900 dark:text-white block uppercase tracking-wider">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200"
                >
                  <option value="Beginner">Beginner (Foundations)</option>
                  <option value="Intermediate">Intermediate (Standard)</option>
                  <option value="Advanced">Advanced (Deep Dive)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-900 dark:text-white block uppercase tracking-wider">
                  Interview Length
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200"
                >
                  <option value={5}>Quick — 5 Questions (~12 min)</option>
                  <option value={10}>Standard — 10 Questions (~25 min)</option>
                  <option value={15}>Deep Practice — 15 Questions (~40 min)</option>
                </select>
              </div>
            </div>

            {/* 4. Personalization Summary */}
            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                Personalized from your PREPRIA Profile
              </span>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                AI will calibrate questions based on your resume skills (<strong>{userSkills.slice(0, 3).join(', ')}</strong>) while probing potential gaps in <strong>architecture &amp; problem decomposition</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRoleForSetup(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchInterview}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start AI Interview</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          6. INTERVIEW HISTORY & PROGRESSION
      ================================================== */}
      {interviewHistory.length > 0 && (
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Your Interview History &amp; Longitudinal Progress
              </h3>
              <p className="text-xs text-gray-500">Track your score improvements across practice rounds</p>
            </div>
          </div>

          <div className="space-y-2">
            {interviewHistory.map((sess, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-extrabold text-xs">
                    {sess.score}%
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white">{sess.roleName} ({sess.difficulty})</h4>
                    <span className="text-[10px] text-gray-400">{sess.date} • {sess.questionCount} Questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-emerald-600">
                    Passed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
