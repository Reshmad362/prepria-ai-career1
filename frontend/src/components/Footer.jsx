import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Instagram, Github, Linkedin, Youtube, Send, Mail, Phone, Building2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function Footer({ onOpenPartnerModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const quickLinks = [
    { name: 'Features', path: '#features' },
    { name: 'How It Works', path: '#how-it-works' },
    { name: 'Modules', path: '#modules' },
    { name: 'Why PREPRIA', path: '/why-us' },
    { name: 'Resources & Guides', path: '/resources' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const platformModules = [
    { name: 'ATS Resume Intelligence', path: '/resume-upload' },
    { name: 'AI Mock Interviews', path: '/role-interviews' },
    { name: 'Career Roadmaps', path: '/career-roadmap' },
    { name: 'Courses & Certification', path: '/my-courses' },
    { name: 'Job Recommendations', path: '/jobs' },
    { name: 'Progress Analytics', path: '/progress' },
  ];

  const handleLinkClick = (path, e) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      const targetId = path.substring(1);
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${path}`);
      }
    }
  };

  return (
    <footer className="w-full bg-[#0B0D10] text-white border-t border-white/[0.08] pt-16 pb-12 font-manrope mt-auto relative shrink-0 transition-colors selection:bg-[#FF6B00] selection:text-white">
      
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B00]/[0.03] rounded-full blur-[140px] pointer-events-none -z-10 overflow-hidden" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/[0.02] rounded-full blur-[120px] pointer-events-none -z-10 overflow-hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Main Grid: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 w-full">
          
          {/* LEFT SIDE: Brand & Navigation Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            
            {/* 1. Brand & Social Column */}
            <div className="space-y-5 sm:col-span-1">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E05D00] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform">
                  P
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-manrope text-xl font-extrabold tracking-tight text-white">PREPRIA</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#FF6B00] font-extrabold">Career Intelligence</span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                PREPRIA is an intelligent career acceleration platform helping students prepare smarter, perform better, and progress faster.
              </p>

              {/* Social Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 2. Quick Links Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-manrope">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
                {quickLinks.map((item, idx) => (
                  <li key={idx}>
                    {item.path.startsWith('#') ? (
                      <a 
                        href={item.path}
                        onClick={(e) => handleLinkClick(item.path, e)} 
                        className="hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#FF6B00]/40" />
                        {item.name}
                      </a>
                    ) : (
                      <Link 
                        to={item.path} 
                        className="hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#FF6B00]/40" />
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Platform & Support Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-manrope">
                  Platform
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
                  {platformModules.map((item, idx) => (
                    <li key={idx}>
                      <Link 
                        to={item.path} 
                        className="hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#FF6B00]/40" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Campus/College Callback Form (5 cols) */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/[0.08] rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Colleges &amp; Universities</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-manrope">
                Partner with PREPRIA
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Empower your students with AI-driven mock interviews, ATS resume diagnostics, and real-time placement readiness tracking.
              </p>
            </div>

            {submitted ? (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Callback Requested Successfully!</p>
                  <p className="text-emerald-300/80">Our institutional partnerships team will connect with you within 24 business hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Institution / Work Email *
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. placement@university.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Institution Name &amp; Message
                  </label>
                  <textarea 
                    name="message" 
                    rows="2"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your campus placement requirements..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>Request Institutional Callback</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onOpenPartnerModal && (
                    <button
                      type="button"
                      onClick={onOpenPartnerModal}
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Institutional Deck
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Direct Contact Row */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                <a href="mailto:partnerships@prepria.com" className="hover:text-white transition-colors">
                  partnerships@prepria.com
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                <a href="tel:+918000000000" className="hover:text-white transition-colors">
                  +91 (800) PREPRIA
                </a>
              </span>
            </div>

          </div>

        </div>

        {/* BOTTOM ROW: Copyright & Legal */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} PREPRIA. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <Link to="/why-us" className="hover:text-[#FF6B00] transition-colors">Why PREPRIA</Link>
            <Link to="/resources" className="hover:text-[#FF6B00] transition-colors">Resources</Link>
            <Link to="/contact" className="hover:text-[#FF6B00] transition-colors">Privacy &amp; Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
