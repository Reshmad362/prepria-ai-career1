import React from 'react';
import { FileSearch, Mic, BrainCircuit, LineChart, Award } from 'lucide-react';

export default function FeatureStrip() {
  const features = [
    {
      icon: FileSearch,
      title: 'Smart ATS Scanner',
      desc: 'Instant keyword matching & gap analysis',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Mic,
      title: 'Adaptive Mock AI',
      desc: 'Role-specific live technical questions',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: BrainCircuit,
      title: 'Speech & Emotion',
      desc: 'Real-time tone, pace & confidence AI',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: LineChart,
      title: 'Personalized Roadmap',
      desc: 'Milestone-based preparation tracks',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Award,
      title: 'Placement Synergy',
      desc: 'Standardized campus-to-career readiness',
      color: 'from-rose-500 to-orange-500',
    },
  ];

  return (
    <section id="features" className="py-12 border-y border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/50 hover:-translate-y-1 transition-all flex flex-col items-start"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md shadow-orange-500/10 mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
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
