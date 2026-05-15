import React, { useEffect, useState } from 'react';
import SettingsSection from '../components/SettingsSection';
import AccountSecurityCard from '../components/AccountSecurityCard';
import PreferencesCard from '../components/PreferencesCard';
import NotificationSettingsCard from '../components/NotificationSettingsCard';
import ThemeToggle from '../components/ThemeToggle';
import { Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
  }, []);

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant font-inter">Loading Settings...</div>;
  }

  const handleDeleteAccount = () => {
    if(window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion triggered. You would be redirected to the homepage.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 flex items-center gap-3 border-b border-outline-variant/15 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-[0_0_20px_rgba(204,151,255,0.2)]">
           <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
           <h1 className="text-3xl font-manrope font-bold text-on-surface mb-1">Platform Settings</h1>
           <p className="text-on-surface-variant font-inter text-sm">Manage preferences, security, and account behaviors.</p>
        </div>
      </div>

      <div className="space-y-12">
        <SettingsSection title="Account & Security" description="Manage your email, password, and actively connected sessions.">
           <AccountSecurityCard user={userData} />
        </SettingsSection>

        <SettingsSection title="Preferences" description="Customize default behaviors for mock interviews and AI evaluation.">
           <ThemeToggle />
           <PreferencesCard user={userData} />
        </SettingsSection>

        <SettingsSection title="Notifications" description="Choose how and when Lumina Intelligence contacts you.">
           <NotificationSettingsCard />
        </SettingsSection>

        <SettingsSection title="Privacy & Data Control" description="Manage your privacy footprint on the platform.">
           <div className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-center border-error/20 bg-error/5 group hover:bg-error/10 transition-colors">
              <div>
                <h4 className="font-semibold text-error mb-1 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Danger Zone</h4>
                <p className="text-sm text-on-surface-variant group-hover:text-error/80 transition-colors">Permanently delete your account and clear all mock interview history.</p>
              </div>
              <button onClick={handleDeleteAccount} className="px-6 py-2.5 rounded-xl border border-error/50 text-error hover:bg-error text-sm font-bold transition-colors hover:text-white whitespace-nowrap">
                Delete Account
              </button>
           </div>
        </SettingsSection>
      </div>
    </div>
  );
}
