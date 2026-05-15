import React from 'react';

export default function ProgressBar({ progress, label, color = 'bg-primary' }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-text">{label}</span>
          <span className="text-sm font-medium text-text">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
