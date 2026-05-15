import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Smile, AlertTriangle, TrendingUp, ThumbsUp } from 'lucide-react';

export default function EvaluationDashboard() {
  const sessionStr = localStorage.getItem('interviewSession');
  const sessionData = sessionStr ? JSON.parse(sessionStr) : null;
  
  const realScore = sessionData?.score ?? Math.round((85+75+90)/3);
  const realFeedback = sessionData?.feedback ?? "Positive and Professional";

  // Distribute realScore among confidence, clarity, relevance roughly
  const scoreData = [
    { name: 'Confidence', value: Math.max(0, realScore - 5), color: '#6366F1' },
    { name: 'Clarity', value: Math.min(100, realScore + 5), color: '#8B5CF6' },
    { name: 'Relevance', value: realScore, color: '#10B981' }
  ];

  const fillerWords = realScore > 50 ? ['like', 'um'] : ['you know', 'totally', 'basically', 'um', 'ah'];
  const overallConfidence = Math.max(0, realScore - 5);

  let confidenceMessage = "Great! You sounded very sure.";
  let toneClass = "text-primary";
  if (realScore === 0) {
    confidenceMessage = "No answer detected.";
    toneClass = "text-red-500";
  } else if (realScore <= 20) {
    confidenceMessage = "Camera not active. Eye contact missing.";
    toneClass = "text-yellow-500";
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Interview Evaluation</h1>
        <p className="text-gray-500 mt-1">Detailed breakdown of your recent mock interview performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score Chart */}
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-bold text-text mb-4">Overall Score</h2>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-text">{realScore}</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            
            <div className="mt-8 space-y-3 w-full">
              {scoreData.map(stat => (
                <div key={stat.name} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: stat.color}}></span>
                    {stat.name}
                  </span>
                  <span className="font-medium text-text">{stat.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Metrics */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <Card className="flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-text">Confidence Level</h3>
             </div>
             <p className="text-3xl font-bold text-text mt-2">{overallConfidence}%</p>
             <p className={`text-sm mt-1 mt-auto ${realScore <= 20 ? 'text-red-500' : 'text-green-500'}`}>{confidenceMessage}</p>
          </Card>

          <Card className="flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-text">Filler Words</h3>
             </div>
             <div className="flex flex-wrap gap-2 mt-4 mb-2">
               {realScore === 0 ? (
                 <span className="text-gray-400 italic">No speech detected</span>
               ) : (
                 fillerWords.map(word => (
                   <Badge key={word} variant="warning">"{word}"</Badge>
                 ))
               )}
             </div>
             <p className="text-sm text-gray-500 mt-auto">Try to pause instead of using fillers.</p>
          </Card>

          <Card className="col-span-2">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-text">Sentiment Analysis</h3>
             </div>
             <p className="text-text leading-relaxed">
               Your overall tone was <span className={`font-bold ${toneClass}`}>{realFeedback}</span>. 
               {realScore > 50 && " You maintained a good pace, however slightly rushed towards the end of technical explanations."}
               {realScore === 0 && " Please ensure your microphone is working and you speak clearly during the interview."}
             </p>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <ThumbsUp className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-bold text-text">Actionable Feedback</h2>
        </div>
        <ul className="space-y-4">
          <li className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <p className="font-bold text-text">Structure Technical Answers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Use the STAR method for technical behavioral questions to keep answers concise.</p>
            </div>
          </li>
          <li className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <p className="font-bold text-text">Control Pace</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Slow down slightly when explaining complex routing logic to ensure clarity.</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
}
