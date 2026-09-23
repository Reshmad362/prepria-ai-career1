import React, { useEffect, useState } from 'react';
import CareerSuggestionCard from '../components/CareerSuggestionCard';
import { Compass, BookOpen, AlertTriangle, PlayCircle } from 'lucide-react';
import { API_URL } from '../utils/api';

export default function CareerSuggestions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const activeEmail = user.email || localStorage.getItem('activeUser') || user.id || 'default_user';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}/career-suggestions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: activeEmail,
            resume_skills: ["Java", "React"],
            matched_roles: ["Backend Developer"],
            latest_score: 0.68,
            fluency_score: 52,
            weak_skills: ["DSA"],
            history_available: true
          })
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [activeEmail]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-on-surface">Generating Career Roadmap...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-error">Failed to load suggestions.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="mb-12 border-b border-outline-variant/20 pb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
           <Compass className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-manrope font-bold text-on-surface mb-2">Career Intelligence Roadmap</h1>
          <p className="text-on-surface-variant text-lg">AI-driven actionable guidance mapped to your unique skills and interview profile.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        
        {/* Left Column: Roles */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-manrope text-on-surface flex items-center gap-2">
             <Compass className="w-6 h-6 text-primary" /> Recommended Roles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
             {data.recommended_roles?.map((role, idx) => (
                <CareerSuggestionCard key={idx} role={role} />
             ))}
          </div>

          <div className="mt-12 glass-card p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[60px]"></div>
             <h2 className="text-2xl font-bold font-manrope text-on-surface mb-6 flex items-center gap-2 relative z-10">
                <BookOpen className="w-6 h-6 text-secondary" /> Customized Learning Path
             </h2>
             <div className="space-y-6 relative z-10">
               {data.learning_path?.map((path, idx) => (
                 <div key={idx} className="flex gap-4">
                   <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-secondary text-background flex items-center justify-center font-bold text-sm shrink-0">
                         {idx + 1}
                      </div>
                      {idx !== data.learning_path.length - 1 && <div className="w-0.5 h-full bg-surface-container-highest mt-2"></div>}
                   </div>
                   <div className="pb-8">
                      <h4 className="text-on-surface font-semibold text-lg">{path}</h4>
                      <p className="text-on-surface-variant text-sm mt-1">Master this to unlock higher match scores.</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Weak Skills & Next steps */}
        <div className="space-y-8">
           
           <div className="glass-card p-6 border-t-2 border-tertiary">
             <h3 className="text-lg font-bold font-manrope text-on-surface mb-4 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-tertiary" /> Weak Areas Detected
             </h3>
             <div className="flex flex-wrap gap-2">
                {data.weak_skills?.length > 0 ? data.weak_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-tertiary/10 text-tertiary text-sm rounded-full border border-tertiary/20 font-bold">
                    {skill}
                  </span>
                )) : (
                  <span className="text-on-surface-variant text-sm">No major weak skills detected!</span>
                )}
             </div>
           </div>

           <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 shadow-lg">
             <h3 className="text-lg font-bold font-manrope text-on-surface mb-6 flex items-center gap-2">
               <PlayCircle className="w-5 h-5 text-on-surface" /> Immediate Next Steps
             </h3>
             <ul className="space-y-4">
               {data.next_steps?.map((step, idx) => (
                 <li key={idx} className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-primary"></div>
                   </div>
                   <span className="text-on-surface text-sm font-medium">{step}</span>
                 </li>
               ))}
             </ul>
           </div>

        </div>

      </div>
    </div>
  );
}
