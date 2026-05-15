import React from 'react';
import { User, Edit, Upload, MapPin, Briefcase, Award, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileCard({ user, onUploadClick }) {
  // Safe defaults
  const name = user?.name || "Senior Engineer";
  const email = user?.email || "engineer@example.com";
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const bio = user?.bio || "Passionate software engineer building scalable web applications. Currently focusing on system design and algorithmic problem solving.";
  const location = user?.location || "San Francisco, CA (Remote)";
  const role = user?.preferred_role || "Full Stack Developer";
  const experience = user?.experience_level || "Senior (5+ years)";

  return (
    <div className="glass-card !p-0 overflow-hidden relative">
      <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 relative">
        <div className="absolute inset-0 bg-surface-variant/40 backdrop-blur-[2px]"></div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Link to="/edit-profile" className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2 bg-surface-container-highest/60 backdrop-blur-md">
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>
      
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
          <div className="w-32 h-32 rounded-3rem bg-surface-container-low border-4 border-surface shadow-2xl flex items-center justify-center text-4xl font-manrope font-bold text-primary relative overflow-hidden group">
            {initials}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] text-white font-semibold">Change</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-manrope font-bold text-on-surface mb-1">{name}</h1>
            <p className="text-on-surface-variant text-sm font-medium">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">About</h3>
              <p className="text-on-surface leading-relaxed text-sm">{bio}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/20">
                <Briefcase className="w-4 h-4 text-primary" /> {role}
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/20">
                <Award className="w-4 h-4 text-secondary" /> {experience}
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/20">
                <MapPin className="w-4 h-4 text-[#00D4FF]" /> {location}
              </div>
            </div>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
            <div className="glass-panel rounded-xl p-4 text-center border-dashed border-2 border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group" onClick={onUploadClick}>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-on-surface mb-1 text-sm group-hover:text-primary transition-colors">Resume Uploaded</h4>
              <p className="text-xs text-on-surface-variant">Click to replace or update</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


