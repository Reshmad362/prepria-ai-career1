import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Dedicated AI Mock Interview Proctoring Hook
 * Centralizes tab visibility, camera, microphone, screen sharing, and face presence monitoring
 * with event locking, grace periods, anti-cheating rules, and 3-warning auto-termination.
 */
export function useInterviewProctoring({
  enabled = true,
  requireVideo = true,
  requireAudio = true,
  requireScreen = false,
  cameraStream = null,
  screenStream = null,
  videoElement = null,
  onTerminate = () => {}
}) {
  const [warningCount, setWarningCount] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [activeWarning, setActiveWarning] = useState("");
  const [cameraStatus, setCameraStatus] = useState("active");
  const [microphoneStatus, setMicrophoneStatus] = useState("active");
  const [screenShareStatus, setScreenShareStatus] = useState(requireScreen ? "active" : "not_required");
  const [faceDetected, setFaceDetected] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [interviewTerminated, setInterviewTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  // Refs for stable state tracking across event listeners
  const warningCountRef = useRef(0);
  const isTerminatedRef = useRef(false);
  const warningsListRef = useRef([]);

  // Event violation locks to prevent duplicate warnings for a single continuous issue
  const tabViolationActiveRef = useRef(false);
  const cameraViolationActiveRef = useRef(false);
  const micViolationActiveRef = useRef(false);
  const screenViolationActiveRef = useRef(false);
  const faceViolationActiveRef = useRef(false);
  const faceMissingTimerRef = useRef(null);

  // Canvas for lightweight client-side face presence detection
  const canvasRef = useRef(null);
  const monitorIntervalRef = useRef(null);
  const warningDismissTimeoutRef = useRef(null);

  // Central Warning Function: Single entry point for all proctoring violations
  const addProctoringWarning = useCallback((reason, type = "GENERAL") => {
    if (isTerminatedRef.current || !enabled) return;

    const newCount = warningCountRef.current + 1;
    warningCountRef.current = newCount;
    setWarningCount(newCount);

    const violationRecord = {
      id: `warn-${Date.now()}`,
      count: newCount,
      maxWarnings: 3,
      type,
      message: reason,
      timestamp: new Date().toISOString()
    };

    warningsListRef.current.push(violationRecord);
    setWarnings([...warningsListRef.current]);

    // Display visible banner to candidate
    setActiveWarning(`⚠ Proctoring Warning ${newCount}/3: ${reason}`);
    if (warningDismissTimeoutRef.current) clearTimeout(warningDismissTimeoutRef.current);
    warningDismissTimeoutRef.current = setTimeout(() => {
      setActiveWarning("");
    }, 6000);

    // Check for 3rd warning automatic termination
    if (newCount >= 3) {
      isTerminatedRef.current = true;
      setInterviewTerminated(true);
      const termReason = "Interview automatically terminated after 3 proctoring violations.";
      setTerminationReason(termReason);

      // Stop all background intervals
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);

      // Trigger automatic submission callback
      if (typeof onTerminate === 'function') {
        onTerminate(termReason, warningsListRef.current);
      }
    }
  }, [enabled, onTerminate]);

  // 1. Tab Switching & Page Visibility API
  useEffect(() => {
    if (!enabled || isTerminatedRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabVisible(false);
        if (!tabViolationActiveRef.current) {
          tabViolationActiveRef.current = true;
          addProctoringWarning("Tab switch detected. Please keep the interview window active.", "TAB_SWITCH");
        }
      } else {
        setTabVisible(true);
        // Reset lock when candidate returns so future tab switches can be detected
        tabViolationActiveRef.current = false;
      }
    };

    const handleWindowBlur = () => {
      // Handled primarily via document.visibilitychange to prevent double-counting
      if (document.hidden && !tabViolationActiveRef.current) {
        tabViolationActiveRef.current = true;
        addProctoringWarning("Interview window lost focus. Please remain in full view.", "WINDOW_BLUR");
      }
    };

    const handleWindowFocus = () => {
      tabViolationActiveRef.current = false;
      setTabVisible(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [enabled, addProctoringWarning]);

  // 2. Camera & Microphone Hardware Stream Monitoring
  useEffect(() => {
    if (!enabled || isTerminatedRef.current || !cameraStream) return;

    const checkTracks = () => {
      if (isTerminatedRef.current) return;

      // Video track check
      if (requireVideo) {
        const videoTracks = cameraStream.getVideoTracks();
        const hasActiveVideo = videoTracks.length > 0 && videoTracks[0].enabled && videoTracks[0].readyState === 'live';

        if (!hasActiveVideo) {
          setCameraStatus("inactive");
          if (!cameraViolationActiveRef.current) {
            cameraViolationActiveRef.current = true;
            addProctoringWarning("Camera was turned off or disconnected.", "CAMERA_OFF");
          }
        } else {
          setCameraStatus("active");
          cameraViolationActiveRef.current = false;
        }
      }

      // Audio track check
      if (requireAudio) {
        const audioTracks = cameraStream.getAudioTracks();
        const hasActiveAudio = audioTracks.length > 0 && audioTracks[0].enabled && audioTracks[0].readyState === 'live';

        if (!hasActiveAudio) {
          setMicrophoneStatus("inactive");
          if (!micViolationActiveRef.current) {
            micViolationActiveRef.current = true;
            addProctoringWarning("Microphone was turned off or muted.", "MICROPHONE_OFF");
          }
        } else {
          setMicrophoneStatus("active");
          micViolationActiveRef.current = false;
        }
      }
    };

    const trackInterval = setInterval(checkTracks, 1500);
    return () => clearInterval(trackInterval);
  }, [enabled, requireVideo, requireAudio, cameraStream, addProctoringWarning]);

  // 3. Screen Sharing Monitoring
  useEffect(() => {
    if (!enabled || isTerminatedRef.current || !requireScreen) return;

    if (screenStream) {
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === 'live') {
        setScreenShareStatus("active");
        screenViolationActiveRef.current = false;

        const handleTrackEnded = () => {
          setScreenShareStatus("inactive");
          if (!screenViolationActiveRef.current) {
            screenViolationActiveRef.current = true;
            addProctoringWarning("Screen sharing was stopped. Please resume screen sharing.", "SCREEN_SHARE_STOPPED");
          }
        };

        videoTrack.addEventListener("ended", handleTrackEnded);
        return () => videoTrack.removeEventListener("ended", handleTrackEnded);
      } else {
        setScreenShareStatus("inactive");
        if (!screenViolationActiveRef.current) {
          screenViolationActiveRef.current = true;
          addProctoringWarning("Screen sharing was stopped. Please resume screen sharing.", "SCREEN_SHARE_STOPPED");
        }
      }
    } else {
      setScreenShareStatus("inactive");
      if (!screenViolationActiveRef.current) {
        screenViolationActiveRef.current = true;
        addProctoringWarning("Screen sharing was stopped. Please resume screen sharing.", "SCREEN_SHARE_STOPPED");
      }
    }
  }, [enabled, requireScreen, screenStream, addProctoringWarning]);

  // 4. Face Presence Monitoring with 5-Second Grace Period
  useEffect(() => {
    if (!enabled || isTerminatedRef.current || !requireVideo) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }

    const checkFacePresence = () => {
      if (isTerminatedRef.current || !videoElement) return;
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(videoElement, 0, 0, 160, 120);

      try {
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;
        let brightnessSum = 0;
        let skinTonePixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightnessSum += (r + g + b) / 3;

          // Skin tone presence heuristic
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15)) {
            skinTonePixels++;
          }
        }

        const totalPixels = data.length / 4;
        const avgBrightness = brightnessSum / totalPixels;
        const skinRatio = skinTonePixels / totalPixels;

        const isFacePresent = avgBrightness > 20 && skinRatio > 0.04;

        if (isFacePresent) {
          setFaceDetected(true);
          // Face is back: cancel any pending grace-period timer and reset violation lock
          if (faceMissingTimerRef.current) {
            clearTimeout(faceMissingTimerRef.current);
            faceMissingTimerRef.current = null;
          }
          faceViolationActiveRef.current = false;
        } else {
          setFaceDetected(false);
          // Face missing: Start 5-second grace period timer if not already running
          if (!faceMissingTimerRef.current && !faceViolationActiveRef.current) {
            faceMissingTimerRef.current = setTimeout(() => {
              faceViolationActiveRef.current = true;
              addProctoringWarning("Your face is not visible. Please remain clearly visible to the camera.", "FACE_NOT_DETECTED");
              faceMissingTimerRef.current = null;
            }, 5000); // 5-second grace period
          }
        }
      } catch (e) {
        setFaceDetected(true);
      }
    };

    monitorIntervalRef.current = setInterval(checkFacePresence, 1500);

    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
    };
  }, [enabled, requireVideo, videoElement, addProctoringWarning]);

  // General Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
      if (warningDismissTimeoutRef.current) clearTimeout(warningDismissTimeoutRef.current);
    };
  }, []);

  return {
    warningCount,
    maxWarnings: 3,
    warnings,
    activeWarning,
    cameraStatus,
    microphoneStatus,
    screenShareStatus,
    faceDetected,
    tabVisible,
    interviewTerminated,
    terminationReason,
    addProctoringWarning
  };
}
