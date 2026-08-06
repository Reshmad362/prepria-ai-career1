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
        {/* Logo placeholder - replace with actual logo if available */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#FF7A00] to-[#E66D00] rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FF7A00]/20">
          <span className="text-white font-bold text-2xl tracking-tighter">AI</span>
        </div>
        
        <h1 className="text-3xl font-bold text-[#111111] mb-3 tracking-tight">
          {title || "AI Career Intelligence Platform"}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
          {subtitle || "AI-Powered Adaptive Mock Interview & Career Readiness Platform"}
        </p>
      </motion.div>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
