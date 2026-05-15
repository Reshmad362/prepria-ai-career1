import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Upload, Check } from 'lucide-react';

const ROLES = [
  "Business Analyst", "Product Manager", "Digital Marketing Specialist",
  "Financial Analyst", "Account Manager", "Full Stack Developer",
  "Project Manager", "Web Designer", "Data Analyst",
  "Cybersecurity Analyst", "Data Scientist", "Sales Executive",
  "Software Engineer", "Marketing Manager", "Customer Service Representative",
  "Frontend Developer", "Backend Developer", "Java Full Stack Developer",
  "Cloud Engineer", "DevOps Engineer", "AI Engineer",
  "Machine Learning Engineer", "UI/UX Designer", "HR Executive"
];

const ROUNDS = [
  { id: 'warm_up', title: 'Warm Up', desc: 'Non Technical' },
  { id: 'coding', title: 'Coding', desc: 'Programming' },
  { id: 'role_related', title: 'Role Related', desc: 'Technical' },
  { id: 'behavioral', title: 'Behavioral', desc: 'HR' }
];

const DURATIONS = [
  { id: '5', label: '5 mins' },
  { id: '15', label: '15 mins' },
  { id: '30', label: '30 mins' }
];

const INTERVIEWERS = [
  { id: 'payal', name: 'Payal (Female Strict)', lang: 'IN English', initial: 'P', gender: 'female', mode: 'strict' },
  { id: 'emma', name: 'Emma (Female HR)', lang: 'US English', initial: 'E', gender: 'female', mode: 'hr' },
  { id: 'john', name: 'John (Male Technical)', lang: 'US English', initial: 'J', gender: 'male', mode: 'technical' },
  { id: 'kapil', name: 'Kapil (Male HR)', lang: 'IN English', initial: 'K', gender: 'male', mode: 'hr' }
];

export default function RoleInterviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayRoles, setDisplayRoles] = useState(ROLES);
  const navigate = useNavigate();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [practiceAudioEnabled, setPracticeAudioEnabled] = useState(true);
  const [practiceVideoEnabled, setPracticeVideoEnabled] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSearch = (e) => {
    e?.preventDefault();
    const filtered = ROLES.filter(role => role.toLowerCase().includes(searchTerm.toLowerCase()));
    setDisplayRoles(filtered);
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
    // Reset modal states
    setResumeFile(null);
    setSelectedRound(null);
    setSelectedDuration(null);
    setSelectedInterviewer(null);
    setPracticeAudioEnabled(true);
    setPracticeVideoEnabled(true);
    setTermsAccepted(false);
    setFormError("");
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleStartInterview = () => {
    if (!selectedRound || !selectedDuration || !selectedInterviewer || !termsAccepted) {
      setFormError("Please select round, duration, interviewer, and accept terms to proceed.");
      return;
    }

    localStorage.setItem("selectedInterviewRole", selectedRole);
    localStorage.setItem("selectedInterviewRound", selectedRound);
    localStorage.setItem("selectedInterviewDuration", selectedDuration);
    localStorage.setItem("selectedInterviewer", selectedInterviewer);
    localStorage.setItem("practiceAudioEnabled", practiceAudioEnabled);
    localStorage.setItem("practiceVideoEnabled", practiceVideoEnabled);
    if (resumeFile) {
      localStorage.setItem("resumeFileName", resumeFile.name);
    } else {
      localStorage.removeItem("resumeFileName");
    }

    navigate('/practice-prerequisite');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl overflow-hidden flex flex-col">
      {/* Internal Navbar */}
      <div className="px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 m-4 rounded-full shadow-sm">
        <div className="font-bold text-xl text-primary">AI CareerPlatform</div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#" className="hover:text-primary transition-colors">Use Cases</a>
          <a href="#" className="hover:text-primary transition-colors">Resources</a>
          <a href="#" className="hover:text-primary transition-colors">Pricing</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Priyanka M L
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Role-Specific Mock Interviews
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Practice role-specific interviews with real-world questions. Improve your domain knowledge, articulation, and communication with instant feedback.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center shadow-sm rounded-xl">
            <div className="relative flex-1 h-14">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for roles (e.g. Software Engineer, Data Analyst)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  const filtered = ROLES.filter(role => role.toLowerCase().includes(e.target.value.toLowerCase()));
                  setDisplayRoles(filtered);
                }}
                className="w-full h-full pl-12 pr-4 rounded-l-xl border border-gray-200 border-r-0 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white text-base"
              />
            </div>
            <button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-14 rounded-r-xl transition-colors border border-primary flex items-center justify-center text-base"
            >
              SEARCH
            </button>
          </form>
        </div>

        {/* Roles Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Roles</h2>
          
          {displayRoles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRoles.map((role, index) => (
                <div 
                  key={index}
                  onClick={() => handleRoleClick(role)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary dark:hover:border-primary cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 group"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">{role}</h3>
                  <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Start Practice <span className="text-lg leading-none">&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No roles found</p>
            </div>
          )}
        </div>
      </div>

      {/* Interview Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col my-auto max-h-full overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Details</h2>
                <p className="text-sm text-primary font-medium mt-1">{selectedRole}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Resume Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Resume Based Interview (Optional)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Get interview questions personalized to your resume.</p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Resume
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {resumeFile && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={resumeFile.name}>
                      {resumeFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Round Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Round <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ROUNDS.map(round => (
                    <div 
                      key={round.id}
                      onClick={() => setSelectedRound(round.id)}
                      className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${selectedRound === round.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{round.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{round.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Interview Duration <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {DURATIONS.map(dur => (
                    <button
                      key={dur.id}
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors border ${selectedDuration === dur.id ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interviewer Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Your Interviewer <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTERVIEWERS.map(interviewer => (
                    <div 
                      key={interviewer.id}
                      onClick={() => setSelectedInterviewer(interviewer.id)}
                      className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center text-center transition-all ${selectedInterviewer === interviewer.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold mb-2">
                        {interviewer.initial}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{interviewer.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{interviewer.lang}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Settings Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Practice Settings <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${practiceAudioEnabled ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                      {practiceAudioEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Audio</span>
                    <input type="checkbox" className="hidden" checked={practiceAudioEnabled} onChange={(e) => setPracticeAudioEnabled(e.target.checked)} />
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${practiceVideoEnabled ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                      {practiceVideoEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Video</span>
                    <input type="checkbox" className="hidden" checked={practiceVideoEnabled} onChange={(e) => setPracticeVideoEnabled(e.target.checked)} />
                  </label>
                </div>
              </div>

              {/* Terms Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${termsAccepted ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                    {termsAccepted && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I agree with the terms and conditions. <span className="text-red-500">*</span>
                  </span>
                  <input type="checkbox" className="hidden" checked={termsAccepted} onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setFormError("");
                  }} />
                </label>
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                  {formError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-white dark:bg-gray-800 z-10 shrink-0">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Attempts remaining: <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartInterview}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-sm shadow-primary/30 transition-all active:scale-[0.98]"
                >
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
