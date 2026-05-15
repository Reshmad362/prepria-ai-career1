import React from 'react';
import { Eye, CheckCircle2, XCircle, HelpCircle, Activity } from 'lucide-react';

const EmotionAnalyticsCard = ({ data }) => {
  if (!data) return null;

  const {
    emotion,
    confidence,
    face_detected,
    multiple_faces,
    lighting_quality,
    frame_quality
  } = data;

  const emotionMap = {
    'Happy': { icon: CheckCircle2, textClass: 'text-tertiary', bgClass: 'bg-tertiary/10', borderClass: 'border-tertiary/20' },
    'Confident': { icon: CheckCircle2, textClass: 'text-tertiary', bgClass: 'bg-tertiary/10', borderClass: 'border-tertiary/20' },
    'Neutral': { icon: Activity, textClass: 'text-secondary', bgClass: 'bg-secondary/10', borderClass: 'border-secondary/20' },
    'Nervous': { icon: XCircle, textClass: 'text-error', bgClass: 'bg-error/10', borderClass: 'border-error/20' },
    'Stressed': { icon: XCircle, textClass: 'text-error', bgClass: 'bg-error/10', borderClass: 'border-error/20' },
    'Confused': { icon: HelpCircle, textClass: 'text-secondary', bgClass: 'bg-secondary/10', borderClass: 'border-secondary/20' },
    'No Face': { icon: XCircle, textClass: 'text-outline', bgClass: 'bg-outline/10', borderClass: 'border-outline/20' },
    'Multiple Faces': { icon: XCircle, textClass: 'text-error', bgClass: 'bg-error/10', borderClass: 'border-error/20' }
  };

  const getBadging = (val, goodLabel) => {
    if (val === goodLabel) return { textClass: 'text-tertiary', bgClass: 'bg-tertiary/10' };
    if (val === 'Unknown') return { textClass: 'text-outline', bgClass: 'bg-outline/10' };
    return { textClass: 'text-error', bgClass: 'bg-error/10' };
  };

  const currentEmotion = emotionMap[emotion] || emotionMap['Neutral'];
  const emotionConfidencePct = Math.round(confidence * 100);

  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="flex items-center gap-3 m-0 text-xl text-on-surface">
          <Eye className="w-6 h-6 text-primary" /> Emotion Analysis
        </h3>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${currentEmotion.bgClass} ${currentEmotion.textClass} border ${currentEmotion.borderClass}`}>
          <currentEmotion.icon className="w-4 h-4" /> {emotion}
        </span>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-3 text-sm font-medium">
          <span className="text-on-surface-variant">Confidence Level</span>
          <span className={`font-bold ${currentEmotion.textClass}`}>{emotionConfidencePct}%</span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${currentEmotion.bgClass.replace('/10', '')}`}
            style={{ width: `${emotionConfidencePct}%`, backgroundColor: currentEmotion.textClass === 'text-tertiary' ? '#ff86c3' : currentEmotion.textClass === 'text-secondary' ? '#34b5fa' : '#ff6e84' }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-surface-container/50 backdrop-blur-md p-5 rounded-xl border border-outline-variant/15">
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface font-medium">Face Detection</span>
          <span className={`px-3 py-1 rounded-md text-xs font-bold ${face_detected ? (multiple_faces ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary') : 'bg-outline/10 text-outline'}`}>
            {face_detected ? (multiple_faces ? 'Multiple Detected' : 'Detected') : 'Not Detected'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface font-medium">Lighting Quality</span>
          <span className={`px-3 py-1 rounded-md text-xs font-bold ${getBadging(lighting_quality, 'Good').bgClass} ${getBadging(lighting_quality, 'Good').textClass}`}>
            {lighting_quality}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface font-medium">Frame Quality</span>
          <span className={`px-3 py-1 rounded-md text-xs font-bold ${getBadging(frame_quality, 'Sharp').bgClass} ${getBadging(frame_quality, 'Sharp').textClass}`}>
            {frame_quality}
          </span>
        </div>

      </div>
    </div>
  );
};

export default EmotionAnalyticsCard;
