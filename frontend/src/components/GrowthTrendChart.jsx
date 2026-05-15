import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function GrowthTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-on-surface-variant text-sm font-medium">
        Complete an interview to start tracking growth.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CC97FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#CC97FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#686F7A" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#686F7A" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1821', borderColor: 'rgba(204,151,255,0.2)', borderRadius: '12px' }}
            itemStyle={{ color: '#E8E4EC' }}
            cursor={{ stroke: 'rgba(204,151,255,0.2)' }}
          />
          <Area type="monotone" dataKey="score" stroke="#CC97FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
