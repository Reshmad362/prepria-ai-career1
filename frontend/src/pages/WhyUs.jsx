import React, { useState } from 'react';
import { Sparkles, MessageSquare, Briefcase, FileText, CheckCircle, Target, TrendingUp, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WhyUs() {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen w-full relative font-sans pt-12 pb-24">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            We come with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">AI-Powered Career Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Practice interviews, analyze resumes, track progress, and prepare smarter for your career.
          </p>
        </div>

        {/* MOCKUP CARDS SECTION (Natural Flow) */}
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 mb-20 animate-in fade-in zoom-in-95 duration-1000 delay-150">
          
          {/* Card 1: Resume ATS Analysis */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Resume Analysis</h3>
            </div>
            <div className="space-y-4">
              <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-full"></div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-5/6"></div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-4/6"></div>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                <span className="text-base font-semibold text-green-700 dark:text-green-400">ATS Score: 92%</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Mock Interview (Center - Prominent) */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-primary/20 border-2 border-primary/20 p-8 hover:-translate-y-2 transition-transform duration-300 relative lg:-mt-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-xl">AI Mock Interview</h3>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse shrink-0">LIVE</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 h-40 rounded-2xl mb-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,107,252,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
               <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
            <button onClick={() => navigate('/mock-interview')} className="mt-auto w-full py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
              Try it now <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Card 3: Career Dashboard (Right) */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Career Dashboard</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-20 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex flex-col items-center justify-center">
                <span className="font-bold text-purple-600 text-xl">Top 5%</span>
                <span className="text-xs text-purple-500/80 font-medium">Ranking</span>
              </div>
              <div className="h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex flex-col items-center justify-center">
                <span className="font-bold text-blue-600 text-xl">3</span>
                <span className="text-xs text-blue-500/80 font-medium">Job Offers</span>
              </div>
            </div>
             <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-full mb-3"></div>
             <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-2/3"></div>
          </div>

        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div 
            onClick={() => navigate('/resources')}
            title="Explore 1000+ Practice Questions"
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1000+</h4>
            <p className="text-gray-500 font-medium mb-4">Practice Questions</p>
            <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm font-bold text-primary flex items-center gap-1">
              Explore <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/role-suggestions')}
            title="Explore 50+ Career Roles"
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-14 h-14 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-7 h-7" />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</h4>
            <p className="text-gray-500 font-medium mb-4">Career Roles</p>
            <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm font-bold text-primary flex items-center gap-1">
              Explore <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/resume-upload')}
            title="Try AI-Based Resume Analysis"
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-14 h-14 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI-Based</h4>
            <p className="text-gray-500 font-medium mb-4">Resume Analysis</p>
            <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm font-bold text-primary flex items-center gap-1">
              Explore <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/progress-tracker')}
            title="View Real-time Progress Tracking"
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-14 h-14 mx-auto bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7" />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Real-time</h4>
            <p className="text-gray-500 font-medium mb-4">Progress Tracking</p>
            <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm font-bold text-primary flex items-center gap-1">
              Explore <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING HELP/CHAT CARD */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white dark:bg-gray-800 w-72 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4" /> AI Assistant
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-4">
                Hi! Welcome to AI Career Platform. Need help preparing for your next interview?
              </p>
              <button onClick={() => navigate('/mock-interview')} className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-xl transition-colors flex justify-center items-center gap-2">
                Need interview help?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
