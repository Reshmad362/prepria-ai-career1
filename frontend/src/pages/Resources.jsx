import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Resources() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Career Resources & Practice Questions
        </h1>
        <p className="text-gray-500 mt-2">Explore over 1000+ practice questions and guides to prepare smarter.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-border p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-4">Practice Questions Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto">We are currently curating the best interview questions and materials for your specific roles. Check back soon!</p>
      </div>
    </div>
  );
}
