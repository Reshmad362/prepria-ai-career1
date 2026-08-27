import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Mic, FileText, TrendingUp, ShieldCheck, Play } from 'lucide-react';

export default function PrepriaHero() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ats'); // 'ats' | 'interview' | 'roadmap'

  const handleDemoClick = () => {
    localStorage.setItem('isDemo', 'true');
    navigate('/dashboard');
  };

  return (
    <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#FF6B00]/15 via-purple-500/10 to-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline & Badge */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] text-xs sm:text-sm font-bold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>Next-Gen Placement Readiness Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.12] mb-6">
            Prepare Smarter.<br />
            Perform Better.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#E05D00]">
              Get Hired Faster.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed mb-10">
            PREPRIA unifies <span className="font-semibold text-gray-900 dark:text-white">intelligent ATS resume scoring</span>,{' '}
            <span className="font-semibold text-gray-900 dark:text-white">adaptive AI mock interviews</span> with real-time speech & emotion analytics, and{' '}
            <span className="font-semibold text-gray-900 dark:text-white">tailored career roadmaps</span> into one cohesive preparation engine.
          </p>

          {/* Call-to-Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto bg-[#FF6B00] hover:bg-[#E05D00] text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-[#FF6B00]/25 hover:shadow-xl hover:shadow-[#FF6B00]/35 hover:-translate-y-0.5 transition-all"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={handleDemoClick}
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-4 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
              <span>Explore Live Demo</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              <span>Tailored for 50+ Industry Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Multimodal AI Evaluation</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Product Preview */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl overflow-hidden">
            
            {/* Preview Window Header / Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 py-4 bg-gray-50/70 dark:bg-slate-900/90 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-bold uppercase tracking-wider text-gray-400">PREPRIA Workspace Preview</span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 bg-gray-200/60 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('ats')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ats'
                      ? 'bg-white dark:bg-slate-900 text-[#FF6B00] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ATS Analyzer</span>
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'interview'
                      ? 'bg-white dark:bg-slate-900 text-[#FF6B00] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>AI Mock Interview</span>
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'roadmap'
                      ? 'bg-white dark:bg-slate-900 text-[#FF6B00] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Career Roadmap</span>
                </button>
              </div>
            </div>

            {/* Preview Window Content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'ats' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  <div className="p-6 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Overall ATS Score</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-5xl font-black text-gray-900 dark:text-white">88</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">/ 100 • Strong Match</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target Role: Full Stack Software Engineer</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-orange-200/50 dark:border-orange-900/40">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Top Detected Strengths</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">React.js</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">FastAPI / Python</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">PostgreSQL</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Keywords & Core Competencies Match</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Action Verb & Impact Metrics Density</span>
                        <span className="text-xs font-bold text-[#FF6B00]">84%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#FF6B00] h-full rounded-full" style={{ width: '84%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-50/30 dark:bg-slate-800/20 border border-orange-200/40 dark:border-orange-900/30 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        <span className="font-bold text-gray-900 dark:text-white">AI Suggestion:</span> Add quantified accomplishments for your cloud deployment experience to increase candidate shortlist probability by 22%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'interview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Live Emotion & Confidence</span>
                    <div className="mt-3">
                      <div className="text-3xl font-black text-gray-900 dark:text-white">91%</div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">High Confidence • Composed</span>
                    </div>
                    <div className="space-y-2 mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/30 text-xs">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Pace & Cadence:</span>
                        <span className="font-bold text-gray-900 dark:text-white">138 WPM (Optimal)</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Filler Words Detected:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">2 (Minimal)</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Clarity & Structure:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">STAR Method 9.4/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">AI Question 3/5</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        "Can you explain how you handled database race conditions during high concurrent traffic in your previous project?"
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-[#FF6B00] tracking-wider">Real-Time Evaluation Summary</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        Strong technical accuracy in referencing optimistic locking and isolation levels. Clear voice modulation and direct eye contact observed throughout the response.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                  <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Phase 1: Complete</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Core Fundamentals</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Data Structures, Algorithms & System Design Basics (100%)</p>
                  </div>

                  <div className="p-5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                      <span className="text-xs font-bold text-[#FF6B00] uppercase">Phase 2: In Progress</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Live AI Mock Drills</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Role-Specific Technical & Behavioral Simulations (65%)</p>
                  </div>

                  <div className="p-5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Phase 3: Upcoming</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Final Placement Drives</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct Campus Placement Rounds & Referral Readiness</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
