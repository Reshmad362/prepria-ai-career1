import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function DifferentiationSection() {
  const comparisons = [
    {
      feature: 'Real-Time Multimodal Speech & Emotion AI',
      prepria: 'Pace (WPM), confidence index, filler words & tone analysis',
      others: 'Generic text-only transcripts or no feedback',
      prepriaAdv: true,
    },
    {
      feature: 'Integrated ATS-to-Interview Loop',
      prepria: 'Resume skill gaps dynamically formulate mock interview questions',
      others: 'Disconnected standalone ATS checkers & static test links',
      prepriaAdv: true,
    },
    {
      feature: 'Adaptive Follow-Up Questions',
      prepria: 'AI probes depth based on your exact spoken responses',
      others: 'Pre-scripted linear question banks',
      prepriaAdv: true,
    },
    {
      feature: 'Institutional Placement Cell Synergy',
      prepria: 'Dedicated TPO dashboards with cohort analytics & batch drives',
      others: 'Individual consumer only with no college integration',
      prepriaAdv: true,
    },
    {
      feature: 'Milestone Career Roadmaps & Certifications',
      prepria: 'Guided track progression with verifiable completion certificates',
      others: 'Generic list of tips without verifiable progress',
      prepriaAdv: true,
    },
  ];

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 dark:border-orange-900/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The PREPRIA Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Why PREPRIA Outperforms Fragmented Tools
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            Most preparation tools solve only one small piece of the puzzle. PREPRIA connects everything into an intelligent career feedback loop.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80">
                  <th className="p-5 sm:p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-2/5">
                    Capability
                  </th>
                  <th className="p-5 sm:p-6 text-xs font-bold uppercase tracking-wider text-[#FF6B00] bg-orange-50/50 dark:bg-orange-950/20 w-3/10 border-x border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                      <span>PREPRIA Intelligence</span>
                    </div>
                  </th>
                  <th className="p-5 sm:p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-3/10">
                    Traditional / Fragmented Tools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 sm:p-6 font-bold text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="p-5 sm:p-6 bg-orange-50/30 dark:bg-orange-950/10 border-x border-orange-100 dark:border-orange-900/20 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{row.prepria}</span>
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-gray-500 dark:text-gray-400">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3.5 h-3.5" />
                        </div>
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
