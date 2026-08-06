import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Briefcase, MapPin, DollarSign, Search, Filter, Star, Clock, CheckCircle, ChevronDown, Zap, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobBoard = () => {
  const { user } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyStatus, setApplyStatus] = useState('idle'); // idle, applying, success

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // If user has skills in their profile/resume, use match endpoint
      let url = 'http://localhost:8000/api/jobs';
      let options = {};
      
      const userSkills = user?.skills || ['React', 'JavaScript', 'Python']; // fallback for demo
      
      if (userSkills && userSkills.length > 0) {
        url = 'http://localhost:8000/api/jobs/match';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: userSkills })
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setApplyStatus('applying');
    setTimeout(() => {
      setApplyStatus('success');
    }, 1500);
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
    setTimeout(() => setApplyStatus('idle'), 300);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
          <Briefcase className="w-10 h-10 text-primary" />
          Job Opportunities
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Discover roles tailored to your skills and career roadmap.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#121216] p-4 rounded-2xl border border-white/5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1f] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="relative">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none bg-[#1a1a1f] border border-white/10 rounded-xl py-3 px-6 pr-12 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer w-full md:w-auto"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Jobs List */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#121216] h-40 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <motion.div 
                key={job.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedJob(job)}
                className={`p-6 rounded-2xl cursor-pointer border transition-all duration-300 ${
                  selectedJob?.id === job.id 
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                  : 'bg-[#121216] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-gray-400 font-medium">{job.company}</p>
                  </div>
                  {job.matchScore && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{job.matchScore}% Match</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> {job.type}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-4">
                  {job.skills?.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="bg-white/5 text-gray-300 text-xs px-2.5 py-1 rounded-md border border-white/10">
                      {skill}
                    </span>
                  ))}
                  {job.skills?.length > 4 && (
                    <span className="bg-white/5 text-gray-500 text-xs px-2.5 py-1 rounded-md border border-white/10">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-[#121216] rounded-2xl border border-white/5">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300">No jobs found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

        {/* Job Details Sidebar (Desktop) or Modal (Mobile - simplified for now) */}
        {selectedJob && (
          <div className="lg:w-[450px] shrink-0">
            <div className="sticky top-24 bg-[#121216] rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">{selectedJob.title}</h2>
                  <p className="text-lg text-primary font-medium">{selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="lg:hidden text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#1a1a1f] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Location</span>
                  <span className="text-sm font-medium text-gray-200">{selectedJob.location}</span>
                </div>
                <div className="bg-[#1a1a1f] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Salary</span>
                  <span className="text-sm font-medium text-gray-200">{selectedJob.salary}</span>
                </div>
                <div className="bg-[#1a1a1f] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Type</span>
                  <span className="text-sm font-medium text-gray-200">{selectedJob.type}</span>
                </div>
                <div className="bg-[#1a1a1f] p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Posted</span>
                  <span className="text-sm font-medium text-gray-200">{selectedJob.postedAt}</span>
                </div>
              </div>

              {selectedJob.matchScore && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-400">Great Match! ({selectedJob.matchScore}%)</h4>
                    <p className="text-sm text-gray-400 mt-1">Your skills closely align with the requirements for this role based on your profile and resume analysis.</p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-bold text-white mb-3">About the Role</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-white mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills?.map((skill, idx) => {
                    // Check if user has this skill to highlight it
                    const userSkills = user?.skills || ['React', 'JavaScript', 'Python']; // demo fallback
                    const hasSkill = userSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                    
                    return (
                      <span 
                        key={idx} 
                        className={`text-xs px-3 py-1.5 rounded-lg border ${
                          hasSkill 
                          ? 'bg-primary/20 text-primary border-primary/30' 
                          : 'bg-[#1a1a1f] text-gray-400 border-white/10'
                        }`}
                      >
                        {skill} {hasSkill && <CheckCircle className="w-3 h-3 inline ml-1" />}
                      </span>
                    )
                  })}
                </div>
              </div>

              <button 
                onClick={() => setApplyModalOpen(true)}
                className="w-full py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                Easy Apply <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Easy Apply Modal */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              {applyStatus === 'idle' && (
                <>
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Easy Apply</h2>
                    <button onClick={closeApplyModal} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-[#1a1a1f] rounded-xl border border-white/5">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{selectedJob?.title}</h3>
                        <p className="text-sm text-gray-400">{selectedJob?.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5">Resume</label>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center text-sm">
                          <span className="text-gray-300">{user?.resumeFileName || 'Resume_2026.pdf'}</span>
                          <span className="text-primary cursor-pointer hover:underline">Change</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5">Contact Email</label>
                        <input type="email" value={user?.email || 'user@example.com'} disabled className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm" />
                      </div>
                    </div>

                    <button 
                      onClick={handleApply}
                      className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-colors"
                    >
                      Submit Application
                    </button>
                  </div>
                </>
              )}

              {applyStatus === 'applying' && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-white mb-2">Submitting Application...</h3>
                  <p className="text-gray-400">Packaging your resume and profile data.</p>
                </div>
              )}

              {applyStatus === 'success' && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Application Sent!</h3>
                  <p className="text-gray-400 mb-8">Your profile and resume have been securely sent to {selectedJob?.company}.</p>
                  <button 
                    onClick={closeApplyModal}
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors"
                  >
                    Back to Jobs
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobBoard;
