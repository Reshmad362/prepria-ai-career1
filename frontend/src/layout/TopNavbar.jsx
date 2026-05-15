import React, { useState, useRef, useEffect, useContext } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import { Sun, Moon, Bell, User, LogOut, Settings, UserCircle, CheckCircle, AlertTriangle, Calendar, FileText, Briefcase, TrendingUp, Clock, Mic, Target, MessageSquare, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { profile, clearProfile } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearProfile();
    navigate('/login');
  };

  const handleLinkClick = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  // Dynamic Notifications State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const data = JSON.parse(localStorage.getItem("notifications")) || [];
      setNotifications(data);
    };

    loadNotifications();

    window.addEventListener("notificationLogged", loadNotifications);

    return () => {
      window.removeEventListener("notificationLogged", loadNotifications);
    };
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notificationLogged')); // optionally sync other tabs/places
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeHelper = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return Math.floor(diff / 86400000) + "d ago";
  };

  const getNotifIcon = (type) => {
    switch(type) {
      case 'resume_upload': return <FileText className="w-4 h-4 text-gray-500" />;
      case 'role_suggestion': 
      case 'new_role_recommended': return <Target className="w-4 h-4 text-purple-500" />;
      case 'interview_complete': return <Mic className="w-4 h-4 text-indigo-500" />;
      case 'ats_analysis': 
      case 'ats_low_score_warning': return <BarChart className="w-4 h-4 text-blue-500" />;
      case 'support_reply_received': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityStyle = (priority, isRead) => {
    let base = "p-4 border-b border-border transition-colors cursor-pointer flex gap-3 ";
    if (!isRead) base += "border-l-4 ";
    
    switch(priority) {
      case 'success': return base + "bg-green-50/50 hover:bg-green-50 border-l-green-500 dark:bg-green-900/10 dark:hover:bg-green-900/20";
      case 'warning': return base + "bg-yellow-50/50 hover:bg-yellow-50 border-l-yellow-500 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20";
      case 'info': return base + "bg-blue-50/50 hover:bg-blue-50 border-l-blue-500 dark:bg-blue-900/10 dark:hover:bg-blue-900/20";
      case 'important': return base + "bg-red-50/50 hover:bg-red-50 border-l-red-500 dark:bg-red-900/10 dark:hover:bg-red-900/20";
      default: return base + (!isRead ? 'bg-primary/5 dark:bg-primary/5 border-l-primary' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-transparent');
    }
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-end px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-card"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          <div className={`absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-200 transform origin-top-right ${notificationsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-bold text-text">Notifications</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{unreadCount} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={getPriorityStyle(notif.priority, notif.isRead)}>
                    <div className="mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-text' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeHelper(notif.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 text-center bg-gray-50/50 dark:bg-gray-800/20">
              <button onClick={markAllAsRead} className="text-sm font-medium text-primary hover:text-primary-dim transition-colors">Mark all as read</button>
            </div>
          </div>
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-medium border border-indigo-200 dark:border-indigo-800 hover:ring-2 ring-indigo-500/30 transition-all cursor-pointer overflow-hidden"
          >
            {profile?.picture ? (
              <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : profile?.name && profile.name !== "Not found" ? (
              profile.name.charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className={`absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-200 transform origin-top-right ${profileOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
            <div className="p-4 border-b border-border bg-gray-50/50 dark:bg-gray-800/20 flex items-center gap-3">
              {profile?.picture && (
                <img src={profile.picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-border" />
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-text truncate">{(profile?.name && profile.name !== "Not found") ? profile.name : 'Guest User'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{(profile?.email && profile.email !== "Not found") ? profile.email : 'Not signed in'}</p>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button onClick={() => handleLinkClick('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <UserCircle className="w-4 h-4" /> Profile Overview
              </button>
              <button onClick={() => handleLinkClick('/preferences')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> Preferences
              </button>
            </div>
            <div className="px-2 pb-2 pt-1 border-t border-border mt-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
