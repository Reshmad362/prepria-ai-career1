import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F8] px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 z-10"
      >
        {/* Logo with PREPRIA orange gradient */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#E05D00] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FF6B00]/25">
          <span className="text-white font-extrabold text-2xl">P</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#111111] dark:text-white mb-2 tracking-tight">
          {title || "PREPRIA"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
          {subtitle || "CAREER INTELLIGENCE"}
        </p>
      </motion.div>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
