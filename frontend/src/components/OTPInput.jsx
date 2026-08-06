import React, { useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, value, onChange, disabled }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    // Keep inputsRef array length in sync with 'length' prop
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Allow only numbers
    if (val && !/^\d+$/.test(val)) return;

    const newValue = value.split('');
    newValue[index] = val.slice(-1); // Take only the last character if multiple are somehow typed
    const combined = newValue.join('');
    
    onChange(combined);

    // Auto move to next input
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, move back and clear the previous one
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputsRef.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-[#111111] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
