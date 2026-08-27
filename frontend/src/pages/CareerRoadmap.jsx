import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  Map, CheckCircle2, Circle, Lock, ArrowRight, PlayCircle, Target, 
  Briefcase, ChevronRight, Sparkles, RefreshCw, Zap, Award, Layers, 
  Check, ArrowUpRight, BarChart3, AlertTriangle, BookOpen, Code2, 
  Clock, ShieldCheck, Flame, Compass, ChevronDown, CheckCheck, Filter, Users, Globe 
} from 'lucide-react';
import { computeCareerRoadmap, CAREER_DOMAINS, ROLE_DEFINITIONS } from '../utils/roadmapEngine';
import { logActivity } from '../utils/activityLogger';

export default function CareerRoadmap() {
  const navigate = useNavigate();
  const { profile, preferences, updateProfile } = useContext(UserContext);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState(profile?.targetRole || preferences?.targetRole || 'Full Stack Developer');
  const [activeDomainFilter, setActiveDomainFilter] = useState('All');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState(null);

  // Compute roadmap state dynamically
  const roadmapData = computeCareerRoadmap({
    targetRole: selectedRole,
    userSkills: profile?.skills || [],
    experienceLevel: profile?.experience || preferences?.experienceLevel || 'Fresher',
    atsScore: profile?.score || 85,
    experienceText: profile?.experience || ''
  });

  // Sync active domain tab if user opens modal
  useEffect(() => {
    if (roadmapData.careerDomain) {
      setActiveDomainFilter(roadmapData.careerDomain);
    }
  }, [roadmapData.careerDomain]);

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    if (updateProfile) {
      updateProfile({ targetRole: newRole });
    }
    setShowRoleModal(false);
    logActivity({
      type: "roadmap_role_change",
      title: "Target Role Updated",
      description: `Target set to ${newRole}`,
      status: "success"
    });
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      logActivity({
        type: "roadmap_regenerated",
        title: "Career Roadmap Regenerated",
        description: `Refreshed for ${selectedRole}`,
        status: "success"
      });
    }, 600);
  };

  const domainKeys = ['All', ...Object.keys(CAREER_DOMAINS)];

  const filteredRoles = activeDomainFilter === 'All'
    ? Object.keys(ROLE_DEFINITIONS)
    : CAREER_DOMAINS[activeDomainFilter]?.roles || Object.keys(ROLE_DEFINITIONS);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* ==================================================
          1. PERSONALIZED ROADMAP HEADER & PROFILE SUMMARY
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Career Domain: {roadmapData.careerDomain}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1.5">
              Your Career Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Personalized pathway calibrated for your resume, domain competencies, and target role.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Target Role Selector Button */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              <Target className="w-4 h-4 text-primary" />
              <span>Role: <strong>{selectedRole}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Regenerate Roadmap Button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Compact Profile Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Target Role</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block mt-0.5">
              {roadmapData.targetRole}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Experience</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block mt-0.5">
              {roadmapData.experienceLevel}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Resume Match</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {roadmapData.resumeScore}% Match
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 sm:col-span-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Readiness</span>
            <span className="text-xs sm:text-sm font-bold text-primary block mt-0.5">
              {roadmapData.overallReadiness}%
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Extracted Skills</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate block mt-0.5" title={roadmapData.strongSkills.join(' · ')}>
              {roadmapData.strongSkills.slice(0, 3).join(' · ') || 'Core Competencies'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          2. CAREER READINESS OVERVIEW (5 METRICS)
      ================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {roadmapData.metrics.map((m, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-3xl bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between ${idx === 0 ? 'col-span-2 md:col-span-1 border-orange-200 dark:border-orange-900/30' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  {m.label}
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  {m.score}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden my-2.5">
                <div 
                  className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : m.score >= 80 ? 'bg-emerald-500' : m.score >= 65 ? 'bg-primary' : 'bg-amber-500'}`}
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>

            <div>
              <span className={`text-[11px] font-bold block ${idx === 0 ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                {m.status}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 block leading-tight mt-0.5">
                {m.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================
          3. NEXT BEST ACTION (ROLE-AWARE HIGHLIGHT CARD)
      ================================================== */}
      <div className="bg-gradient-to-br from-[#111215] to-[#1C1E26] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/[0.06]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#FF6B00] text-[10px] font-extrabold uppercase tracking-wider">
            <Zap className="w-3 h-3" />
            <span>Next Best Action</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            {roadmapData.nextBestAction.title}
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed font-normal">
            {roadmapData.nextBestAction.why}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
            <span>Expected Impact: <strong className="text-emerald-400">{roadmapData.nextBestAction.impact}</strong></span>
            <span>•</span>
            <span>Estimated Time: <strong className="text-gray-300">{roadmapData.nextBestAction.time}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0 self-end sm:self-center">
          <button
            onClick={() => navigate('/mock-interview')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Start Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================================================
          4. YOUR ROADMAP (STRUCTURED MILESTONES)
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        
        {/* Roadmap Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Your Roadmap
              </h2>
              <span className="text-xs font-bold text-gray-400">
                ({roadmapData.completedCount} of {roadmapData.totalMilestones} milestones completed)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Estimated time to placement readiness: <strong className="text-primary font-bold">8–10 weeks</strong>
            </p>
          </div>

          <div className="w-full sm:w-56 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">Milestone Progress</span>
              <span className="text-primary">{roadmapData.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${roadmapData.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Sequence */}
        <div className="space-y-4">
          {roadmapData.milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';
            const isExpanded = expandedMilestone === idx || isInProgress;

            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCompleted
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30'
                    : isInProgress
                    ? 'bg-white dark:bg-gray-900/40 border-primary/40 shadow-sm ring-1 ring-primary/20'
                    : 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                }`}
              >
                {/* Milestone Top Bar */}
                <div 
                  onClick={() => setExpandedMilestone(expandedMilestone === idx ? null : idx)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.01] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Status Badge Icon */}
                    <div className="mt-0.5 sm:mt-0">
                      {isCompleted ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center font-bold">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-primary border border-orange-200 dark:border-orange-800/40 flex items-center justify-center font-bold animate-pulse">
                          <Flame className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                          STEP {m.step} • {m.phase}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCheck className="w-3 h-3" /> Completed {m.completedDate && `• ${m.completedDate}`}
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-primary">
                            ● In Progress • {m.progress}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                        {m.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {m.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-gray-400">
                      {m.duration}
                    </span>
                    {isInProgress ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/my-courses');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primaryHover transition-all cursor-pointer"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/my-courses');
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        {isCompleted ? 'Review' : 'View Module'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800/80 space-y-4 text-xs">
                    
                    {/* Skills Checklist */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
                        Competencies in this Milestone
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.skillChecks.map((sk, sIdx) => (
                          <span 
                            key={sIdx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold ${
                              sk.completed
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {sk.completed ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3 h-3 text-gray-400" />}
                            <span>{sk.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dual Info: Why This Matters & Recommended Action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                          Why This Matters
                        </span>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {m.why}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block mb-1">
                          Recommended Action
                        </span>
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                          {m.action}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          5. SKILL GAP ANALYSIS (ROLE-SPECIFIC)
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Skill Gap Analysis
            </h2>
            <p className="text-xs text-gray-500">
              Your resume competencies compared directly against the benchmark for <strong className="text-gray-700 dark:text-gray-300">{roadmapData.targetRole}</strong> ({roadmapData.category})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. STRONG SKILLS */}
          <div className="p-5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/70 dark:border-emerald-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                ✓ Strong ({roadmapData.strongSkills.length})
              </span>
              <span className="text-[10px] font-bold text-emerald-600/80">Demonstrated</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roadmapData.strongSkills.map((sk, idx) => (
                <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{sk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. NEEDS IMPROVEMENT */}
          <div className="p-5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/70 dark:border-amber-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                → Needs Improvement ({roadmapData.skillGaps.length})
              </span>
              <span className="text-[10px] font-bold text-amber-600/80">Target for +10%</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roadmapData.skillGaps.map((sk, idx) => (
                <div key={idx} className="inline-flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-semibold">
                  <span>{sk}</span>
                  <button 
                    onClick={() => navigate('/my-courses')}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Learn →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. MISSING COMPETENCIES */}
          <div className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/70 dark:border-blue-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                + Missing ({roadmapData.missingSkills.length})
              </span>
              <span className="text-[10px] font-bold text-blue-600/80">Recommended</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roadmapData.missingSkills.map((sk, idx) => (
                <div key={idx} className="inline-flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold">
                  <span>+{sk}</span>
                  <button 
                    onClick={() => navigate('/mock-interview')}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Assess →
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ==================================================
          6. TARGET ROLE FIT & RECOMMENDED PROJECT (2-COL)
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: TARGET ROLE FIT */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                  Domain Compatibility
                </span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Target Role Fit: {roadmapData.targetRole}
                </h3>
              </div>
              <span className="text-xl font-black text-primary">
                {roadmapData.roleFit.matchPercentage}% Match
              </span>
            </div>

            {/* Dynamic Domain Dimensions */}
            <div className="space-y-2.5 pt-2">
              {roadmapData.roleFit.dimensions.map((dim, dIdx) => (
                <div key={dIdx}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-500">{dim.name}</span>
                    <span className="text-gray-900 dark:text-white">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${dIdx === 0 ? 'bg-primary' : dIdx === 1 ? 'bg-emerald-500' : dIdx === 2 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                      style={{ width: `${dim.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              {roadmapData.roleFit.summary}
            </p>
          </div>

          <button
            onClick={() => setShowRequirementsModal(true)}
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>View Role Requirements</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: RECOMMENDED PROJECT */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-900/30 uppercase tracking-wider mb-2">
              <Code2 className="w-3 h-3" /> Portfolio Accelerator
            </div>
            
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Projects to Strengthen Your Profile
            </h3>
            
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 my-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">Deliverable:</span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {roadmapData.recommendedProject.time}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {roadmapData.recommendedProject.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {roadmapData.recommendedProject.why}
              </p>
              
              <div className="flex flex-wrap gap-1 pt-1">
                {roadmapData.recommendedProject.skills.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-courses')}
            className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>View Project Architecture &amp; Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ==================================================
          7. ROADMAP INTELLIGENCE REASSURANCE BLOCK
      ================================================== */}
      <div className="p-6 rounded-3xl bg-gray-50/70 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white">
              PREPRIA Roadmap Intelligence
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dynamically calibrated across {roadmapData.careerDomain} benchmarks, resume extraction, and mock performance data.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">✓ Resume Analyzed</span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">✓ Domain Verified</span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">✓ Gaps Identified</span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">✓ Interview Integrated</span>
        </div>
      </div>

      {/* ==================================================
          DOMAIN-AWARE ROLE SELECTION MODAL
      ================================================== */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-manrope">
          <div className="bg-white dark:bg-[#16181F] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 dark:border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Select Target Career Role
                </h3>
                <p className="text-xs text-gray-500">
                  Select your exact career path to customize milestones and interview prep.
                </p>
              </div>
            </div>

            {/* Domain Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {domainKeys.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setActiveDomainFilter(domain)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeDomainFilter === domain
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Role List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredRoles.map((role) => {
                const def = ROLE_DEFINITIONS[role];
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      selectedRole === role
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-primary text-primary'
                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-extrabold">{role}</span>
                      <span className="text-[11px] text-gray-400 font-normal">{def?.category || 'Professional Track'}</span>
                    </div>
                    {selectedRole === role && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          ROLE REQUIREMENTS MODAL
      ================================================== */}
      {showRequirementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-manrope">
          <div className="bg-white dark:bg-[#16181F] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 dark:border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {selectedRole} Benchmark
                </h3>
                <p className="text-xs text-gray-500">
                  Core competencies required for placement
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Core Competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_DEFINITIONS[selectedRole]?.coreSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                <span className="font-bold text-primary block mb-0.5">Placement Strategy Advice:</span>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Focus on closing your primary skill gap ({roadmapData.skillGaps[0] || 'Core Subject Matter'}) and completing the recommended project to validate your domain capabilities before interviews.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRequirementsModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryHover transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
