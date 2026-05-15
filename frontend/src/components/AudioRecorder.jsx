import React, { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';

const AudioRecorder = () => {
  const [stream, setStream] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  
  // Audio analysis refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lowAudioFramesRef = useRef(0);

  // Prevent closing tab during recording
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (recordingStatus === 'recording') {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [recordingStatus]);

  const startMicrophone = async () => {
    setError(null);
    setWarning(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      setStream(mediaStream);
    } catch (err) {
      handleError(err);
    }
  };

  const stopMicrophone = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      stopAudioAnalysis();
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    setVolume(0);
  };

  const startAudioAnalysis = (mediaStream) => {
    lowAudioFramesRef.current = 0;
    setWarning(null);
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(mediaStream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / dataArray.length;
      setVolume(avgVolume);

      // Low audio detection test case handling
      if (avgVolume < 10) {
        lowAudioFramesRef.current++;
        // Trigger low audio warning after roughly 3 seconds of sustained quiet (assuming 60fps)
        if (lowAudioFramesRef.current > 180) {
          setWarning("Low audio input detected. Please speak closer to the microphone.");
        }
      } else {
        lowAudioFramesRef.current = 0;
        setWarning(null);
      }

      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  const startRecording = () => {
    if (!stream) return;

    setRecordedUrl(null);
    setWarning(null);
    chunksRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordingStatus('inactive');
        stopAudioAnalysis();
      };

      mediaRecorder.onerror = (e) => {
        setError('Recording interrupted: ' + e.error.message);
        setRecordingStatus('inactive');
        stopAudioAnalysis();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200);
      setRecordingStatus('recording');
      
      startAudioAnalysis(stream);
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleError = (err) => {
    // Test cases: mic permission denied, no microphone
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('Microphone permission denied. Please allow access in browser settings.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setError('No microphone found. Please connect a microphone.');
    } else {
      setError('Audio device error: ' + err.message);
    }
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordedUrl]);

  // Test case: recording interrupted (e.g. physical mic disconnected)
  useEffect(() => {
    if (stream) {
      const handleTrackEnded = () => {
        if (recordingStatus === 'recording') {
          stopRecording();
          setError('Recording interrupted: Microphone disconnected.');
        } else {
          setError('Microphone disconnected.');
        }
        stopMicrophone();
      };
      
      stream.getAudioTracks().forEach((track) => {
        track.onended = handleTrackEnded;
      });
    }
  }, [stream, recordingStatus]);

  // Height for frequency visualizer based on active volume
  const visualizerHeight = Math.min(100, Math.max(5, (volume / 255) * 100 * 3));

  return (
    <div className="ar-container">
      <div className="ar-header">
        <h2>Audio Recorder</h2>
        {recordingStatus === 'recording' && (
          <div className="ar-status pulseing">
            <span className="dot"></span> Recording
          </div>
        )}
        {recordingStatus !== 'recording' && stream && (
          <div className="ar-status ready">
            <span className="dot ready-dot"></span> Ready to Record
          </div>
        )}
      </div>

      {error && (
        <div className="ar-alert ar-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{error}</p>
        </div>
      )}

      {warning && (
        <div className="ar-alert ar-warning" role="alert">
           <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{warning}</p>
        </div>
      )}

      <div className="ar-content">
        <div className="ar-visualizer-box">
           <h3>Live Audio Feed</h3>
           <div className={`ar-visualizer ${!stream ? 'empty' : ''}`}>
              {!stream ? (
                <p className="ar-placeholder">Microphone is off</p>
              ) : (
                <div className="ar-bars">
                  <div className="ar-bar" style={{ height: `${visualizerHeight}%` }}></div>
                  <div className="ar-bar" style={{ height: `${Math.max(5, visualizerHeight * 0.8)}%`, animationDelay: '0.1s' }}></div>
                  <div className="ar-bar" style={{ height: `${Math.max(5, visualizerHeight * 0.6)}%`, animationDelay: '0.2s' }}></div>
                  <div className="ar-bar" style={{ height: `${Math.max(5, visualizerHeight * 0.9)}%`, animationDelay: '0.3s' }}></div>
                  <div className="ar-bar" style={{ height: `${Math.max(5, visualizerHeight * 0.7)}%`, animationDelay: '0.4s' }}></div>
                </div>
              )}
           </div>
        </div>

        <div className="ar-playback-box">
          <h3>Playback</h3>
          <div className="ar-playback-wrapper">
             {recordedUrl ? (
               <audio src={recordedUrl} controls className="ar-audio-element" />
             ) : (
               <div className="ar-visualizer empty">
                  <p className="ar-placeholder">No recording available</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="ar-controls">
        {!stream ? (
          <button onClick={startMicrophone} className="ar-btn primary">
            Enable Microphone
          </button>
        ) : (
          <button 
            onClick={stopMicrophone} 
            disabled={recordingStatus === 'recording'}
            className="ar-btn secondary"
          >
            Disable Microphone
          </button>
        )}

        {stream && recordingStatus !== 'recording' && (
          <button onClick={startRecording} className="ar-btn success">
            Start Recording
          </button>
        )}

        {recordingStatus === 'recording' && (
          <button onClick={stopRecording} className="ar-btn danger">
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
