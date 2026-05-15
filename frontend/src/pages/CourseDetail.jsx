import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ChevronLeft, Award, PlayCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { coursesData } from '../data/coursesData';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Need to be careful with types since courseId is string
  const course = coursesData.find(c => String(c.id) === String(courseId));

  const [expandedModule, setExpandedModule] = useState(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-500 mb-6">The course you are looking for does not exist.</p>
          <button 
            onClick={() => navigate('/my-courses')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl transition-colors hover:bg-primary/90"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Calculate if we have saved progress
  let progressPercentage = 0;
  let status = 'Not Started';
  try {
    const stored = localStorage.getItem(`progress_${course.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.isCompleted) {
        progressPercentage = 100;
        status = 'Completed';
      } else if (parsed.completedModules && parsed.completedModules.length > 0) {
        progressPercentage = Math.round((parsed.completedModules.length / (course.modules?.length || 8)) * 100);
        status = 'In Progress';
      }
    }
  } catch(e) {}

  return (
    <div className="font-sans pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-in fade-in zoom-in-95 duration-500 mt-8">
      <button 
        onClick={() => navigate('/my-courses')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium mb-6 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Courses
      </button>

      {/* Course Header Info */}
      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-1.5 bg-primary/10 text-primary dark:bg-primary/20 rounded-xl text-sm font-bold uppercase tracking-wider">
              {course.category}
            </span>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
              {course.level}
            </span>
          </div>
          {status !== 'Not Started' && (
             <span className={`px-4 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />} 
                {status === 'Completed' ? 'Completed' : `${progressPercentage}% Complete`}
             </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 relative z-10 leading-tight">
          {course.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl relative z-10 leading-relaxed">
          {course.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Duration</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{course.duration}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <BookOpen className="w-6 h-6 text-purple-500 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Modules</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{course.modules?.length || 0} Modules</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-2">
            <Award className="w-6 h-6 text-yellow-500 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Certification</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Certificate of Completion included</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4">
          <button 
            onClick={() => navigate(`/course/${course.id}`)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white font-extrabold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <PlayCircle className="w-6 h-6" /> {status === 'Not Started' ? 'Start Learning' : 'Continue Learning'}
          </button>
        </div>
      </div>

      {/* Modules Preview List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Modules Overview</h2>
        <div className="space-y-3">
          {course.modules && course.modules.map((module, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:border-primary/50">
              <button 
                onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className="w-10 h-10 shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pr-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{module.title}</h3>
                </div>
                <div className="shrink-0 text-gray-400">
                  {expandedModule === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              {/* Collapsed Preview Details */}
              {expandedModule === index && (
                <div className="px-5 pb-5 pt-0 ml-14 animate-in slide-in-from-top-2">
                   <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        In this module, you will cover key concepts, practical tasks, and real-world examples.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                         <BookOpen className="w-4 h-4" /> Contains {module.sections?.length || 0} Learning Sections
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 italic">Curriculum is being prepared for this course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
