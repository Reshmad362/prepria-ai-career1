import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileUp, FileSearch, Target, MessageSquare, BarChart2, TrendingUp, LifeBuoy, BookOpen, Briefcase } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', path: '/my-courses', icon: BookOpen },
  { name: 'Resume Upload', path: '/resume-upload', icon: FileUp },
  { name: 'ATS Dashboard', path: '/ats-dashboard', icon: FileSearch },
  { name: 'Role Suggestions', path: '/role-suggestions', icon: Target },
  { name: 'Role Interviews', path: '/role-interviews', icon: Briefcase },
  { name: 'Mock Interview', path: '/mock-interview', icon: MessageSquare },
  { name: 'Evaluation Dashboard', path: '/evaluation', icon: BarChart2 },
  { name: 'Progress Tracker', path: '/progress', icon: TrendingUp },
  { name: 'Support', path: '/support', icon: LifeBuoy },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-4 flex flex-col">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <span className="text-lg font-bold text-text">AI CareerPlatform</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-500 hover:text-text hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
