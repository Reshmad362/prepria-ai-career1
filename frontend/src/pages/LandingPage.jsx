import React from 'react';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';

import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/50 dark:from-background dark:to-background relative overflow-hidden">
      {/* Navbar for Landing Page */}
      <nav className="absolute top-0 w-full px-8 py-6 flex justify-between items-center z-[100] max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 m-0 cursor-pointer">
            AI Career Platform
          </h1>
        </div>
        <div className="flex items-center gap-6 relative z-[100]">
          <Link to="/login" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">Log in</Link>
          <Link to="/signup" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeatureCards />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-outline-variant/15 py-12 text-center mt-20">
        <p className="text-on-surface-variant font-inter text-sm">
          &copy; {new Date().getFullYear()} Lumina Intelligence. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
