import React, { useState } from 'react';
import { Instagram, Github, Linkedin, Youtube, Send, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const topJobs = [
    "Finance & Accounting", "Product Management", "Executive Roles", 
    "AI & Data Science", "Cloud Computing", "Cyber Security", "DevOps", "Electrical Engineering"
  ];

  const trending = [
    "1:1 Coding Sessions", "LinkedIn Review", "AI Mock Interview", 
    "Resume Review", "Interview Preparation", "Fast Track Courses", "Video Courses"
  ];

  const quickLinks = [
    { name: "Top Jobs", path: "#" },
    { name: "Trending", path: "#" },
    { name: "Resources", path: "/resources" },
    { name: "Why Us", path: "/why-us" },
    { name: "Contact", path: "/contact" },
    { name: "Blogs", path: "#" },
    { name: "Testimonials", path: "#" }
  ];

  const solutions = [
    "Students", "Freshers", "Job Seekers", "Educational Institutions"
  ];

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* SECTION 1: Top Jobs */}
        <div className="mb-10">
          <h3 className="text-lg font-bold mb-4 text-purple-400">Top Jobs</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {topJobs.map((job, idx) => (
              <React.Fragment key={idx}>
                <a href="#" className="hover:text-purple-400 transition-colors">{job}</a>
                {idx !== topJobs.length - 1 && <span className="text-slate-700 hidden sm:inline">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* SECTION 2: Trending */}
        <div className="mb-12 pb-12 border-b border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-purple-400">Trending</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {trending.map((item, idx) => (
              <React.Fragment key={idx}>
                <a href="#" className="hover:text-purple-400 transition-colors">{item}</a>
                {idx !== trending.length - 1 && <span className="text-slate-700 hidden sm:inline">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          
          {/* LEFT SIDE: Brand & Links */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            
            {/* SECTION 3: Brand Area */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  AI CareerPlatform
                </h2>
                <p className="text-sm text-slate-400 mt-4">
                  Empowering your career with AI-driven insights, mock interviews, and personalized role suggestions.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all"><Github className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>

            {/* SECTION 4: Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} className="hover:text-purple-400 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 5: Solutions & SECTION 6: Support */}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-6">Solutions</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  {solutions.map((item, idx) => (
                    <li key={idx}>
                      <a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-6">Support</h3>
                <div className="space-y-4 text-sm text-slate-400">
                  <a href="mailto:projectteam.1522@gmail.com" className="hover:text-purple-400 transition-colors flex items-center gap-3 cursor-pointer hover:underline">
                    <Mail className="w-4 h-4 text-purple-400" /> projectteam.1522@gmail.com
                  </a>
                  <a href="tel:+916360012760" className="hover:text-purple-400 transition-colors flex items-center gap-3 cursor-pointer hover:underline">
                    <Phone className="w-4 h-4 text-purple-400" /> 6360012760
                  </a>
                  <a href="tel:+916361288806" className="hover:text-purple-400 transition-colors flex items-center gap-3 cursor-pointer hover:underline">
                    <Phone className="w-4 h-4 text-purple-400" /> 6361288806
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: SECTION 7: Request a Call Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="text-xl font-bold text-white mb-2">Seeking personalized guidance?</h3>
              <h4 className="text-lg font-bold text-purple-400 mb-2">Request a call from our team</h4>
              <p className="text-sm text-slate-400 mb-6">
                Get help with mock interviews, resume analysis, role suggestions, and career preparation.
              </p>

              {submitted && (
                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Callback request submitted successfully
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Full name" 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    placeholder="Phone number" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="Email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <textarea 
                  name="message"
                  required
                  placeholder="Message" 
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                ></textarea>
                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Send className="w-4 h-4" /> Request Callback
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© 2026 AI CareerPlatform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
