import React, { useState, useEffect, useContext } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Save, User, Briefcase, Target, Settings, Code, MapPin, DollarSign, BookOpen } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { UserContext } from '../contexts/UserContext';

export default function Preferences() {
  const { updateProfile } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    targetRole: '',
    techStack: '',
    workType: 'Remote',
    careerGoals: '',
    experienceLevel: 'Fresher',
    preferredCompanies: '',
    salaryExpectation: '',
    learningFocus: []
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('userPreferences'));

    if (saved) {
      setFormData(prev => ({
        ...prev,
        targetRole: saved.targetRole || "",
        techStack: saved.techStack || "",
        workType: saved.workType || "Remote",
        careerGoals: saved.careerGoals || "",
        experienceLevel: saved.experienceLevel || "Fresher",
        preferredCompanies: saved.preferredCompanies || "",
        salaryExpectation: saved.salaryExpectation || "",
        learningFocus: saved.learningFocus || []
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLearningFocusChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const isSelected = prev.learningFocus.includes(value);
      const newFocus = isSelected 
        ? prev.learningFocus.filter(item => item !== value)
        : [...prev.learningFocus, value];
      return { ...prev, learningFocus: newFocus };
    });
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem("userPreferences", JSON.stringify(formData));

    // Optional: update global context
    if (updateProfile) {
      updateProfile({ preferences: formData });
    }

    // Trigger activity log
    logActivity({
      type: "preferences_updated",
      title: "Preferences Updated",
      description: "Your career preferences have been saved",
      status: "success"
    });

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 600);
  };

  const learningOptions = ['DSA', 'System Design', 'Backend', 'Frontend', 'AI/ML'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" /> AI Personalization Engine
          </h1>
          <p className="text-gray-500 mt-1">Configure your AI to deliver hyper-personalized career recommendations.</p>
        </div>
        <Button onClick={handleSavePreferences} disabled={isSaving} className="flex items-center gap-2">
          {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Preferences'} <Save className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        
        {/* Core Fields */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Core Identity</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Target Role</label>
              <input type="text" name="targetRole" value={formData.targetRole} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Backend Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Code className="w-4 h-4" /> Preferred Stack</label>
              <input type="text" name="techStack" value={formData.techStack} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. React, Node.js, Python" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Work Type</label>
              <select name="workType" value={formData.workType} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Target className="w-4 h-4" /> Experience Level</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Fresher</option>
                <option>Junior</option>
                <option>Mid-Level</option>
                <option>Senior</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Ambition */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Career Ambition</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Career Goals</label>
              <textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none" placeholder="e.g. Become a backend engineer in product-based company" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Preferred Companies</label>
              <input type="text" name="preferredCompanies" value={formData.preferredCompanies} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Google, Amazon, Microsoft" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Salary Expectation</label>
              <input type="text" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. 6–10 LPA" />
            </div>
          </div>
        </Card>

        {/* AI Learning Profile */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Learning Focus</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select areas to prioritize in mock interviews & skill generation</label>
            <div className="flex flex-wrap gap-3">
              {learningOptions.map(option => {
                const isSelected = formData.learningFocus.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    value={option}
                    onClick={handleLearningFocusChange}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
