import React from 'react';

export default function Button({ children, variant = 'primary', className = '', disabled, as: Component = 'button', ...props }) {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none";
  
  const variants = {
    primary: "px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg hover:scale-105 focus:ring-indigo-500",
    secondary: "px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md hover:scale-105 focus:ring-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600",
    danger: "px-6 py-3 bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg hover:scale-105 focus:ring-red-500",
    ghost: "px-5 py-2.5 bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 shadow-none hover:shadow-none focus:ring-gray-200",
  };

  return (
    <Component 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
