import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { Briefcase, GraduationCap, CheckCircle2, FileSearch, Code, XCircle, Lightbulb, Clock, Calendar, ChevronRight, PlayCircle } from 'lucide-react';

export default function ATSDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useContext(UserContext);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  useEffect(() => {
    if (user?.email) {
      const storageKey = `atsData_${user.email}`;
      let activeResume = null;
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
           activeResume = JSON.parse(savedData);
           console.log("Loaded ATS data:", activeResume);
        }
      } catch (e) {}

      if (activeResume) {
        setResumes([{...activeResume, id: activeResume.id || 'latest'}]);
        setSelectedResumeId(activeResume.id || 'latest');
      } else {
        setResumes([]);
      }
    }
  }, [user]);

  const handleStartInterview = (resume) => {
      // Save the active context for the interview screen
      localStorage.setItem(`activeInterviewContext_${user?.email}`, JSON.stringify(resume));
      navigate('/interview');
  };

  if (resumes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <FileSearch className="w-16 h-16 text-indigo-200 dark:text-indigo-900/50" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Analysis Data Found</h1>
          <p className="text-gray-500 mt-2 max-w-md">You haven't analyzed a resume yet. Upload a resume to generate an ATS compatibility report.</p>
        </div>
        <Link to="/resume-upload">
          <Button>Go to Resume Upload</Button>
        </Link>
      </div>
    );
  }

  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">ATS Analysis Dashboard</h1>
          <p className="text-gray-500 mt-1">Review your parsed resumes and start targeted AI interviews.</p>
        </div>
        <Link to="/resume-upload">
           <Button variant="outline">Upload New Resume</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* LEFT SIDEBAR: Resume Timeline */}
         <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
               <Clock className="w-5 h-5 text-indigo-500" /> History
            </h2>
            <div className="space-y-3">
               {resumes.map((resume, idx) => {
                  const isSelected = selectedResumeId === resume.id;
                  const uploadDate = new Date(resume.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                     <div 
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                           isSelected 
                           ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                           : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                        }`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {uploadDate}
                           </span>
                           {idx === 0 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">LATEST</span>}
                        </div>
                        <h3 className={`font-bold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                           {resume.fileName || `Resume ${resumes.length - idx}`}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1 font-medium">
                           Score: <span className={resume.score > 75 ? 'text-green-600' : 'text-orange-500'}>{resume.score}</span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* RIGHT CONTENT: Resume Details */}
         <div className="lg:col-span-3 space-y-6">
            
            {/* Top Action Bar */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                  <h2 className="text-xl font-bold mb-1">Start Tailored Interview</h2>
                  <p className="text-indigo-100 text-sm max-w-md">The AI will generate questions strictly based on the skills and projects found in this specific resume.</p>
               </div>
               <button 
                  onClick={() => handleStartInterview(activeResume)}
                  className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
               >
                  <PlayCircle className="w-5 h-5" /> Start Interview
               </button>
            </div>

            {activeResume.feedback && (
              <Card className="border-l-4 border-l-primary">
                <h2 className="text-xl font-bold text-text mb-4">Feedback & Improvement</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                    <h3 className="font-bold text-green-700 dark:text-green-500 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {activeResume.feedback.strengths?.length > 0 ? activeResume.feedback.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-green-800 dark:text-green-400 flex items-start gap-2">
                          <span className="mt-0.5 mt-0.5 text-green-500 font-black">•</span> {strength}
                        </li>
                      )) : <li className="text-sm text-gray-500">No major strengths isolated.</li>}
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                    <h3 className="font-bold text-red-700 dark:text-red-500 flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5" /> Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {activeResume.feedback.weaknesses?.length > 0 ? activeResume.feedback.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-sm text-red-800 dark:text-red-400 flex items-start gap-2">
                          <span className="mt-0.5 text-red-500 font-black">•</span> {weakness}
                        </li>
                      )) : <li className="text-sm text-gray-500">No major weaknesses.</li>}
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-700 dark:text-blue-500 flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5" /> Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {activeResume.feedback.suggestions?.length > 0 ? activeResume.feedback.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-blue-800 dark:text-blue-400 flex items-start gap-2">
                          <span className="mt-0.5 text-blue-500 font-black">•</span> {suggestion}
                        </li>
                      )) : <li className="text-sm text-gray-500">Resume looks solid.</li>}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skills Section */}
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-bold text-text">Extracted Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills?.map((skill, i) => (
                      <Badge key={i} variant="primary">{skill}</Badge>
                    ))}
                    {(!activeResume.skills || activeResume.skills.length === 0) && (
                      <p className="text-sm text-gray-500">No core skills detected.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Experience & Education Section */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold text-text">Work Experience</h2>
                  </div>
                  <div className="space-y-6">
                    {typeof activeResume.experience === 'string' ? (
                      <div className="flex gap-4">
                        <div className="w-3 h-3 rounded-full bg-accent mt-2 shrink-0 relative z-10"></div>
                        <div>
                          <h3 className="font-bold text-text text-lg">Overall Experience</h3>
                          <p className="text-primary font-medium mt-1">{activeResume.experience}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {activeResume.experience?.map((exp, i) => (
                          <div key={i} className="flex gap-4 relative">
                            {i !== activeResume.experience.length - 1 && (
                              <div className="absolute left-1.5 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            )}
                            <div className="w-3 h-3 rounded-full bg-accent mt-2 shrink-0 relative z-10"></div>
                            <div>
                              <h3 className="font-bold text-text text-lg">{exp.role || exp.title}</h3>
                              <p className="text-primary font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500 mt-1">{exp.duration || exp.dates}</p>
                            </div>
                          </div>
                        ))}
                        {(!activeResume.experience || activeResume.experience.length === 0) && (
                          <p className="text-sm text-gray-500">No formal experience parsed.</p>
                        )}
                      </>
                    )}
                  </div>
                </Card>

                {activeResume.projects?.length > 0 && (
                  <Card>
                    <div className="flex items-center gap-2 mb-6">
                      <Code className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-lg font-bold text-text">Projects & Achievements</h2>
                    </div>
                    <div className="space-y-4">
                      {activeResume.projects.map((proj, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2.5 shrink-0"></div>
                          <div>
                            <h3 className="font-bold text-text">{typeof proj === 'string' ? proj : (proj.name || proj.title)}</h3>
                            {typeof proj !== 'string' && proj.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{proj.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

         </div>
      </div>
    </div>
  );
}
