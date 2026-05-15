import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { coursesData } from '../data/coursesData';
import { CheckCircle, PlayCircle, ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Lock, Target, Lightbulb, AlertTriangle, Info, ChevronDown, ChevronUp, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendEmailNotification } from '../utils/emailApi';

const AccordionBlock = ({ title, icon: Icon, children, defaultOpen = false, className, titleClassName }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${titleClassName}`}>
          <Icon className="w-5 h-5" /> {title}
        </h3>
        {isOpen ? <ChevronUp className={`w-5 h-5 ${titleClassName}`} /> : <ChevronDown className={`w-5 h-5 ${titleClassName}`} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-black/5 dark:border-white/5 mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  // 1. Find course
  // We use == because courseId might be a string but in coursesData it could be string or number depending on the course
  const course = coursesData.find(c => String(c.id) === String(courseId));
  
  // 2. Local State for UI Interaction
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isCourseFullyCompleted, setIsCourseFullyCompleted] = useState(false);

  // Load progress on mount
  useEffect(() => {
    if (course) {
      const saved = localStorage.getItem(`progress_${courseId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedModules(parsed.completedModules || []);
        setIsCourseFullyCompleted(parsed.isCompleted || false);
      }
    }
  }, [courseId, course]);

  // Timer logic per module
  useEffect(() => {
    if (!course) return;
    // Reset timer when switching module, only if module isn't completed
    if (completedModules.includes(activeModuleIndex) || isCourseFullyCompleted) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeModuleIndex, completedModules, isCourseFullyCompleted, course]);
  // Fallback if course not found
  if (!course) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-500 mb-6">The course you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/my-courses')}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
          >
            Back to Course Library
          </button>
        </div>
      </div>
    );
  }

  const activeModule = course?.modules?.[activeModuleIndex];

  // Save utility
  const saveProgress = (newCompleted, isFullComplete = false) => {
    const data = {
      completedModules: newCompleted,
      isCompleted: isFullComplete
    };
    localStorage.setItem(`progress_${courseId}`, JSON.stringify(data));
  };

  // Action: Go to next module
  const goToNextModule = () => {
    if (timeLeft > 0) return;
    
    // Mark current as complete
    const newCompleted = [...new Set([...completedModules, activeModuleIndex])];
    setCompletedModules(newCompleted);
    saveProgress(newCompleted, isCourseFullyCompleted);

    // Navigate to next if available
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
    }
  };

  const finishCourse = async () => {
     if (timeLeft > 0) return;
     const newCompleted = [...new Set([...completedModules, activeModuleIndex])];
     setCompletedModules(newCompleted);
     setIsCourseFullyCompleted(true);
     saveProgress(newCompleted, true);
     
     const email = user?.email || 'default';
     
     // 1. Store Completed Course
     const completedCourses = JSON.parse(localStorage.getItem(`completedCourses_${email}`)) || [];
     if (!completedCourses.includes(course.id)) {
       completedCourses.push(course.id);
       localStorage.setItem(`completedCourses_${email}`, JSON.stringify(completedCourses));
     }

     const certId = `CERT-${course.id}-${Date.now()}`;
     const certKey = `cert_${email}_${course.id}`;
     if (!localStorage.getItem(certKey)) {
       const certData = {
         id: certId,
         courseId: course.id,
         completedAt: new Date().toISOString()
       };
       localStorage.setItem(certKey, JSON.stringify(certData));
     }

     try {
       // Send Email Notification
       const emailSent = await sendEmailNotification(
         "course_completion",
         "Course Completed - AI Career Platform",
         {
           courseName: course.title,
           completionPercentage: 100,
           certificateId: JSON.parse(localStorage.getItem(certKey))?.id || certId,
           completionDate: new Date().toLocaleDateString()
         }
       );

       if (!emailSent) {
         console.warn("Course completed, but email notification failed to send.");
       } else {
         console.log("Course completion email sent successfully.");
       }
     } catch (error) {
       console.error("Failed to send course completion email:", error);
     }
  };

  const progressPercentage = isCourseFullyCompleted ? 100 : Math.round((completedModules.length / (course?.modules?.length || 1)) * 100) || 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-gray-900">
      
      {/* LEFT PANEL: Sidebar */}
      <div className="w-1/4 lg:w-80 min-w-[280px] bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm z-10">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <button 
            onClick={() => navigate('/my-courses')}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Courses
          </button>
          <h2 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {course.title}
          </h2>
          
          {/* Sidebar Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Course Progress</span>
              <span className="text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {course.modules?.map((module, idx) => {
            const isActive = idx === activeModuleIndex;
            const isCompleted = completedModules.includes(idx);
            const isLocked = idx > completedModules.length && !isCourseFullyCompleted;
            
            return (
              <button
                key={idx}
                onClick={() => !isLocked && setActiveModuleIndex(idx)}
                disabled={isLocked}
                className={`w-full text-left p-4 rounded-xl flex gap-3 transition-all group ${
                  isActive 
                  ? 'bg-primary/10 border-primary border dark:bg-primary/20 shadow-sm' 
                  : isLocked
                  ? 'bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                  {isLocked ? (
                     <Lock className="w-5 h-5 text-gray-400" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <PlayCircle className="w-5 h-5 text-primary fill-primary/10" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400">{idx + 1}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-sm line-clamp-2 leading-tight ${isActive ? 'text-primary' : isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {module.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    Module {idx + 1}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative bg-white dark:bg-gray-900">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 px-8 flex justify-between items-center shadow-sm">
           <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate pr-4">{course.title}</h3>
           <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-semibold text-gray-500">Progress:</span>
              <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
           </div>
        </div>

        {activeModule ? (
          <motion.div 
            key={activeModule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full p-8 md:p-12 lg:p-16 pb-32"
          >
            
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mb-3">
                <BookOpen className="w-4 h-4" /> Module {activeModuleIndex + 1}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {activeModule.title}
              </h1>
            </div>

            {/* Dynamic Content Rendering */}
            <div className="space-y-8">
              {activeModule.sections && activeModule.sections.map((section, idx) => {
                const staggerDelay = Math.min(idx * 0.1, 0.5); // Cap delay to avoid excessive wait times

                switch (section.type) {
                  case 'tip':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex gap-4 items-start">
                        <Lightbulb className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm uppercase tracking-wider mb-1">Pro Tip</h4>
                          <p className="text-yellow-900 dark:text-yellow-300">{section.content}</p>
                        </div>
                      </motion.div>
                    );
                  
                  case 'warning':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm flex gap-4 items-start">
                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-800 dark:text-red-400 text-sm uppercase tracking-wider mb-1">Warning</h4>
                          <p className="text-red-900 dark:text-red-300">{section.content}</p>
                        </div>
                      </motion.div>
                    );

                  case 'keyConcept':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl shadow-sm flex gap-4 items-start">
                        <Zap className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-1">Key Concept</h4>
                          <p className="text-primary-dark dark:text-primary-light font-medium">{section.content}</p>
                        </div>
                      </motion.div>
                    );

                  case 'text':
                    return (
                      <motion.p key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg md:text-xl">
                        {section.content}
                      </motion.p>
                    );

                  case 'image':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="my-8 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="group relative overflow-hidden">
                          <img 
                            src={section.src} 
                            alt={section.caption}
                            loading="lazy"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-white text-sm font-medium">{section.caption}</p>
                          </div>
                        </div>
                      </motion.div>
                    );

                  case 'bullets':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }} className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                          Key Takeaways
                        </h3>
                        <ul className="space-y-4">
                          {section.items.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-4 text-gray-700 dark:text-gray-300 font-medium">
                              <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0 shadow-sm"></div>
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );

                  case 'example':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }}>
                        <AccordionBlock 
                          title="Practical Example" 
                          icon={BookOpen} 
                          className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30"
                          titleClassName="text-blue-800 dark:text-blue-400"
                        >
                          <p className="text-blue-900 dark:text-blue-300 font-medium italic text-lg leading-relaxed">
                            "{section.content}"
                          </p>
                        </AccordionBlock>
                      </motion.div>
                    );

                  case 'useCases':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }}>
                        <AccordionBlock 
                          title="Real-World Use Cases" 
                          icon={Lightbulb} 
                          className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30"
                          titleClassName="text-purple-800 dark:text-purple-400"
                        >
                          <ul className="grid md:grid-cols-2 gap-4">
                            {section.items.map((uc, uIdx) => (
                              <li key={uIdx} className="flex items-start gap-3 text-purple-900 dark:text-purple-300 font-medium bg-white/60 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm">
                                <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{uc}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionBlock>
                      </motion.div>
                    );

                  case 'practicalTasks':
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: staggerDelay }}>
                        <AccordionBlock 
                          title="Practical Tasks" 
                          icon={Target} 
                          className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30"
                          titleClassName="text-orange-800 dark:text-orange-400"
                          defaultOpen={true}
                        >
                          <ul className="space-y-3">
                            {section.items.map((task, tIdx) => (
                              <li key={tIdx} className="flex items-center gap-4 text-orange-900 dark:text-orange-300 font-medium bg-white/60 dark:bg-gray-800/40 p-4 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                                <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-800/50 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold shrink-0">
                                  {tIdx + 1}
                                </div>
                                <span className="leading-relaxed">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionBlock>
                      </motion.div>
                    );

                  default:
                    return null;
                }
              })}
              
              {/* Fallback for old content format just in case */}
              {(!activeModule.sections || activeModule.sections.length === 0) && activeModule.content?.text && (
                 <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg md:text-xl">
                    {activeModule.content.text}
                 </p>
              )}
            </div>

            {/* Navigation Actions & Completion State */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
              
              {isCourseFullyCompleted && activeModuleIndex === course.modules.length - 1 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-500/30 p-8 rounded-2xl text-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Course Completed! 🎉</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Congratulations on completing all modules. You've unlocked your professional certificate of completion.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => navigate(`/certificate/${courseId}`)}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      <Award className="w-6 h-6" /> Download Certificate
                    </button>
                    <button 
                      onClick={() => navigate('/my-courses')}
                      className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeModuleIndex === 0}
                    className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 transition-colors ${
                      activeModuleIndex === 0 
                      ? 'opacity-0 pointer-events-none' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>

                  {activeModuleIndex === course.modules.length - 1 ? (
                    <button 
                      onClick={finishCourse}
                      disabled={timeLeft > 0 || isCourseFullyCompleted}
                      className={`px-8 py-3.5 font-bold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                        isCourseFullyCompleted
                        ? 'bg-green-500 text-white shadow-md cursor-default'
                        : timeLeft > 0
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {isCourseFullyCompleted ? 'Course Completed 🎉' : timeLeft > 0 ? `Next module available in ${timeLeft}s` : 'Finish Course 🎉'} 
                    </button>
                  ) : (
                    <button 
                      onClick={goToNextModule}
                      disabled={timeLeft > 0}
                      className={`px-8 py-3.5 font-bold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                        timeLeft > 0
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {timeLeft > 0 ? `Next module available in ${timeLeft}s` : 'Next Module'} 
                      {timeLeft === 0 && <ChevronRight className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-gray-500">
            No module content available.
          </div>
        )}
      </div>

    </div>
  );
}
