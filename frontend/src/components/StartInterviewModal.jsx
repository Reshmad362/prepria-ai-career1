import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { 
  X, Target, Sparkles, Code, CheckCircle2, Clock, 
  BrainCircuit, ShieldCheck, ArrowRight, Loader2, Award, Zap, AlertCircle, ChevronRight 
} from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

export default function StartInterviewModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { profile, preferences, user } = useContext(UserContext);

  const targetRole = preferences?.targetRole || profile?.targetRole || '';
  const techStackString = preferences?.techStack || '';
  const extractedSkills = profile?.skills || [];

  // Default focus chips extracted from profile/preferences
  const initialSkills = React.useMemo(() => {
    const rawList = [];
    if (extractedSkills && extractedSkills.length > 0) {
      rawList.push(...extractedSkills);
    }
    if (techStackString) {
      techStackString.split(',').forEach(s => {
        const trimmed = s.trim();
        if (trimmed && !rawList.includes(trimmed)) {
          rawList.push(trimmed);
        }
      });
    }
    if (rawList.length === 0) {
      return ['JavaScript', 'React', 'Node.js', 'System Design', 'Problem Solving', 'SQL'];
    }
    return rawList.slice(0, 8);
  }, [extractedSkills, techStackString]);

  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState('15');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (initialSkills.length > 0) {
      setSelectedSkills(initialSkills.slice(0, 4));
    }
  }, [initialSkills]);

  if (!isOpen) return null;

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleStart = () => {
    setIsStarting(true);

    const activeRole = targetRole || "Full Stack Developer";
    const roundMapping = {
      'technical': 'role_related',
      'behavioral': 'behavioral',
      'mixed': 'warm_up'
    };

    localStorage.setItem("selectedInterviewRole", activeRole);
    localStorage.setItem("selectedInterviewRound", roundMapping[interviewType] || 'role_related');
    localStorage.setItem("selectedInterviewDuration", duration);
    localStorage.setItem("selectedInterviewer", "john");
    localStorage.setItem("practiceAudioEnabled", "true");
    localStorage.setItem("practiceVideoEnabled", "true");
    localStorage.setItem("selectedInterviewDifficulty", difficulty);
    localStorage.setItem("selectedFocusAreas", JSON.stringify(selectedSkills));

    logActivity({
      type: "interview_started",
      title: `AI Interview Configured: ${activeRole}`,
      description: `Started ${difficulty} ${interviewType} interview session`,
      status: "success"
    });

    setTimeout(() => {
      setIsStarting(false);
      onClose();
      navigate('/practice-prerequisite');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn font-manrope">
      
      {/* Modal Card */}
      <div 
        className="bg-white dark:bg-[#111215] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05D00] flex items-center justify-center text-white shadow-md shadow-[#FF6B00]/25">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Start AI Mock Interview
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Practice with an interview tailored to your career goals and skill profile.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            disabled={isStarting}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Target Role Banner */}
          <div className="p-4 rounded-2xl bg-[#FFF6F0] dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Target Role</span>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">
                  {targetRole || "Full Stack Developer"}
                </p>
              </div>
            </div>

            {!targetRole && (
              <button 
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                Set Target Role →
              </button>
            )}
          </div>

          {/* Interview Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2.5">
              Interview Format &amp; Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'technical', title: 'Technical', desc: 'Core coding & system concepts' },
                { id: 'behavioral', title: 'Behavioral', desc: 'STAR situational & leadership' },
                { id: 'mixed', title: 'Mixed', desc: 'Balanced tech & culture match' }
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setInterviewType(type.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    interviewType === type.id
                      ? 'border-[#FF6B00] bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-[#FF6B00]/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{type.title}</span>
                    {interviewType === type.id && <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'beginner', label: 'Beginner' },
                { id: 'intermediate', label: 'Intermediate' },
                { id: 'advanced', label: 'Advanced' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    difficulty === lvl.id
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20'
                      : 'bg-[#F8F9FB] dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Focus Competencies (Select to prioritize)
              </label>
              <span className="text-[11px] text-gray-400 font-semibold">{selectedSkills.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {initialSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF1E8] dark:bg-orange-950/50 text-[#FF6B00] border-[#FF6B00] ring-1 ring-[#FF6B00]/30'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>{skill}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#FF6B00]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Breakdown & Evaluation Metrics */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5 text-primary" /> Session Specs
              </span>
              <span>10 Questions • ~15–20 mins</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Evaluation Dimensions Evaluated
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Technical Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Communication Fluency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Problem Solving</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Confidence &amp; Pacing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalization Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 flex items-start gap-3 text-xs text-gray-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Personalized for you: This interview emphasizes <strong className="text-gray-900 dark:text-white font-bold">{targetRole || "Full Stack Development"}</strong> competencies and your selected focus topics.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isStarting}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starting your interview...</span>
              </>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
