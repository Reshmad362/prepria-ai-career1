import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Play } from 'lucide-react';

export default function FinalCTA() {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    localStorage.setItem('isDemo', 'true');
    navigate('/dashboard');
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl bg-gradient-to-br from-[#18181B] via-[#0E0E11] to-[#111214] border border-orange-500/20 p-8 sm:p-14 lg:p-20 text-center text-white shadow-2xl overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF6B00]/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF8533]/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Step Confidently Into Your Future</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
              Ready to Accelerate Your Career Journey?
            </h2>

            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Get instant ATS resume feedback, practice adaptive AI mock interviews, and unlock personalized roadmaps today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto bg-[#FF6B00] hover:bg-[#E05D00] text-white px-9 py-4 rounded-xl font-bold text-base shadow-xl shadow-[#FF6B00]/30 hover:shadow-2xl hover:shadow-[#FF6B00]/40 hover:-translate-y-0.5 transition-all"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={handleDemoClick}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base backdrop-blur-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
                <span>Try Live Demo</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free Basic Tier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>50+ Roles Supported</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
