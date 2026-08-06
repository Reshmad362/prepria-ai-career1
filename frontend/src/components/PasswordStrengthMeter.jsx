import React from 'react';

export default function PasswordStrengthMeter({ password }) {
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    
    // Min 8 chars
    if (pass.length >= 8) score += 1;
    // Uppercase
    if (/[A-Z]/.test(pass)) score += 1;
    // Lowercase
    if (/[a-z]/.test(pass)) score += 1;
    // Number
    if (/[0-9]/.test(pass)) score += 1;
    // Special Char
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    return score;
  };

  const score = calculateStrength(password);
  
  const getStrengthData = () => {
    if (score === 0) return { label: 'None', color: 'bg-gray-200', text: 'text-gray-400' };
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
  };

  const strengthData = getStrengthData();

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-500">Password Strength</span>
        <span className={`text-xs font-bold ${strengthData.text}`}>{strengthData.label}</span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level} 
            className={`flex-1 transition-all duration-300 ${score >= level ? strengthData.color : 'bg-transparent'}`}
          ></div>
        ))}
      </div>
      
      {/* Live Requirements Checklist */}
      <div className="mt-3 grid grid-cols-2 gap-y-1 gap-x-2">
        <RequirementItem met={password.length >= 8} label="8+ Characters" />
        <RequirementItem met={/[A-Z]/.test(password)} label="Uppercase" />
        <RequirementItem met={/[a-z]/.test(password)} label="Lowercase" />
        <RequirementItem met={/[0-9]/.test(password)} label="Number" />
        <RequirementItem met={/[^A-Za-z0-9]/.test(password)} label="Special Char" />
      </div>
    </div>
  );
}

function RequirementItem({ met, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-green-500' : 'bg-gray-200'}`}>
        {met && (
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-[11px] font-medium transition-colors ${met ? 'text-gray-700' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
