import React from 'react';
import { Building2, GraduationCap, Users2, BarChart2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CollegeSection({ onOpenPartnerModal }) {
  const institutionalFeatures = [
    {
      icon: Users2,
      title: 'Batch-Wide Placement Readiness',
      desc: 'Track thousands of students across departments with standardized AI mock evaluations and readiness scores.',
    },
    {
      icon: BarChart2,
      title: 'TPO Intelligence Dashboard',
      desc: 'Real-time cohort telemetry showing skill gaps, ATS score distribution, and hiring-readiness benchmarks.',
    },
    {
      icon: ShieldCheck,
      title: 'Automated Placement Drives',
      desc: 'Conduct automated pre-placement screening rounds tailored to visiting recruiters and specific company criteria.',
    },
    {
      icon: GraduationCap,
      title: 'Measurable Placement Rate Boost',
      desc: 'Equip students with verified credentials and structured practice that demonstrably improves campus placement rates.',
    },
  ];

  return (
    <section id="for-colleges" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900/60 dark:to-slate-950 border-y border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 dark:border-orange-900/40">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus & Institutional Synergy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Transform Your College Placement Cell with AI
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              Partner with PREPRIA to provide your entire student body with institutional-grade career readiness tools, detailed department analytics, and measurable hiring outcomes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onOpenPartnerModal}
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05D00] text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#FF6B00]/20 hover:shadow-lg hover:shadow-[#FF6B00]/30 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Partner with PREPRIA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenPartnerModal}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Request College Demo</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center font-bold">
                  TPO
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                    Placement Officer Dashboard
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Live Campus Placement Telemetry
                  </p>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    <span>Batch Readiness Rate</span>
                    <span className="text-[#FF6B00]">87% Ready</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF6B00] h-full rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    <span>Mock Interview Completion</span>
                    <span className="text-emerald-600 dark:text-emerald-400">92%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automated reports generated for CS, IS, ECE, and MBA batches</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {institutionalFeatures.map((item, idx) => {
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
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
