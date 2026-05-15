import React, { useContext, useMemo, useEffect, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import { suggestRoles, detectUserDomain } from '../utils/interviewEngine';
import { logActivity } from '../utils/activityLogger';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleSuggestions() {
  const navigate = useNavigate();
  const { profile } = useContext(UserContext);

  const { suggestions, detectedDomain } = useMemo(() => {
    const roles = suggestRoles(profile).map(role => ({
      ...role,
      company: 'Industry Standard'
    }));
    const prefs = profile?.preferences || JSON.parse(localStorage.getItem('userPreferences') || '{}');
    const pseudoTech = profile?.technicalSkills || (profile?.skills || []).filter(s => ['react','node','python','excel','sql','java'].some(k => s.toLowerCase().includes(k)));
    const pseudoSoft = profile?.softSkills || (profile?.skills || []).filter(s => ['communication','leadership','management','confidence','empathy'].some(k => s.toLowerCase().includes(k)));
    
    // Quick heuristic to detect user domain for the header
    const domain = detectUserDomain({ technicalSkills: pseudoTech, softSkills: pseudoSoft });
    
    return { suggestions: roles, detectedDomain: domain };
  }, [profile]);

  const loggedRef = useRef(false);
  useEffect(() => {
    if (suggestions.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      logActivity({
        type: "role_suggestion",
        title: "New Role Suggestions",
        description: "AI generated new career matches",
        status: "info"
      });
    }
  }, [suggestions]);

  const renderDomainBadge = (domain, category) => {
    if (category === 'aviation') return <Badge variant="warning">✈️ Aviation</Badge>;
    if (category === 'business') return <Badge variant="primary">💼 Business</Badge>;
    if (domain === 'technical') return <Badge variant="success">🌐 Technical</Badge>;
    return <Badge variant="neutral">🎯 {domain.charAt(0).toUpperCase() + domain.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Role Suggestions {profile?.name && profile.name !== "Not found" ? `for ${profile.name}` : ''}
        </h1>
        <div className="mt-2 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-bold border border-indigo-100 dark:border-indigo-800">
           Career Domain Detected: <span className="uppercase">{detectedDomain}</span>
        </div>
        <p className="text-gray-500 mt-2">
          Based on your extracted skills {profile?.skills?.length ? `(${profile.skills.slice(0, 3).join(', ')}${profile.skills.length > 3 ? '...' : ''})` : 'and profile'}, here are the best matching career paths for you across all industries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestions.map((role, i) => (
          <Card key={i} className={`flex flex-col h-full transform transition-all duration-200 hover:-translate-y-1 ${role.highlight ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              {renderDomainBadge(role.domain, role.category)}
              {role.highlight && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wide w-max">
                  <Target className="w-3 h-3" /> Best Match
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{role.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{role.company}</p>

            <div className="mb-6 space-y-2 flex-grow">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Key Skills Match</h3>
              <div className="flex flex-wrap gap-2">
                {role.skills.map(skill => (
                  <Badge key={skill} variant="neutral">{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              <div>
                <ProgressBar 
                  progress={role.match} 
                  label="Confidence Score" 
                  color={role.match > 80 ? 'bg-green-500' : role.match > 60 ? 'bg-yellow-500' : 'bg-red-500'} 
                />
              </div>
              <Button 
                className="w-full flex items-center justify-center gap-2" 
                variant={role.highlight ? 'primary' : 'secondary'} 
                onClick={() => {
                  localStorage.setItem("selectedInterviewRole", role.title);
                  localStorage.setItem("selectedInterviewRound", "role_related");
                  localStorage.setItem("selectedInterviewDuration", "15");
                  localStorage.setItem("selectedInterviewer", "emma");
                  localStorage.setItem("practiceAudioEnabled", "true");
                  localStorage.setItem("practiceVideoEnabled", "true");
                  navigate('/practice-prerequisite');
                }}
              >
                Practice this role <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
