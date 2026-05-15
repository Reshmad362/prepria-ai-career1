import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, User as UserIcon } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferred_role: '',
    experience_level: '',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setFormData({
        name: user.name || 'Senior Engineer',
        email: user.email || 'engineer@example.com',
        preferred_role: user.preferred_role || 'Full Stack Developer',
        experience_level: user.experience_level || 'Senior (5+ years)',
        bio: user.bio || 'Passionate software engineer building scalable web applications. Currently focusing on system design and algorithmic problem solving.',
        location: user.location || 'San Francisco, CA (Remote)'
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and Email are strict requirements.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 800));
      
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...existingUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      logActivity({
        type: "profile_update",
        title: "Profile Updated",
        description: "You successfully updated your profile information.",
        status: "success"
      });
      
      navigate('/profile');
    } catch (err) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-manrope font-bold text-on-surface mb-2">Edit Profile</h1>
          <p className="text-on-surface-variant font-inter text-sm">Update your public identity and career metrics.</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 text-error text-sm rounded-xl border border-error/20">{error}</div>}

      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
        
        <form onSubmit={handleSave} className="space-y-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary/20 flex flex-shrink-0 items-center justify-center text-primary">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-semibold text-on-surface mb-2">Profile Avatar</p>
              <div className="flex gap-3">
                <button type="button" className="btn-secondary !py-2 !px-4 !text-xs">Upload New</button>
                <button type="button" className="px-4 py-2 text-xs font-semibold text-error hover:bg-error/10 rounded-full transition-colors">Remove</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name <span className="text-error">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-ghost" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address <span className="text-error">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-ghost" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Target Role</label>
              <input type="text" name="preferred_role" value={formData.preferred_role} onChange={handleChange} className="input-ghost" placeholder="e.g. Data Scientist" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Experience Level</label>
              <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="input-ghost">
                <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                <option value="Senior (5+ years)">Senior (5+ years)</option>
                <option value="Lead / Manager">Lead / Manager</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Location / Base</label>
             <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-ghost" placeholder="e.g. San Francisco, CA" />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Professional Bio</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="4"
              className="w-full bg-surface-container-low border border-outline-variant/15 focus:border-primary/40 focus:outline-none transition-colors px-4 py-3 text-on-surface rounded-xl resize-none font-inter text-sm"
              placeholder="Briefly describe your career goals and core strengths..."
            ></textarea>
          </div>

          <div className="pt-6 border-t border-outline-variant/15 flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2.5 font-bold text-on-surface hover:bg-surface-container transition-colors tracking-wide rounded-full text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary !py-2.5 flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(204,151,255,0.4)]">
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
