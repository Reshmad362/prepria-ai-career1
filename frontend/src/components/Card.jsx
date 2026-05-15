import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Card({ children, className = '', animate = true, ...props }) {
  const [isVisible, ref] = useScrollReveal();

  const animationClasses = animate 
    ? `transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}` 
    : '';

  return (
    <div 
      ref={ref}
      className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 ${animationClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
