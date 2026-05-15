import React, { useState } from 'react';
import { Bell, Mail, Target, Award } from 'lucide-react';

export default function NotificationSettingsCard() {
  const [settings, setSettings] = useState({
    marketing: false,
    reminders: true,
    weekly: true,
    milestones: true
  });

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ label, description, isChecked, onChange, icon: Icon, colorClass }) => (
    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-on-surface text-sm">{label}</h4>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isChecked ? 'bg-primary' : 'bg-surface-variant'}`}
      >
        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-0'}`}></span>
      </button>
    </div>
  );

  return (
    <div className="glass-card p-6 space-y-3">
      <ToggleSwitch 
        label="Interview Reminders" 
        description="Get notified 1 hour before scheduled mock sessions."
        isChecked={settings.reminders}
        onChange={() => toggle('reminders')}
        icon={Bell}
        colorClass="text-secondary"
      />
      
      <ToggleSwitch 
        label="Weekly Performance Summary" 
        description="Receive an email breakdown of your growth every Monday."
        isChecked={settings.weekly}
        onChange={() => toggle('weekly')}
        icon={Mail}
        colorClass="text-[#00D4FF]"
      />
      
      <ToggleSwitch 
        label="Growth Milestone Alerts" 
        description="Celebrate when you hit new high scores or ATS thresholds."
        isChecked={settings.milestones}
        onChange={() => toggle('milestones')}
        icon={Target}
        colorClass="text-primary"
      />
      
      <ToggleSwitch 
        label="Product Updates & Marketing" 
        description="Occasional emails about new features and Premium offers."
        isChecked={settings.marketing}
        onChange={() => toggle('marketing')}
        icon={Award}
        colorClass="text-on-surface-variant"
      />
    </div>
  );
}
