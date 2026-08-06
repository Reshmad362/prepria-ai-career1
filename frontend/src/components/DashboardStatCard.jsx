import React from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function DashboardStatCard({ title, value, icon: Icon, trend, trendValue, subtitle, colorClass = "text-primary bg-primary/10", loading = false }) {
  if (loading) {
    return (
      <Card className="flex flex-col gap-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500 ease-in-out ${colorClass.split(' ')[1]}`}></div>
      
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-500 dark:text-gray-400 font-inter">{title}</h3>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold text-text font-poppins">{value}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          {subtitle && <span className="text-sm font-medium text-gray-500">{subtitle}</span>}
          
          {trend && (
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
              trend === 'up' ? 'text-success bg-success/10' : 
              trend === 'down' ? 'text-danger bg-danger/10' : 
              'text-gray-500 bg-gray-100 dark:bg-gray-800'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
