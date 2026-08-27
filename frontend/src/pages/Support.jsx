import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  Search, ChevronDown, CheckCircle, Clock, AlertCircle, 
  MessageSquare, LifeBuoy, ThumbsUp, ThumbsDown, Plus, Bot, 
  FileText, Video, Target, ArrowLeft, Send, Sparkles, ArrowRight, 
  BookOpen, Briefcase, Map, ShieldCheck, HelpCircle, Check, 
  ExternalLink, Layers, RefreshCw, X, User 
} from 'lucide-react';
import { 
  SUPPORT_CATEGORIES, 
  KNOWLEDGE_ARTICLES, 
  resolveSupportIntent 
} from '../utils/supportKnowledgeBase';
import { logActivity } from '../utils/activityLogger';

const SUGGESTED_PROMPTS = [
  "Why is my ATS score low?",
  "What should I improve before my next interview?",
  "What skills am I missing for my target role?",
  "Explain my career roadmap.",
  "What should I learn next?"
];

export default function Support() {
  const navigate = useNavigate();
  const { profile, preferences } = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all categories
  const [openAccordion, setOpenAccordion] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Ticket Form State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('All');
  const [ticketForm, setTicketForm] = useState({ title: '', desc: '', category: 'Technical Bug' });

  // Persistent Tickets
  const mockInitialTickets = [
    { id: 'TKT-9201', title: 'Resume PDF formatting extraction query', status: 'Resolved', date: '14 Aug 2026', category: 'Resume & ATS', desc: 'Resolved after switching to standard single-column PDF export.' },
    { id: 'TKT-8442', title: 'Audio permission configuration for mock interview', status: 'In Progress', date: '16 Aug 2026', category: 'Interview Preparation', desc: 'Checking browser microphone permissions on Chrome.' }
  ];

  const [userTickets, setUserTickets] = useState(() => {
    const saved = localStorage.getItem("userSupportTickets");
    return saved ? JSON.parse(saved) : mockInitialTickets;
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingAi(true);
    setTimeout(() => {
      const result = resolveSupportIntent({
        query: searchQuery,
        userProfile: profile || {},
        preferences: preferences || {}
      });
      setAiResult(result);
      setIsSearchingAi(false);
      setSelectedCategory(null);
    }, 400);
  };

  const handlePromptClick = (prompt) => {
    setSearchQuery(prompt);
    setIsSearchingAi(true);
    setTimeout(() => {
      const result = resolveSupportIntent({
        query: prompt,
        userProfile: profile || {},
        preferences: preferences || {}
      });
      setAiResult(result);
      setIsSearchingAi(false);
      setSelectedCategory(null);
    }, 300);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.desc) return;

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketForm.title,
      status: 'Open',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: ticketForm.category,
      desc: ticketForm.desc
    };

    const updated = [newTicket, ...userTickets];
    setUserTickets(updated);
    localStorage.setItem("userSupportTickets", JSON.stringify(updated));
    setIsTicketModalOpen(false);
    setTicketForm({ title: '', desc: '', category: 'Technical Bug' });

    logActivity({
      type: "support_ticket_created",
      title: "Support Ticket Raised",
      description: newTicket.title,
      status: "success"
    });
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'Map': return <Map className="w-5 h-5 text-primary" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-rose-500" />;
      default: return <LifeBuoy className="w-5 h-5 text-primary" />;
    }
  };

  // Filtered FAQs for search / category views
  const displayArticles = selectedCategory
    ? KNOWLEDGE_ARTICLES.filter(a => a.categoryId === selectedCategory.id)
    : searchQuery && !aiResult
    ? KNOWLEDGE_ARTICLES.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.keywords.some(k => k.includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredTickets = ticketFilter === 'All'
    ? userTickets
    : userTickets.filter(t => t.status === ticketFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* ==================================================
          1. HERO SEARCH & CAREER POSITIONING
      ================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111215] via-[#1A1C24] to-[#111215] text-white p-8 sm:p-12 shadow-xl border border-white/[0.06]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>PREPRIA Career Support</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            How can PREPRIA help you today?
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mb-6">
            Ask a question, explore common answers, or get personalized guidance directly from your resume and career data.
          </p>

          {/* Glowing Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full relative group mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 sm:pl-14 pr-28 sm:pr-32 py-4 rounded-2xl bg-white dark:bg-[#16181F] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm placeholder:text-gray-400 transition-all font-medium"
              placeholder="Ask PREPRIA anything about your career, ATS score, interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSearchingAi || !searchQuery.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 sm:px-6 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50"
            >
              {isSearchingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Suggested:</span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-medium border border-white/10 hover:border-primary/40 transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ==================================================
          2. UNIVERSAL AI ASSISTANT RESULT CARD (WHEN ACTIVE)
      ================================================== */}
      {aiResult && (
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-5 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  PREPRIA Career Assistant
                </h3>
                <span className="text-[11px] text-gray-400">Contextual answer for: "{aiResult.query}"</span>
              </div>
            </div>
            <button 
              onClick={() => setAiResult(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Context Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-semibold">
              Target: <strong className="text-gray-900 dark:text-white">{aiResult.userSnapshot.targetRole}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-semibold">
              ATS Score: <strong className="text-primary">{aiResult.userSnapshot.atsScore}/100</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-semibold">
              Experience: <strong className="text-gray-900 dark:text-white">{aiResult.userSnapshot.experience}</strong>
            </span>
          </div>

          {/* AI Response Text */}
          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed space-y-2">
            <p>{aiResult.response}</p>
          </div>

          {/* Contextual Action Buttons & Feedback */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recommended Next:</span>
              {aiResult.actions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (act.action === 'ticket') {
                      setIsTicketModalOpen(true);
                    } else if (act.route) {
                      navigate(act.route);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    act.primary
                      ? 'bg-primary text-white hover:bg-primaryHover shadow-xs'
                      : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {act.label} →
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Was this helpful?</span>
              <button 
                onClick={() => setFeedbackGiven({ ...feedbackGiven, [aiResult.query]: 'yes' })}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${feedbackGiven[aiResult.query] === 'yes' ? 'bg-emerald-50 text-emerald-600 border-emerald-300 font-bold' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setFeedbackGiven({ ...feedbackGiven, [aiResult.query]: 'no' })}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${feedbackGiven[aiResult.query] === 'no' ? 'bg-rose-50 text-rose-600 border-rose-300 font-bold' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          3. 6 SUPPORT CATEGORY CARDS
      ================================================== */}
      {!selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Explore Support by Category
              </h2>
              <p className="text-xs text-gray-500">Browse topic-specific guides, diagnostic frameworks, and FAQs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORT_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setAiResult(null);
                }}
                className="p-6 rounded-3xl bg-white dark:bg-[#111215] border border-gray-200 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
                  <span className="text-[11px] font-bold text-gray-400">{cat.articleCount} articles &amp; FAQs</span>
                  <span className="font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          4. CATEGORY FAQ DETAILS VIEW (WHEN SELECTED)
      ================================================== */}
      {selectedCategory && (
        <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Categories
            </button>
            <span className="text-xs font-bold text-gray-400">
              {displayArticles.length} Articles
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${selectedCategory.bgColor} flex items-center justify-center`}>
                {getCategoryIcon(selectedCategory.iconName)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {selectedCategory.name} Support
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedCategory.description}</p>
              </div>
            </div>
          </div>

          {/* Expandable Accordion Articles */}
          <div className="space-y-3">
            {displayArticles.map((art) => {
              const isOpen = openAccordion === art.id;
              return (
                <div 
                  key={art.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : art.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white pr-4">
                      {art.question}
                    </span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-orange-50 text-primary' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-gray-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                      <p>{art.answer}</p>
                      {art.actionRoute && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate(art.actionRoute)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            <span>{art.actionText || 'Open Related Module'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================
          5. TECHNICAL SUPPORT & TICKET TRACKER
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Support Tickets &amp; Assistance
            </h2>
            <p className="text-xs text-gray-500">Can't find what you need? Raise a direct ticket for our team</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>
        </div>

        {/* Ticket Filter Tabs */}
        <div className="flex items-center gap-2">
          {['All', 'Open', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setTicketFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ticketFilter === st
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {filteredTickets.map((tkt) => (
            <div 
              key={tkt.id}
              className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm">{tkt.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {tkt.category}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{tkt.desc}</p>
                <span className="text-[10px] text-gray-400 block">{tkt.id} • Opened on {tkt.date}</span>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  tkt.status === 'Resolved'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800/40'
                    : tkt.status === 'In Progress'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800/40'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800/40'
                }`}>
                  {tkt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          RAISE TICKET MODAL
      ================================================== */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-manrope">
          <div className="bg-white dark:bg-[#16181F] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 dark:border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Raise a Support Ticket
                </h3>
                <p className="text-xs text-gray-500">
                  Our career support specialists will review and assist within 24 hours.
                </p>
              </div>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject / Summary <span className="text-primary">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  placeholder="e.g. Resume PDF parsing formatting issue"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Support Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option>Resume &amp; ATS</option>
                  <option>Interview Preparation</option>
                  <option>Career Roadmap</option>
                  <option>Learning &amp; Courses</option>
                  <option>Job &amp; Role Matching</option>
                  <option>Technical Bug / Account</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Detailed Description <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.desc}
                  onChange={(e) => setTicketForm({ ...ticketForm, desc: e.target.value })}
                  placeholder="Provide context on what occurred so we can assist you quickly..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold shadow-md shadow-primary/25 cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
