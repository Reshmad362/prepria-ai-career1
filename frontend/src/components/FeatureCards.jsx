import React from 'react';
import { FileSearch, BrainCircuit, ActivitySquare } from 'lucide-react';

export default function FeatureCards() {
  const features = [
    {
      icon: FileSearch,
      title: 'Smart Resume Analysis',
      description: 'Our AI engine parses your experience and identifies skill gaps against top industry roles instantly.'
    },
    {
      icon: BrainCircuit,
      title: 'Adaptive Mock Interviews',
      description: 'Practice with a dynamic AI interviewer that tailors questions based on your specific target role.'
    },
    {
      icon: ActivitySquare,
      title: 'Real-time Emotion & Speech',
      description: 'Get deep insights into your confidence, filler word usage, and non-verbal cues during practice.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Intelligent Career Tools</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg hover:text-gray-900 transition-colors">Everything you need to navigate your career path with clarity and confidence.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
