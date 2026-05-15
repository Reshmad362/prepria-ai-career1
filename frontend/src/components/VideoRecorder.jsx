import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Play, RefreshCw, AlertCircle, Video } from 'lucide-react';

const VideoRecorder = ({ onTranscription, onEmotionUpdate, onRecordingComplete }) => {
  const [stream, setStream] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive'); // inactive, recording, recorded
  const [error, setError] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const liveVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(document.createElement('canvas'));
  const emotionIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      stopWebcam();
      if (emotionIntervalRef.current) clearInterval(emotionIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startWebcam = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setStream(mediaStream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream;
      }
      setupAudioMeter(mediaStream);
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Camera/Mic permission denied.' : 'Media device error: ' + err.message);
    }
  };

  const setupAudioMeter = (mediaStream) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      setAudioLevel(sum / bufferLength);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // EMOTION DETECTION POLLING
  const captureFrame = async () => {
    if (!liveVideoRef.current || recordingStatus !== 'recording') return;
    
    const video = liveVideoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    try {
      const res = await fetch('http://127.0.0.1:8000/emotion-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64_image: base64Image })
      });
      const data = await res.json();
      if (data.success && onEmotionUpdate) {
        onEmotionUpdate(data.data);
      }
    } catch (e) {
      console.error("Emotion analysis failed", e);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    setRecordedUrl(null);
    chunksRef.current = [];

    const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
      ? { mimeType: 'video/webm;codecs=vp9,opus' } 
      : { mimeType: 'video/webm' };

    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setRecordingStatus('recorded');
      
      if (onRecordingComplete) onRecordingComplete(url);

      // Stop emotion polling
      clearInterval(emotionIntervalRef.current);
      
      // Send for transcription
      await sendAudioToBackend(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecordingStatus('recording');
    
    // Start polling emotion every 1.5 seconds
    emotionIntervalRef.current = setInterval(captureFrame, 1500);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToBackend = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("file", blob);
      const response = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (onTranscription) onTranscription(data.text);
    } catch (err) {
      console.error("Transcription failed", err);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/15 mb-4 shadow-xl">
        {recordingStatus === 'recorded' && recordedUrl ? (
          <video src={recordedUrl} controls className="w-full h-full object-cover" />
        ) : (
          <>
            <video ref={liveVideoRef} autoPlay muted className={`w-full h-full object-cover ${stream ? 'opacity-100' : 'opacity-0'}`} />
            
            {!stream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-outline-variant">
                 <Camera className="w-12 h-12 mb-2 opacity-50" />
                 <p className="font-medium text-sm">Camera Offline</p>
              </div>
            )}

            {/* Overlays */}
            {stream && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-2 bg-surface-container-low/80 backdrop-blur px-3 py-1.5 rounded-full border border-outline-variant/30">
                  <Video className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-on-surface tracking-wider uppercase">Live Feed</span>
                </div>
                
                {recordingStatus === 'recording' && (
                  <div className="flex items-center gap-2 bg-error/10 backdrop-blur px-3 py-1.5 rounded-full border border-error/30 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_var(--error)]"></div>
                    <span className="text-xs font-bold text-error tracking-wider uppercase">REC</span>
                  </div>
                )}
              </div>
            )}

            {/* Audio Waveform Indicator */}
            {stream && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="flex items-center gap-1 h-6">
                  <div className="w-1 bg-secondary/80 rounded-full transition-all duration-75" style={{ height: `${Math.max(20, audioLevel)}%` }}></div>
                  <div className="w-1 bg-secondary/80 rounded-full transition-all duration-75" style={{ height: `${Math.max(20, audioLevel * 1.5)}%` }}></div>
                  <div className="w-1 bg-secondary/80 rounded-full transition-all duration-75" style={{ height: `${Math.max(20, audioLevel * 0.8)}%` }}></div>
                  <div className="w-1 bg-secondary/80 rounded-full transition-all duration-75" style={{ height: `${Math.max(20, audioLevel * 1.2)}%` }}></div>
                </div>
                <div className={`p-2 rounded-full backdrop-blur border ${audioLevel > 10 ? 'bg-secondary/20 border-secondary/30 text-secondary' : 'bg-surface-container/50 border-outline-variant/30 text-on-surface-variant'}`}>
                  <Mic className="w-4 h-4" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!stream && recordingStatus === 'inactive' && (
          <button onClick={startWebcam} className="btn-secondary flex items-center justify-center gap-2 w-full">
            <Camera className="w-5 h-5" /> Enable Camera
          </button>
        )}

        {stream && recordingStatus === 'inactive' && (
          <>
            <button onClick={startRecording} className="btn-primary w-full flex items-center justify-center gap-2 !bg-gradient-to-r !from-error !to-[#ff86c3] border-none shadow-[0_0_20px_rgba(255,110,132,0.4)]">
              <span className="w-3 h-3 bg-white rounded-full"></span> Start Recording
            </button>
            <button onClick={stopWebcam} className="btn-secondary p-3" title="Disable Camera">
               <RefreshCw className="w-5 h-5" />
            </button>
          </>
        )}

        {recordingStatus === 'recording' && (
          <button onClick={stopRecording} className="btn-secondary w-full flex items-center justify-center gap-2 border-error/50 text-error hover:bg-error/10">
            <Square className="w-4 h-4 fill-current" /> Stop Recording
          </button>
        )}

        {recordingStatus === 'recorded' && (
          <>
            <button onClick={() => { setRecordedUrl(null); setRecordingStatus('inactive'); startWebcam(); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;