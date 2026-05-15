import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function EnvironmentChecklist({ checks }) {
  const checkItems = [
    { id: 'camera', label: checks.camera?.text || 'Camera Check', status: checks.camera?.status || 'checking' },
    { id: 'mic', label: checks.mic?.text || 'Microphone Check', status: checks.mic?.status || 'checking' },
    { id: 'lighting', label: checks.lighting?.text || 'Lighting Check', status: checks.lighting?.status || 'checking' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 tracking-wide">Environment Checks</h3>
      <ul className="space-y-4">
        {checkItems.map((item, index) => (
          <motion.li 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            {item.status === 'checking' && (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            {item.status === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {item.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {item.status === 'warning' && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            
            <span className={`font-medium ${
               item.status === 'success' ? 'text-slate-800 dark:text-white' : 
               item.status === 'error' ? 'text-red-500' :
               item.status === 'warning' ? 'text-yellow-500' :
               'text-slate-500'
            }`}>
              {item.label}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
