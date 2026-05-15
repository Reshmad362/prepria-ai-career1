import React from 'react';
import { Briefcase, Target } from 'lucide-react';

export default function PreferencesCard({ user }) {
  // Use user state to set default value in UI
  const role = user?.preferred_role || "Full Stack Developer";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-5 h-5 text-secondary" />
          <h4 className="font-semibold text-on-surface">Default Interview Role</h4>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">This role will be pre-selected when generating new mock interviews.</p>
        <select className="input-ghost w-full" defaultValue={role}>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="DevOps Engineer">DevOps Engineer</option>
          <option value="Product Manager">Product Manager</option>
        </select>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-on-surface">Default Difficulty</h4>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">Set the baseline strictness for the AI evaluation engine.</p>
        <select className="input-ghost w-full" defaultValue="medium">
          <option value="easy">Easy (Guiding)</option>
          <option value="medium">Medium (Standard)</option>
          <option value="hard">Hard (FAANG Level)</option>
        </select>
      </div>
    </div>
  );
}
