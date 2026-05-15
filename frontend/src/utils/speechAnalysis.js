// speechAnalysis.js

export const speakQuestion = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.95; 
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Try to find a good voice (preferably a natural english-speaking female or male depending on preference)
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Basic heuristic to pick a decent English voice
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (preferred) {
        utterance.voice = preferred;
      }
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoice();
      window.speechSynthesis.speak(utterance);
    };
  } else {
    setVoice();
    window.speechSynthesis.speak(utterance);
  }

  return utterance;
};

export const cancelSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
