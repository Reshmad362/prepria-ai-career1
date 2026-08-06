import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSearch, MessageSquare, BarChart2, LifeBuoy, BookOpen, Briefcase, UserCircle, Settings, Files, Map } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', path: '/profile', icon: UserCircle },
  { name: 'Document Center', path: '/document-center', icon: Files },
  { name: 'Resume Intelligence', path: '/resume-upload', icon: FileSearch },
  { name: 'Career Roadmap', path: '/career-roadmap', icon: Map },
  { name: 'AI Mock Interviews', path: '/mock-interview', icon: MessageSquare },
  { name: 'AI Learning Hub', path: '/my-courses', icon: BookOpen },
  { name: 'Progress Analytics', path: '/progress', icon: BarChart2 },
  { name: 'Job Board', path: '/jobs', icon: Briefcase },
  { name: 'Settings', path: '/preferences', icon: Settings },
  { name: 'Support', path: '/support', icon: LifeBuoy },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-4 flex flex-col">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center shadow-md shadow-[#FF6B00]/20">
          <span className="text-white font-bold text-xl font-poppins">A</span>
        </div>
        <span className="text-lg font-bold text-text font-poppins">AI Career</span>
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
