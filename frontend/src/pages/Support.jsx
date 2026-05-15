import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, CheckCircle, Clock, AlertCircle, 
  MessageSquare, LifeBuoy, ThumbsUp, Plus, Bot, 
  FileText, Video, Target, ArrowLeft, Send
} from 'lucide-react';

export default function Support() {
  const [activeView, setActiveView] = useState('home'); // 'home', 'chat', 'ticket', or category name like 'Resume / ATS'
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);

  // FAQ Data Structure
  const allFaqs = [
    {
      category: 'Resume / ATS',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      description: 'Parsing, formatting, and skill extraction',
      questions: [
        { id: '1', q: 'Why is my resume failing the ATS score?', a: 'Make sure you are using a standard format (PDF/DOCX) without complex graphics or columns. Our parser needs standard, machine-readable text blocks.' },
        { id: '2', q: 'How does the skill extraction work?', a: 'Our NLP model analyzes the semantic context of your bullet points to infer both hard and soft skills. Avoid simply listing keywords; wrap them in achievement statements.' },
      ]
    },
    {
      category: 'Interview Help',
      icon: <Video className="w-6 h-6 text-purple-500" />,
      description: 'Mock interviews, feedback, and scoring',
      questions: [
        { id: '5', q: 'How do adaptive interviews work?', a: 'The AI listens to your responses in real-time, tailoring subsequent follow-up questions organically based on where you lacked depth or faltered.' },
        { id: '6', q: 'Where do the questions come from?', a: 'Questions are synthesized from a live database of top-tier company interview scripts across behavioral and technical domains.' },
        { id: '7', q: 'How is the confidence score calculated?', a: 'We measure voice pitch variation, volume consistency, and speech rate to determine a relative confidence percentile.' },
        { id: '8', q: 'What counts as a filler word?', a: 'We strictly detect ums, ahs, likes, literallys, and prolonged pauses that interrupt natural syntactic flow.' },
      ]
    },
    {
      category: 'Role Matching',
      icon: <Target className="w-6 h-6 text-green-500" />,
      description: 'Algorithms and match score improvement',
      questions: [
        { id: '3', q: 'How are roles suggested for me?', a: 'Roles are suggested by mapping the vectors of your extracted resume skills against live job descriptions and current tech stack requirements.' },
        { id: '4', q: 'How can I improve my match score?', a: 'Update your "Preferences" page with specific backup roles and missing skills, and ensure your resume contains recent, quantifiable impact.' },
      ]
    }
  ];

  // Placeholder Mock Issues
  const mockIssues = [
    { id: 'TKT-9201', title: 'Resume PDF failing to extract formatting', status: 'In Progress', date: 'Oct 24, 2023', type: 'Resume Issue', desc: 'The system infinite loops when I upload my exported Canva PDF.' },
    { id: 'TKT-8442', title: 'Microphone permissions denied inherently', status: 'Open', date: 'Oct 28, 2023', type: 'Technical Bug', desc: 'Browser blocked mic access despite clearing site settings multiple times.' },
  ];

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: 'Hello! I am your AI Support Assistant. Ask me anything about resumes, interviews, or courses.' }]);
  const messagesEndRef = useRef(null);

  // Ticket Form State
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', desc: '', type: 'Technical Bug' });

  // Persistent Tickets
  const [userTickets, setUserTickets] = useState(() => {
     const saved = localStorage.getItem("userSupportTickets");
     return saved ? JSON.parse(saved) : mockIssues;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeView === 'chat') {
        scrollToBottom();
    }
  }, [chatMessages, isTyping, activeView]);

  const handleChatSubmit = (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
      setChatMessages(newMessages);
      setChatInput('');
      setIsTyping(true);
      
      const lowerInput = chatInput.toLowerCase();
      let botResponse = "I'm not sure about that. Please raise a ticket for further assistance, and a human will get back to you.";
      
      if (lowerInput.includes('resume') || lowerInput.includes('ats')) {
          botResponse = "For ATS optimization, ensure your resume is in PDF format, avoids complex tables, and uses standard bullet points. Try our Resume Upload feature for a detailed score!";
      } else if (lowerInput.includes('interview') || lowerInput.includes('star')) {
          botResponse = "When answering interview questions, use the STAR method: Situation, Task, Action, Result. Keep answers between 30 to 90 seconds and avoid filler words.";
      } else if (lowerInput.includes('course') || lowerInput.includes('learn')) {
          botResponse = "You can view your recommended courses in the 'Courses' section. They are tailored to the weak areas detected during your mock interviews.";
      }

      setTimeout(() => {
          setIsTyping(false);
          setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      }, 1500);
  };

  const handleTicketSubmit = (e) => {
      e.preventDefault();
      if (!ticketForm.title || !ticketForm.desc) return;
      
      const newTicket = {
         id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
         title: ticketForm.title,
         status: 'Open',
         date: new Date().toLocaleDateString(),
         type: ticketForm.type,
         desc: ticketForm.desc
      };

      const updated = [newTicket, ...userTickets];
      setUserTickets(updated);
      localStorage.setItem("userSupportTickets", JSON.stringify(updated));
      setIsTicketFormOpen(false);
      setTicketForm({ title: '', desc: '', type: 'Technical Bug' });
  };

  // Search Filter Logic
  const filteredFaqs = allFaqs.map(category => {
    return {
      category: category.category,
      icon: category.icon,
      questions: category.questions.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
  }).filter(category => category.questions.length > 0);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return <Badge variant="danger" className="bg-red-50 text-red-600 border-red-200">Open</Badge>;
      case 'In Progress': return <Badge variant="warning" className="bg-yellow-50 text-yellow-600 border-yellow-200">In Progress</Badge>;
      case 'Resolved': return <Badge variant="success" className="bg-green-50 text-green-600 border-green-200">Resolved</Badge>;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full px-4 sm:px-6">
      
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8 sm:p-12 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20">
                <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                How can we help you today?
            </h1>
            <p className="text-indigo-200 text-lg sm:text-xl max-w-2xl font-medium mb-8">
                Search our knowledge base, chat with our AI assistant, or raise a support ticket.
            </p>

            {/* Glowing Search Bar */}
            <div className="w-full max-w-2xl relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-14 pr-6 py-5 border-2 border-transparent rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-lg placeholder:text-gray-400"
                  placeholder="Ask anything about resumes, interviews, or courses..."
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value && activeView !== 'home') setActiveView('home');
                  }}
                />
            </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* HOME VIEW: Category Cards & Search Results */}
        {activeView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Category Cards (Hidden if searching) */}
              {!searchQuery && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                      {allFaqs.map((cat, idx) => (
                          <motion.button
                              whileHover={{ scale: 1.03, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                              key={idx}
                              onClick={() => setActiveView(cat.category)}
                              className="text-left bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all group"
                          >
                              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  {cat.icon}
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cat.category}</h3>
                              <p className="text-sm text-gray-500">{cat.description}</p>
                          </motion.button>
                      ))}

                      {/* Special AI Chat Card */}
                      <motion.button
                          whileHover={{ scale: 1.03, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveView('chat')}
                          className="text-left bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-indigo-100 dark:border-indigo-800 transition-all group relative overflow-hidden"
                      >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-xl"></div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Bot className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chat with AI</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get instant answers from our smart assistant.</p>
                      </motion.button>

                      {/* Special Ticket Card */}
                      <motion.button
                          whileHover={{ scale: 1.03, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveView('ticket')}
                          className="text-left bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all group"
                      >
                          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <AlertCircle className="w-6 h-6 text-red-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Technical Issues</h3>
                          <p className="text-sm text-gray-500">Raise a ticket or view your existing requests.</p>
                      </motion.button>
                  </div>
              )}

              {/* Search Results (Visible if searching) */}
              {searchQuery && (
                  <div className="space-y-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-indigo-500" /> Search Results
                    </h2>
                    {filteredFaqs.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                        <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">We couldn't find any articles matching your search. Try asking our AI instead!</p>
                        <Button onClick={() => { setActiveView('chat'); setSearchQuery(''); }} className="px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/30">
                            Ask AI Assistant
                        </Button>
                      </div>
                    ) : (
                      filteredFaqs.map((cat, idx) => (
                        <div key={idx} className="mb-8">
                          <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4 pl-2 flex items-center gap-2">
                              {cat.category}
                          </h3>
                          <div className="space-y-4">
                            {cat.questions.map((q) => (
                              <div key={q.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group">
                                <button 
                                  className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                                  onClick={() => setOpenAccordion(openAccordion === q.id ? null : q.id)}
                                >
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-8">{q.q}</h4>
                                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openAccordion === q.id ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                                      <ChevronDown className="w-5 h-5" />
                                  </div>
                                </button>
                                <AnimatePresence>
                                  {openAccordion === q.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3, ease: "easeInOut" }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 border-l-4 border-l-indigo-500">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mt-4">{q.a}</p>
                                        <div className="mt-6 pt-4 flex gap-4">
                                          <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                                            <ThumbsUp className="w-4 h-4" /> Helpful
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
              )}
            </motion.div>
        )}

        {/* FAQ CATEGORY VIEW */}
        {activeView !== 'home' && activeView !== 'chat' && activeView !== 'ticket' && (
            <motion.div 
              key="faq-category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <button 
                  onClick={() => setActiveView('home')}
                  className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold mb-6"
               >
                  <ArrowLeft className="w-5 h-5" /> Back to Categories
               </button>
               
               <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">{activeView} FAQs</h2>
               
               <div className="space-y-4">
                  {allFaqs.find(c => c.category === activeView)?.questions.map((q) => (
                     <div key={q.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group">
                        <button 
                          className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                          onClick={() => setOpenAccordion(openAccordion === q.id ? null : q.id)}
                        >
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors pr-8">{q.q}</h4>
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openAccordion === q.id ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                              <ChevronDown className="w-5 h-5" />
                          </div>
                        </button>
                        <AnimatePresence>
                          {openAccordion === q.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 border-l-4 border-l-indigo-500">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mt-4">{q.a}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  ))}
               </div>
            </motion.div>
        )}

        {/* AI CHAT VIEW */}
        {activeView === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
               {/* Chat Header */}
               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 flex items-center justify-between shadow-md z-10">
                  <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-inner">
                         <Bot className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="font-bold text-lg">AI Support Assistant</h2>
                         <p className="text-indigo-100 text-xs font-medium flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                         </p>
                      </div>
                  </div>
                  <button onClick={() => setActiveView('home')} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                  </button>
               </div>

               {/* Chat Messages */}
               <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 space-y-6 custom-scrollbar">
                  {chatMessages.map((msg, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                     >
                        {msg.sender === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mr-3 shadow-md">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[85%] sm:max-w-[75%] p-4 text-[15px] leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm'
                        }`}>
                           {msg.text}
                        </div>
                     </motion.div>
                  ))}
                  
                  {isTyping && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex justify-start items-end"
                      >
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mr-3 shadow-md">
                              <Bot className="w-4 h-4 text-white" />
                          </div>
                         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-12">
                             <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                             <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                             <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                         </div>
                      </motion.div>
                  )}
                  <div ref={messagesEndRef} />
               </div>

               {/* Chat Input */}
               <form onSubmit={handleChatSubmit} className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                  <input 
                     type="text" 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                     placeholder="Message AI Support..."
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isTyping}
                    className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  >
                     <Send className="w-5 h-5" />
                  </button>
               </form>
            </motion.div>
        )}

        {/* TICKET VIEW */}
        {activeView === 'ticket' && (
            <motion.div 
              key="ticket"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                 <button 
                    onClick={() => setActiveView('home')}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold"
                 >
                    <ArrowLeft className="w-5 h-5" /> Back
                 </button>
                 <Button className="flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 font-bold" onClick={() => setIsTicketFormOpen(!isTicketFormOpen)}>
                    {isTicketFormOpen ? "Cancel" : <><Plus className="w-5 h-5"/> Raise New Ticket</>}
                 </Button>
               </div>

               <AnimatePresence>
                 {isTicketFormOpen && (
                    <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                    >
                       <div className="mb-8 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                          <h3 className="font-extrabold text-2xl mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                             <AlertCircle className="w-7 h-7 text-indigo-500" /> Submit a Ticket
                          </h3>
                          <form onSubmit={handleTicketSubmit} className="space-y-5 max-w-3xl">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Issue Title</label>
                                    <input type="text" required value={ticketForm.title} onChange={e => setTicketForm({...ticketForm, title: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" placeholder="E.g. Camera not detected" />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Issue Type</label>
                                    <select value={ticketForm.type} onChange={e => setTicketForm({...ticketForm, type: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none font-medium text-gray-700 dark:text-gray-200">
                                       <option>Resume Issue</option>
                                       <option>Interview Problem</option>
                                       <option>Technical Bug</option>
                                       <option>Billing Question</option>
                                    </select>
                                 </div>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
                                <textarea required value={ticketForm.desc} onChange={e => setTicketForm({...ticketForm, desc: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-32 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none" placeholder="Describe your issue in detail. The more info, the faster we can help!"></textarea>
                             </div>
                             <div className="flex justify-end pt-2">
                                <Button type="submit" className="px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/30">Submit Ticket</Button>
                             </div>
                          </form>
                       </div>
                    </motion.div>
                 )}
               </AnimatePresence>

               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Tickets</h2>
                  <div className="space-y-4">
                    {userTickets.map((issue) => (
                      <div key={issue.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
                              {getStatusIcon(issue.status)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{issue.title}</h3>
                                 <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-bold uppercase tracking-wider">{issue.type}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-400">{issue.id} • Opened on {issue.date}</p>
                            </div>
                          </div>
                          <div className="shrink-0">
                             {getStatusBadge(issue.status)}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-[15px] leading-relaxed">
                          {issue.desc}
                        </p>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
