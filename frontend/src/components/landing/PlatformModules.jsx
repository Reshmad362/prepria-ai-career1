import React from 'react';
import { FileText, Mic, ActivitySquare, Map, Award, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlatformModules() {
  const modules = [
    {
      icon: FileText,
      title: 'Resume Intelligence & ATS Scanner',
      desc: 'Deep NLP parsing that extracts competencies, calculates match score against job descriptions, and provides instant keyword recommendations.',
      badge: 'Core Engine',
      link: '/resume-upload',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Mic,
      title: 'Adaptive AI Mock Interviews',
      desc: 'Simulate high-stakes technical and behavioral interviews with role-specific questions that adjust dynamically based on candidate performance.',
      badge: 'Interactive AI',
      link: '/mock-interview',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: ActivitySquare,
      title: 'Speech & Emotion Telemetry',
      desc: 'Real-time multi-modal analysis tracking confidence levels, speaking cadence (WPM), filler frequency, and structured communication clarity.',
      badge: 'Telemetry',
      link: '/evaluation',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Map,
      title: 'Dynamic Career Roadmaps',
      desc: 'Personalized milestone-driven pathways bridging your existing skill profile with the exact technical requirements of target career roles.',
      badge: 'Growth Engine',
      link: '/career-roadmap',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Award,
      title: 'Course & Certification Hub',
      desc: 'Master in-demand competencies through interactive modules and earn industry-recognized verifiable credentials to showcase to recruiters.',
      badge: 'Learning Hub',
      link: '/my-courses',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Briefcase,
      title: 'Job Board & Role Matching',
      desc: 'Explore curated job listings with calculated compatibility ratings, giving you instant clarity on the best opportunities for your skill set.',
      badge: 'Placement Link',
      link: '/jobs',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <section id="modules" className="py-20 lg:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3 block">
            The PREPRIA Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            One Unified Platform. Complete Preparation Suite.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            Every tool is tightly integrated so your resume insights feed directly into your mock interview questions and your roadmap milestones.
          </p>
        </div>

        {/* 6 Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#FF6B00] transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6">
                    {mod.desc}
                  </p>
                </div>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#E05D00] group/link transition-colors pt-4 border-t border-gray-100 dark:border-slate-800/80"
                >
                  <span>Explore Module</span>
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
