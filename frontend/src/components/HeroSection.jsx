import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
        <Sparkles className="w-4 h-4" />
        <span>The Future of Career Intelligence</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-8">
        Unlock Your Potential with <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block pb-2 mt-2">AI Intelligence</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-12 leading-relaxed">
        Upload your resume, perfectly match with top roles, and ace your preparation with our real-time speech and emotion analytics engine.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link to="/signup" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
          Get Started for Free <ArrowRight className="w-5 h-5" />
        </Link>
        <button 
          onClick={() => {
            localStorage.setItem('isDemo', 'true');
            window.location.href = '/dashboard';
          }} 
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-8 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          Try Interactive Demo
        </button>
      </div>
    </section>
  );
}
