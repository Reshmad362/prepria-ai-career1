import React, { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark'); // Since app is dark-native currently

  const options = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
      <div>
        <h4 className="font-semibold text-on-surface mb-1">Appearance Theme</h4>
        <p className="text-xs text-on-surface-variant">Customize how Lumina looks on your device.</p>
      </div>
      
      <div className="flex p-1 bg-surface-container-high rounded-xl border border-outline-variant/20">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary/20 text-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
