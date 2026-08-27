import React, { useState } from 'react';
import { Upload, CheckCircle2, MapPin, Mic, Activity, BarChart3, Briefcase, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhatPrepriaDoes() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Upload & Parse Resume',
      tagline: 'Instant extraction of skills, projects, and work experience',
      desc: 'Our NLP parser automatically extracts all technical competencies, project metrics, education credentials, and keywords from PDF or DOCX formats with 99% accuracy.',
      icon: Upload,
      metrics: 'Parses 25+ attributes in under 2 seconds',
    },
    {
      number: '02',
      title: 'ATS Scoring & Skill Gap Analysis',
      tagline: 'See where your resume stands against real industry job descriptions',
      desc: 'Compare your resume directly with top industry requirements. PREPRIA highlights missing high-value keywords, weak action verbs, formatting flaws, and gives an actionable ATS match percentage.',
      icon: CheckCircle2,
      metrics: 'Benchmarks against 500k+ validated job posts',
    },
    {
      number: '03',
      title: 'Tailored Career Roadmap',
      tagline: 'A structured, milestone-based guide to bridge every skill gap',
      desc: 'No more generic advice. Receive an AI-generated learning pathway that prioritizes specific technologies, frameworks, and practical milestones needed for your target career role.',
      icon: MapPin,
      metrics: 'Personalized to your background & timeline',
    },
    {
      number: '04',
      title: 'AI Mock Interview Simulation',
      tagline: 'Practice with dynamic, role-aligned AI interviewers',
      desc: 'Simulate high-stakes interviews for roles in Software Engineering, Data Science, Product Management, Finance, and more. PREPRIA adapts follow-up questions dynamically based on your spoken answers.',
      icon: Mic,
      metrics: '50+ role-specific interview tracks',
    },
    {
      number: '05',
      title: 'Multimodal Speech & Emotion Analytics',
      tagline: 'Real-time assessment of tone, pace, confidence, and filler words',
      desc: 'During the interview, our computer vision and audio processing models analyze your speaking pace, eye contact, sentiment, nervousness level, and filler frequency in real-time.',
      icon: Activity,
      metrics: 'Comprehensive non-verbal & speech telemetry',
    },
    {
      number: '06',
      title: 'In-Depth Evaluation & Scorecard',
      tagline: 'Detailed STAR-method scoring and actionable improvement tips',
      desc: 'Get a thorough performance breakdown for every answer: technical correctness, communication clarity, problem-solving structure, and concrete suggestions on how to improve.',
      icon: BarChart3,
      metrics: 'Itemized answer-by-answer feedback',
    },
    {
      number: '07',
      title: 'Role Matching & Placement Success',
      tagline: 'Step into campus placement drives with verified readiness',
      desc: 'Connect your verified skills directly with campus placement opportunities, discover job openings matching your profile, and receive course certifications that prove your competence.',
      icon: Briefcase,
      metrics: 'Accelerated placement readiness pipeline',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 dark:border-orange-900/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>End-to-End Career Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            How PREPRIA Takes You from Preparation to Placement
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            A cohesive 7-step journey designed to eliminate guesswork, build unshakeable interview confidence, and maximize your career outcomes.
          </p>
        </div>

        {/* Interactive Step Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Step Selector Navigation */}
          <div className="lg:col-span-5 space-y-2.5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/80 dark:bg-orange-950/30 border-[#FF6B00] shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold transition-colors ${
                          isSelected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {step.tagline}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      isSelected ? 'text-[#FF6B00] translate-x-1' : 'text-gray-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Active Step Detailed Spotlight Card */}
          <div className="lg:col-span-7 sticky top-28">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-orange-50/30 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-orange-200/70 dark:border-slate-800 shadow-xl relative overflow-hidden">
              
              {/* Background ambient watermarks */}
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-orange-500/5 dark:text-orange-500/10 pointer-events-none select-none">
                {steps[activeStep].number}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-lg shadow-[#FF6B00]/25">
                    {React.createElement(steps[activeStep].icon, { className: 'w-7 h-7' })}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                      Step {steps[activeStep].number} of 07
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {steps[activeStep].title}
                    </h3>
                  </div>
                </div>

                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                  {steps[activeStep].desc}
                </p>

                <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700/60 mb-8 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#FF6B00] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                    {steps[activeStep].metrics}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05D00] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#FF6B00]/20 transition-all"
                  >
                    <span>Experience This Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                    className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] px-4 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Next Step →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
