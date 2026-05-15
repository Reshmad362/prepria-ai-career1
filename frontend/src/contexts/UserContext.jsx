import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    targetRole: '',
    techStack: '',
    careerGoals: '',
    workPreference: 'Remote'
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  const calculateProfileCompletion = (prof, prefs, activeUserEmail) => {
    let score = 0;
    let missing = [];

    if (!prof) return { percentage: 0, missing: ['Profile Data'] };

    if (prof.name && prof.name.trim() !== '' && prof.name !== 'Not found') {
        score += 20;
    } else {
        missing.push("Full Name");
    }

    if (activeUserEmail || prof.email) {
        score += 10;
    } else {
        missing.push("Email");
    }

    if (prof.phone && prof.phone.trim() !== '' && prof.phone !== 'Not found') {
        score += 20;
    } else {
        missing.push("Phone Number");
    }

    if (prof.gender && prof.gender !== 'Select Gender' && prof.gender !== '') {
        score += 10;
    } else {
        missing.push("Gender");
    }

    if ((prefs && prefs.targetRole && prefs.targetRole.trim() !== '') || (prof.targetRole && prof.targetRole.trim() !== '')) {
        score += 20;
    } else {
        missing.push("Target Role");
    }

    if (prof.resumeUploaded || prof.score !== undefined || (prof.skills && prof.skills.length > 0)) {
        score += 20;
    } else {
        missing.push("Resume Upload");
    }

    // PHASE 7 — DEBUG LOGS
    console.log("Loaded profile:", prof);
    console.log("Completion:", score);

    return { percentage: Math.min(100, score), missing };
  };

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Recalculate whenever profile or preferences change
  useEffect(() => {
    if (profile) {
      const { percentage, missing } = calculateProfileCompletion(profile, preferences, user?.email);
      setProfileCompletion(percentage);
      setMissingFields(missing);
      setIsProfileLoaded(true);
    } else {
      setProfileCompletion(0);
      setMissingFields([]);
      // Do not set isProfileLoaded to true here if we haven't loaded it yet
    }
  }, [profile, preferences, user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const activeEmail = localStorage.getItem("activeUser");
    
    // Load local storage profile immediately to prevent flashing empty state
    if (activeEmail) {
      const savedProfile = localStorage.getItem(`profile_${activeEmail}`);
      const savedPrefs = localStorage.getItem(`preferences_${activeEmail}`);
      const savedHistory = localStorage.getItem(`scoreHistory_${activeEmail}`);
      
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
      if (savedHistory) setScoreHistory(JSON.parse(savedHistory));
    }
    
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          const email = data.user.email;
          setUser(data.user);
          localStorage.setItem("activeUser", email);
          
          const savedProfile = localStorage.getItem(`profile_${email}`);
          const savedPrefs = localStorage.getItem(`preferences_${email}`);
          const savedHistory = localStorage.getItem(`scoreHistory_${email}`);

          if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
          } else if (data.user.profile) {
            setProfile(data.user.profile);
            localStorage.setItem(`profile_${email}`, JSON.stringify(data.user.profile));
          }

          if (savedHistory) {
             setScoreHistory(JSON.parse(savedHistory));
          } else if (data.user.scoreHistory) {
             setScoreHistory(data.user.scoreHistory);
             localStorage.setItem(`scoreHistory_${email}`, JSON.stringify(data.user.scoreHistory));
          }
          
          if (savedPrefs) {
             setPreferences(JSON.parse(savedPrefs));
          } else if (data.user.preferences) {
             setPreferences(data.user.preferences);
             localStorage.setItem(`preferences_${email}`, JSON.stringify(data.user.preferences));
          } else {
             setPreferences({ targetRole: '', techStack: '', careerGoals: '', workPreference: 'Remote' });
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch user from backend", err);
        // Fallback to local
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const email = parsedUser.email;
            setUser(parsedUser);
            localStorage.setItem("activeUser", email);
            
            const savedProfile = localStorage.getItem(`profile_${email}`);
            const savedPrefs = localStorage.getItem(`preferences_${email}`);
            const savedHistory = localStorage.getItem(`scoreHistory_${email}`);

            if (savedProfile) {
              setProfile(JSON.parse(savedProfile));
            } else if (parsedUser.profile) {
              setProfile(parsedUser.profile);
              localStorage.setItem(`profile_${email}`, JSON.stringify(parsedUser.profile));
            }

            if (savedHistory) {
               setScoreHistory(JSON.parse(savedHistory));
            } else if (parsedUser.scoreHistory) {
               setScoreHistory(parsedUser.scoreHistory);
            }
            
            if (savedPrefs) {
               setPreferences(JSON.parse(savedPrefs));
            } else if (parsedUser.preferences) {
               setPreferences(parsedUser.preferences);
            }
          } catch(e) {}
        }
      });
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const email = parsedUser.email;
        setUser(parsedUser);
        localStorage.setItem("activeUser", email);
        
        const savedProfile = localStorage.getItem(`profile_${email}`);
        const savedPrefs = localStorage.getItem(`preferences_${email}`);
        const savedHistory = localStorage.getItem(`scoreHistory_${email}`);

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else if (parsedUser.profile) {
          setProfile(parsedUser.profile);
        }

        if (savedHistory) setScoreHistory(JSON.parse(savedHistory));
        else if (parsedUser.scoreHistory) setScoreHistory(parsedUser.scoreHistory);

        if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
        else if (parsedUser.preferences) setPreferences(parsedUser.preferences);

      } catch (err) {
        console.error("Failed to parse user from local storage", err);
        clearProfile();
      }
    } else {
      clearProfile();
    }
  }, []);

  const saveToUser = (key, data) => {
    if (!user) return;
    
    // Update active user state and storage
    const updatedUser = { ...user, [key]: data };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Phase 2: Use user-specific storage keys
    if (key === 'profile') {
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(data));
    } else if (key === 'preferences') {
      localStorage.setItem(`preferences_${user.email}`, JSON.stringify(data));
    } else if (key === 'scoreHistory') {
      localStorage.setItem(`scoreHistory_${user.email}`, JSON.stringify(data));
    } else if (key === 'userInsights') {
      localStorage.setItem(`userInsights_${user.email}`, JSON.stringify(data));
    } else if (key === 'progress') {
      localStorage.setItem(`progress_${user.email}`, JSON.stringify(data));
    }

    // Also sync to global users array for demo mode persistence
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map(u => {
      if (u.email === user.email) {
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    saveToUser('preferences', updated);
  };

  const updateProfile = (atsData) => {
    const existingProfile = profile || JSON.parse(localStorage.getItem(`profile_${user?.email}`)) || {};
    const newProfile = {
      ...existingProfile,
      ...atsData,
      lastUpdated: new Date().toISOString()
    };
    
    setProfile(newProfile);
    saveToUser('profile', newProfile);

    if (atsData.score !== undefined) {
      const historyEntry = {
        date: new Date().toISOString(),
        score: atsData.score
      };
      const newHistory = [...scoreHistory, historyEntry];
      setScoreHistory(newHistory);
      saveToUser('scoreHistory', newHistory);
    }
  };

  const clearProfile = () => {
    setUser(null);
    setProfile(null);
    setScoreHistory([]);
    setPreferences({ targetRole: '', techStack: '', careerGoals: '', workPreference: 'Remote' });
    setProfileCompletion(0);
    setMissingFields([]);
    
    // Only clear session identifiers, protecting profile_* scoped storage
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
  };

  const setUserContext = (userData) => {
    // This is called from Login, so it should receive the full user object
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("activeUser", userData.email);
    
    const activeEmail = userData.email;
    const savedProfile = localStorage.getItem(`profile_${activeEmail}`);
    const savedPrefs = localStorage.getItem(`preferences_${activeEmail}`);
    const savedHistory = localStorage.getItem(`scoreHistory_${activeEmail}`);

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile(userData.profile || null);
    }

    if (savedHistory) {
      setScoreHistory(JSON.parse(savedHistory));
    } else {
      setScoreHistory(userData.scoreHistory || []);
    }

    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    } else {
      setPreferences(userData.preferences || { targetRole: '', techStack: '', careerGoals: '', workPreference: 'Remote' });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, profile, updateProfile, clearProfile, setUserContext, scoreHistory, preferences, updatePreferences, profileCompletion, missingFields, isProfileLoaded }}>
      {children}
    </UserContext.Provider>
  );
};

