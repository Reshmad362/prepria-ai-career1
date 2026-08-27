import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSearch, MessageSquare, BarChart2, LifeBuoy, BookOpen, Briefcase, UserCircle, Settings, Files, Map } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', path: '/profile', icon: UserCircle },
  { name: 'Document Center', path: '/document-center', icon: Files },
  { name: 'Resume Intelligence', path: '/resume-upload', icon: FileSearch },
  { name: 'Career Roadmap', path: '/career-roadmap', icon: Map },
  { name: 'AI Mock Interviews', path: '/role-interviews', icon: MessageSquare },
  { name: 'AI Learning Hub', path: '/my-courses', icon: BookOpen },
  { name: 'Progress Analytics', path: '/progress', icon: BarChart2 },
  { name: 'Job Board', path: '/jobs', icon: Briefcase },
  { name: 'Settings', path: '/preferences', icon: Settings },
  { name: 'Support', path: '/support', icon: LifeBuoy },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#111215] border-r border-gray-200 dark:border-white/[0.08] p-4 flex flex-col z-30 font-manrope">
      {/* PREPRIA Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05D00] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-[#FF6B00]/25 shrink-0">
          P
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">PREPRIA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[#FF6B00] font-extrabold mt-0.5">CAREER INTELLIGENCE</span>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FFF1E8] dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
