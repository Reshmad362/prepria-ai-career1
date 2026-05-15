import React from 'react';

export default function SettingsSection({ title, description, children }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="mb-6">
        <h3 className="text-xl font-bold font-manrope text-on-surface mb-1">{title}</h3>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
