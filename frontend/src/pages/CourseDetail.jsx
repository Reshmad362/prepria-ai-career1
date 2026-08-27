import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, ChevronLeft, Award, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle2, Target, Zap, ShieldCheck, ArrowRight, 
  ExternalLink, Layers, Code2, Check, Sparkles, AlertTriangle, Video, HelpCircle
} from 'lucide-react';
import { coursesData } from '../data/coursesData';
import { getCourseActionState } from '../utils/engagementService';
import { UserContext } from '../contexts/UserContext';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useContext(UserContext);
  const email = user?.email || profile?.email || localStorage.getItem('userEmail') || 'guest';
  
  const course = coursesData.find(c => String(c.id).toLowerCase() === String(courseId).toLowerCase());
  const [expandedModule, setExpandedModule] = useState(0);

  if (!course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-manrope">
        <div className="text-center bg-white dark:bg-[#111215] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/[0.08] max-w-md space-y-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Course Not Found</h2>
          <p className="text-xs text-gray-500">The requested learning curriculum with ID "{courseId}" is not available.</p>
          <button 
            onClick={() => navigate('/my-courses')}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Back to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  // Calculate Saved Progress via Central Engagement Service
  const actionState = getCourseActionState(course, email);
  const status = actionState.isCompleted ? 'Completed' : actionState.progressPercentage > 0 ? 'In Progress' : 'Not Started';
  const modulesList = Array.isArray(course.modules) ? course.modules : [];
  const totalItemsCount = modulesList.reduce((acc, m) => acc + (m.items?.length || 0), 0);

  const getItemIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-3.5 h-3.5 text-primary" />;
      case 'READING': return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
      case 'CODE': return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'CASE_STUDY': return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      case 'PRACTICAL': return <Target className="w-3.5 h-3.5 text-purple-500" />;
      case 'QUIZ': return <HelpCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <BookOpen className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/my-courses')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Learning Hub
      </button>

      {/* Course Hero Banner */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary text-xs font-extrabold uppercase tracking-wider border border-orange-200 dark:border-orange-900/30">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700">
              {course.level}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status !== 'Not Started' && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                status === 'Completed' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200' 
                  : 'bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200'
              }`}>
                {status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{status === 'Completed' ? 'Completed & Certified' : `${actionState.progressPercentage}% In Progress`}</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            {course.description}
          </p>
        </div>

        {/* Course Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Duration</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{course.duration} ({course.estimatedHours || '20 Hours'})</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Curriculum</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{modulesList.length} Modules • {totalItemsCount} Lessons</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Final Assessment</span>
            <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-1">Passing: {course.passingScore || 70}%</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Certification</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">300 DPI PDF Certificate</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate(`/course/${course.id}?item=${actionState.targetItemId || ''}`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primaryHover text-white text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all cursor-pointer"
          >
            <PlayCircle className="w-5 h-5" />
            <span>{actionState.buttonLabel}</span>
          </button>

          {actionState.isCompleted && (
            <button 
              onClick={() => navigate(`/certificate/${course.id}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-400 text-sm font-bold transition-all cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>View Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Skills & Career Relevance (2-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Skills You'll Build */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Skills You'll Build
              </h3>
              <p className="text-xs text-gray-500">Verified competencies mapped to your roadmap</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {course.skillsGained?.map((sk, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{sk}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: Career Relevance */}
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Career Relevance
              </h3>
              <p className="text-xs text-gray-500">Target roles benefiting from this curriculum</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {course.careerRoles?.map((role, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-xs font-bold"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Guided Modules Breakdown */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Guided Modules &amp; Learning Journey
            </h2>
            <p className="text-xs text-gray-500">Every module contains multiple interactive lessons, reading guides, code/case examples, practice, and knowledge checks</p>
          </div>
        </div>

        <div className="space-y-3">
          {modulesList.map((module, idx) => {
            const isCompleted = (actionState.unlockedModuleIndices || []).includes(idx + 1);
            const isExpanded = expandedModule === idx;
            const items = Array.isArray(module.items) ? module.items : [];

            return (
              <div 
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all"
              >
                <div 
                  onClick={() => setExpandedModule(isExpanded ? null : idx)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        MODULE {idx + 1} • {items.length} LESSONS
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                        {module.title || `Module ${idx + 1}`}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-bold">{items.length} items</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800/80 space-y-3 text-xs">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      {module.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      {items.map((item, itIdx) => (
                        <div key={itIdx} className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {getItemIcon(item.type)}
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{item.title}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.type} • {item.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Capstone Project / Final Assessment Preview */}
      {course.capstoneProject && (
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-900/30 text-[10px] font-extrabold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Capstone Project Deliverable</span>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            {course.capstoneProject.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {course.capstoneProject.description}
          </p>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Project Requirements:</span>
            {course.capstoneProject.requirements?.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Resources */}
      {course.externalResources?.length > 0 && (
        <div className="bg-gray-50/70 dark:bg-gray-900/30 rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-gray-800 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
            Want to Explore Further? (Optional Enrichment)
          </span>
          <p className="text-xs text-gray-500">
            PREPRIA covers the core learning path. These external links can help you go deeper into specific documentation standards.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {course.externalResources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">{res.provider} • External</span>
                  <span className="font-bold text-gray-900 dark:text-white block mt-0.5">{res.title}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
