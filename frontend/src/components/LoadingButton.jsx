import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingButton({ 
  children, 
  isLoading, 
  variant = "primary",
  className = "", 
  disabled,
  ...props 
}) {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#FF7A00] hover:bg-[#E66D00] text-white shadow-md shadow-[#FF7A00]/20 hover:shadow-lg hover:shadow-[#FF7A00]/30",
    secondary: "bg-gray-100 hover:bg-gray-200 text-[#111111]",
    outline: "border-2 border-gray-200 hover:border-[#FF7A00] text-[#111111] hover:text-[#FF7A00] bg-transparent"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
