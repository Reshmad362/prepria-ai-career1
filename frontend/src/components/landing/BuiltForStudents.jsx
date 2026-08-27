import React from 'react';
import { Target, Users, Zap, Shield, BookOpen, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuiltForStudents() {
  const highlights = [
    {
      icon: Shield,
      title: 'Overcome Interview Anxiety',
      description: 'Practice unlimited high-pressure simulations in a private, judgment-free AI sandbox until answering becomes second nature.',
    },
    {
      icon: Target,
      title: 'Target Your Dream Roles',
      description: 'From Software Development and Cloud Architecture to Product Management and Analytics, tailor questions precisely to specific job profiles.',
    },
    {
      icon: Zap,
      title: 'Instant Actionable Feedback',
      description: 'Never wonder where you went wrong. Get exact sentence-by-sentence feedback, STAR technique coaching, and keyword enhancements.',
    },
    {
      icon: BookOpen,
      title: 'Guided Skill Development',
      description: 'Access curated learning roadmaps and structured courses with verifiable certificates that bolster your resume credentials.',
    },
  ];

  const stats = [
    { value: '94%', label: 'Students report increased interview confidence' },
    { value: '3.2x', label: 'Faster time to secure placement offers' },
    { value: '88+', label: 'Average ATS score reached by active users' },
    { value: '50+', label: 'Specialized industry career tracks supported' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3 block">
              Empowering Future Professionals
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Designed from the Ground Up for Student Success
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              Stepping into competitive placements can feel overwhelming. PREPRIA breaks down the entire interview and preparation process into clear, manageable, and measurable milestones.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-md">
            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-4">
              Everything you need in one place
            </h4>
            <div className="space-y-3">
              {[
                'Real-time speech & emotion metrics',
                'ATS resume parser & keyword matcher',
                'Dynamic question generator with difficulty scaling',
                'Comprehensive scorecard with STAR evaluation',
                'Curated course modules and certificates',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#FF6B00] hover:bg-[#E05D00] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-[#FF6B00]/20 transition-all"
            >
              <span>Start Your Student Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Feature Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#FF6B00] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-gray-200 dark:border-slate-800">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF6B00]">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
