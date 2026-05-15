import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    accent: "bg-accent/10 text-accent border border-accent/20",
    success: "bg-green-500/10 text-green-600 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
    neutral: "bg-gray-500/10 text-gray-600 dark:text-gray-300 border border-gray-500/20",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
