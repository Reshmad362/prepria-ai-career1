import React, { createContext, useState, useEffect } from 'react';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    targetRole: '',
    techStack: '',
    careerGoals: '',
    workPreference: 'Remote',
    experienceLevel: 'Fresher'
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [completionData, setCompletionData] = useState({
    percentage: 0,
    completed: 0,
    total: 10,
    remaining: 10,
    missing: [],
    missingSections: [],
    completedSections: [],
    sections: [],
    status: "Getting Started",
    color: "text-amber-500",
    barColor: "bg-amber-500",
    resumeStatus: { isUploaded: false, isAnalyzed: false, score: null, fileName: null }
  });
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Recalculate whenever profile, preferences, or user change
  useEffect(() => {
    if (profile || preferences || user) {
      const result = calculateProfileCompletion(profile, preferences, user);
      setProfileCompletion(result.percentage);
      setMissingFields(result.missing);
      setCompletionData(result);
      setIsProfileLoaded(true);
    } else {
      setProfileCompletion(0);
      setMissingFields([]);
      setCompletionData({
        percentage: 0,
        completed: 0,
        total: 10,
        remaining: 10,
        missing: [],
        missingSections: [],
        completedSections: [],
        sections: [],
        status: "Getting Started",
        color: "text-amber-500",
        barColor: "bg-amber-500",
        resumeStatus: { isUploaded: false, isAnalyzed: false, score: null, fileName: null }
      });
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
      const savedAts = localStorage.getItem(`atsData_${activeEmail}`);
      
      let baseProfile = savedProfile ? JSON.parse(savedProfile) : {};
      if (savedAts) {
        try {
          const parsedAts = JSON.parse(savedAts);
          if (baseProfile.score === undefined || baseProfile.score === null) {
            baseProfile = {
              ...baseProfile,
              score: parsedAts.score,
              skills: parsedAts.skills || [],
              experience: parsedAts.experience || '',
              projects: parsedAts.projects || [],
              education: parsedAts.education || '',
              resumeUploaded: true,
              resumeFileName: parsedAts.fileName || 'Resume.pdf'
            };
          }
        } catch(e) {}
      }

      if (Object.keys(baseProfile).length > 0) setProfile(baseProfile);
      if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
      if (savedHistory) setScoreHistory(JSON.parse(savedHistory));
      setIsProfileLoaded(true);
    }
    
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          const email = data.user.email;
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("activeUser", email);
          
          const savedProfile = localStorage.getItem(`profile_${email}`);
          const savedPrefs = localStorage.getItem(`preferences_${email}`);
          const savedHistory = localStorage.getItem(`scoreHistory_${email}`);
          const savedAts = localStorage.getItem(`atsData_${email}`);

          let parsedSaved = savedProfile ? JSON.parse(savedProfile) : {};
          let parsedAts = savedAts ? JSON.parse(savedAts) : null;
          let backendProfile = data.user.profile || {};

          // Merge: backend is ground truth for non-empty fields, preserves local non-empty fields
          const mergedProfile = { ...parsedSaved };
          Object.keys(backendProfile).forEach(key => {
            const val = backendProfile[key];
            if (val !== "" && val !== null && val !== undefined) {
              mergedProfile[key] = val;
            }
          });

          // ATS resume data fallback if skills not populated
          if (parsedAts && (!mergedProfile.skills || mergedProfile.skills.length === 0)) {
            mergedProfile.skills = parsedAts.skills || [];
            if (mergedProfile.score === undefined || mergedProfile.score === null) mergedProfile.score = parsedAts.score;
            if (!mergedProfile.experience) mergedProfile.experience = parsedAts.experience || '';
            if (!mergedProfile.projects || mergedProfile.projects.length === 0) mergedProfile.projects = parsedAts.projects || [];
            if (!mergedProfile.education) mergedProfile.education = parsedAts.education || '';
            mergedProfile.resumeUploaded = true;
            mergedProfile.resumeFileName = parsedAts.fileName || 'Resume.pdf';
          }

          setProfile(mergedProfile);
          localStorage.setItem(`profile_${email}`, JSON.stringify(mergedProfile));

          if (data.user.scoreHistory && data.user.scoreHistory.length > 0) {
             setScoreHistory(data.user.scoreHistory);
             localStorage.setItem(`scoreHistory_${email}`, JSON.stringify(data.user.scoreHistory));
          } else if (savedHistory) {
             setScoreHistory(JSON.parse(savedHistory));
          }
          
          const backendPrefs = data.user.preferences || {};
          let mergedPrefs = savedPrefs ? JSON.parse(savedPrefs) : {
            targetRole: '',
            techStack: '',
            careerGoals: '',
            workPreference: 'Remote',
            experienceLevel: 'Fresher'
          };

          Object.keys(backendPrefs).forEach(k => {
            const val = backendPrefs[k];
            if (val !== "" && val !== null && val !== undefined) {
              mergedPrefs[k] = val;
            }
          });

          setPreferences(mergedPrefs);
          localStorage.setItem(`preferences_${email}`, JSON.stringify(mergedPrefs));
          setIsProfileLoaded(true);
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
            setIsProfileLoaded(true);
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

        setIsProfileLoaded(true);
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

    // Use user-specific storage keys
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

    // Sync to global users array for persistence
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

    // Asynchronously sync to backend if authenticated
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      }).catch(err => console.warn("Background preference sync:", err));
    }
  };

  const updateProfile = (profileData) => {
    const email = user?.email || localStorage.getItem("activeUser");
    const existingProfile = profile || (email ? JSON.parse(localStorage.getItem(`profile_${email}`)) : {}) || {};
    const newProfile = {
      ...existingProfile,
      ...profileData,
      lastUpdated: new Date().toISOString()
    };
    
    setProfile(newProfile);
    saveToUser('profile', newProfile);

    if (profileData.score !== undefined && profileData.score !== null) {
      const historyEntry = {
        date: new Date().toISOString(),
        score: profileData.score
      };
      const newHistory = [...scoreHistory, historyEntry];
      setScoreHistory(newHistory);
      saveToUser('scoreHistory', newHistory);
    }

    // Asynchronously sync to backend if authenticated
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      }).catch(err => console.warn("Background profile sync:", err));
    }
  };

  const clearProfile = () => {
    setUser(null);
    setProfile(null);
    setScoreHistory([]);
    setPreferences({ targetRole: '', techStack: '', careerGoals: '', workPreference: 'Remote', experienceLevel: 'Fresher' });
    setProfileCompletion(0);
    setMissingFields([]);
    setCompletionData({
      percentage: 0,
      completed: 0,
      total: 10,
      remaining: 10,
      missing: [],
      missingSections: [],
      completedSections: [],
      sections: [],
      status: "Getting Started",
      color: "text-amber-500",
      barColor: "bg-amber-500",
      resumeStatus: { isUploaded: false, isAnalyzed: false, score: null, fileName: null }
    });
    setIsProfileLoaded(false);
    
    // Only clear session identifiers, protecting profile_* scoped storage
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isDemo");
  };

  const setUserContext = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("activeUser", userData.email);
    
    const activeEmail = userData.email;
    const savedProfile = localStorage.getItem(`profile_${activeEmail}`);
    const savedPrefs = localStorage.getItem(`preferences_${activeEmail}`);
    const savedHistory = localStorage.getItem(`scoreHistory_${activeEmail}`);

    let currentProf = savedProfile ? JSON.parse(savedProfile) : {};
    let backendProf = userData.profile || {};
    Object.keys(backendProf).forEach(k => {
      if (backendProf[k] !== "" && backendProf[k] !== null && backendProf[k] !== undefined) {
        currentProf[k] = backendProf[k];
      }
    });
    setProfile(currentProf);
    localStorage.setItem(`profile_${activeEmail}`, JSON.stringify(currentProf));

    if (userData.scoreHistory && userData.scoreHistory.length > 0) {
      setScoreHistory(userData.scoreHistory);
      localStorage.setItem(`scoreHistory_${activeEmail}`, JSON.stringify(userData.scoreHistory));
    } else if (savedHistory) {
      setScoreHistory(JSON.parse(savedHistory));
    } else {
      setScoreHistory(userData.scoreHistory || []);
    }

    let currentPrefs = savedPrefs ? JSON.parse(savedPrefs) : { targetRole: '', techStack: '', careerGoals: '', workPreference: 'Remote', experienceLevel: 'Fresher' };
    let backendPrefs = userData.preferences || {};
    Object.keys(backendPrefs).forEach(k => {
      if (backendPrefs[k] !== "" && backendPrefs[k] !== null && backendPrefs[k] !== undefined) {
        currentPrefs[k] = backendPrefs[k];
      }
    });
    setPreferences(currentPrefs);
    localStorage.setItem(`preferences_${activeEmail}`, JSON.stringify(currentPrefs));
    setIsProfileLoaded(true);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      profile, 
      updateProfile, 
      clearProfile, 
      setUserContext, 
      scoreHistory, 
      preferences, 
      updatePreferences, 
      profileCompletion, 
      missingFields, 
      completionData,
      isProfileLoaded 
    }}>
      {children}
    </UserContext.Provider>
  );
};
