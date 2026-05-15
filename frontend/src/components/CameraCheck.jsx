import React, { useEffect, useRef, useState } from 'react';
import { VideoOff, Loader2 } from 'lucide-react';

export default function CameraCheck({ streamRef, onLightingChecked, onCameraStatus }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [validating, setValidating] = useState(false);

  // 1. Fix Video Stream Initialization
  useEffect(() => {
    const initStream = async () => {
      console.log("[CameraCheck] Init stream check");
      if (videoRef.current && streamRef?.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
            console.log("[CameraCheck] Setting srcObject");
            videoRef.current.srcObject = streamRef.current;
        }
        try {
          // Stabilize video playback
          await videoRef.current.play();
        } catch (err) {
          console.error("[CameraCheck] Error playing video:", err);
        }
      }
    };
    initStream();
  }, [streamRef]);

  // 3. Proper Camera Validation Flow
  useEffect(() => {
    if (!streamRef || !streamRef.current) {
      if (onCameraStatus) onCameraStatus('off');
      return;
    }

    setValidating(true);
    if (onCameraStatus) onCameraStatus('checking');

    let reqId;
    let timeoutId;

    const validate = () => {
      const checkFrame = () => {
         if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
            clearTimeout(timeoutId);
            setValidating(false);
            if (onCameraStatus) onCameraStatus('success');
         } else {
            reqId = requestAnimationFrame(checkFrame);
         }
      };
      
      reqId = requestAnimationFrame(checkFrame);

      // Timeout Protection
      timeoutId = setTimeout(() => {
        cancelAnimationFrame(reqId);
        setValidating(false);
        if (onCameraStatus) onCameraStatus('failed');
      }, 3000);
    };

    validate();

    return () => {
      cancelAnimationFrame(reqId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamRef]);

  // 4. Fix Lighting Check (CRITICAL)
  useEffect(() => {
    if (!streamRef || !streamRef.current || !onLightingChecked || validating) return;

    let reqLightingId;
    let stopLoop = false;

    const checkLighting = () => {
      if (stopLoop) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let colorSum = 0;
          let samples = 0;
          
          for (let x = 0, len = data.length; x < len; x += 160) {
            const r = data[x];
            const g = data[x + 1];
            const b = data[x + 2];
            colorSum += Math.floor((r + g + b) / 3);
            samples++;
          }
          
          if (samples > 0) {
            const brightness = Math.floor(colorSum / samples);
            if (brightness >= 40) {
              onLightingChecked('success');
              stopLoop = true;
              return;
            } else {
              onLightingChecked('warning');
            }
          }
        } catch (e) {
          onLightingChecked('warning');
        }
      }
      
      reqLightingId = requestAnimationFrame(checkLighting);
    };

    reqLightingId = requestAnimationFrame(checkLighting);

    return () => {
      stopLoop = true;
      cancelAnimationFrame(reqLightingId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamRef, validating]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-800 flex items-center justify-center">
      {streamRef?.current ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay
            muted 
            playsInline 
            className={`w-full h-full object-cover transform -scale-x-100 ${validating ? 'opacity-50' : 'opacity-100'}`}
          />
          {/* Hidden canvas for computing brightness */}
          <canvas ref={canvasRef} className="hidden" />
          
          {validating && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                <p className="text-white font-medium text-lg">Checking Camera...</p>
             </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500">
          <VideoOff className="w-12 h-12 mb-3 opacity-50" />
           <p className="font-medium">Camera offline</p>
        </div>
      )}
    </div>
  );
}
