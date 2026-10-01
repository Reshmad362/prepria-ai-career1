import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * PREPRIA AI Mock Interview Proctoring Hook — Phase 16 Hardened
 * Centralizes tab visibility, window focus, hardware streams (camera/mic),
 * screen sharing, face presence, head position, and looking-away / head orientation monitoring
 * with event locking, temporal persistence (grace periods), and 3-warning auto-termination.
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
  const [headPoseStatus, setHeadPoseStatus] = useState("centered"); // "centered" | "turned_left" | "turned_right" | "turned_up" | "turned_down" | "out_of_frame" | "missing"
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
  const faceMissingViolationActiveRef = useRef(false);
  const headPoseViolationActiveRef = useRef(false);

  // Timers for temporal persistence (grace periods)
  const faceMissingTimerRef = useRef(null);
  const headPoseTimerRef = useRef(null);
  const warningDismissTimeoutRef = useRef(null);

  // Canvas for lightweight client-side spatial and orientation processing (160x120)
  const canvasRef = useRef(null);
  const monitorIntervalRef = useRef(null);

  // Central Warning Function: Single authoritative entry point for all proctoring violations
  const addProctoringWarning = useCallback((reason, type = "GENERAL") => {
    if (isTerminatedRef.current || !enabled) return;

    const newCount = warningCountRef.current + 1;
    warningCountRef.current = newCount;
    setWarningCount(newCount);

    const violationRecord = {
      id: `warn-${Date.now()}-${newCount}`,
      count: newCount,
      maxWarnings: 3,
      type,
      message: reason,
      timestamp: new Date().toISOString()
    };

    warningsListRef.current.push(violationRecord);
    setWarnings([...warningsListRef.current]);

    // Display visible neutral banner to candidate
    setActiveWarning(`⚠ Proctoring Warning ${newCount}/3: ${reason}`);
    if (warningDismissTimeoutRef.current) clearTimeout(warningDismissTimeoutRef.current);
    warningDismissTimeoutRef.current = setTimeout(() => {
      setActiveWarning("");
    }, 6000);

    // Check for 3rd warning automatic termination
    if (newCount >= 3) {
      isTerminatedRef.current = true;
      setInterviewTerminated(true);
      const termReason = "Interview automatically terminated after 3 proctoring warnings.";
      setTerminationReason(termReason);

      // Stop all background intervals & timers
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
      if (headPoseTimerRef.current) clearTimeout(headPoseTimerRef.current);

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

  // 4. Face Presence, Spatial Centroid & Head Orientation Monitoring (Phase 16)
  useEffect(() => {
    if (!enabled || isTerminatedRef.current || !requireVideo) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }

    const checkFaceAndHeadPose = () => {
      if (isTerminatedRef.current || !videoElement) return;
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(videoElement, 0, 0, 160, 120);

      try {
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;
        const width = 160;
        const height = 120;
        const totalPixels = width * height;

        let brightnessSum = 0;
        let skinTonePixels = 0;
        let sumX = 0;
        let sumY = 0;
        let leftSideSkin = 0;
        let rightSideSkin = 0;

        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightnessSum += (r + g + b) / 3;

          // Robust skin tone detection heuristic
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15)) {
            skinTonePixels++;
            sumX += x;
            sumY += y;
            if (x < width / 2) {
              leftSideSkin++;
            } else {
              rightSideSkin++;
            }
          }
        }

        const avgBrightness = brightnessSum / totalPixels;
        const skinRatio = skinTonePixels / totalPixels;
        const isFacePresent = avgBrightness > 18 && skinRatio > 0.035;

        // A. Face Missing Detection
        if (!isFacePresent) {
          setFaceDetected(false);
          setHeadPoseStatus("missing");

          // Clear any head pose timer since face is missing entirely
          if (headPoseTimerRef.current) {
            clearTimeout(headPoseTimerRef.current);
            headPoseTimerRef.current = null;
          }

          // Start 5-second grace period for missing face
          if (!faceMissingTimerRef.current && !faceMissingViolationActiveRef.current) {
            faceMissingTimerRef.current = setTimeout(() => {
              faceMissingViolationActiveRef.current = true;
              addProctoringWarning("Please keep your face visible to the camera.", "FACE_NOT_DETECTED");
              faceMissingTimerRef.current = null;
            }, 5000);
          }
          return;
        }

        // Face is present -> clear face missing state
        setFaceDetected(true);
        if (faceMissingTimerRef.current) {
          clearTimeout(faceMissingTimerRef.current);
          faceMissingTimerRef.current = null;
        }
        faceMissingViolationActiveRef.current = false;

        // B. Spatial Centroid & Head Orientation Analysis
        const centroidX = sumX / skinTonePixels / width;   // [0, 1]
        const centroidY = sumY / skinTonePixels / height;  // [0, 1]

        let currentDeviationType = null;
        let currentDeviationMessage = null;
        let detectedPose = "centered";

        // 1. Head out of frame (Severe boundary offset)
        if (centroidX < 0.20 || centroidX > 0.80 || centroidY < 0.14 || centroidY > 0.86) {
          detectedPose = "out_of_frame";
          currentDeviationType = "HEAD_OUT_OF_FRAME";
          currentDeviationMessage = "Please keep your head centered within the camera frame.";
        }
        // 2. Head turned left (looking away to left)
        else if (centroidX < 0.30 || (leftSideSkin / Math.max(1, rightSideSkin) > 2.8 && centroidX < 0.42)) {
          detectedPose = "turned_left";
          currentDeviationType = "HEAD_TURNED_LEFT";
          currentDeviationMessage = "Please face the camera directly.";
        }
        // 3. Head turned right (looking away to right)
        else if (centroidX > 0.70 || (rightSideSkin / Math.max(1, leftSideSkin) > 2.8 && centroidX > 0.58)) {
          detectedPose = "turned_right";
          currentDeviationType = "HEAD_TURNED_RIGHT";
          currentDeviationMessage = "Please face the camera directly.";
        }
        // 4. Head tilted up (looking away up)
        else if (centroidY < 0.22) {
          detectedPose = "turned_up";
          currentDeviationType = "HEAD_TURNED_UP";
          currentDeviationMessage = "Please face the camera directly.";
        }
        // 5. Head tilted down (looking away down)
        else if (centroidY > 0.78) {
          detectedPose = "turned_down";
          currentDeviationType = "HEAD_TURNED_DOWN";
          currentDeviationMessage = "Please face the camera directly.";
        }

        setHeadPoseStatus(detectedPose);

        // C. Temporal Persistence & Debounce for Head Pose Deviations (4.5-second grace period)
        if (currentDeviationType) {
          // Sustained deviation: start timer if not already running and not locked
          if (!headPoseTimerRef.current && !headPoseViolationActiveRef.current) {
            headPoseTimerRef.current = setTimeout(() => {
              headPoseViolationActiveRef.current = true;
              addProctoringWarning(currentDeviationMessage, currentDeviationType);
              headPoseTimerRef.current = null;
            }, 4500); // 4.5-second grace period ensures transient natural movement is ignored
          }
        } else {
          // Candidate is centered and facing forward: clear pending deviation timer and reset lock
          if (headPoseTimerRef.current) {
            clearTimeout(headPoseTimerRef.current);
            headPoseTimerRef.current = null;
          }
          headPoseViolationActiveRef.current = false;
        }

      } catch (e) {
        setFaceDetected(true);
        setHeadPoseStatus("centered");
      }
    };

    monitorIntervalRef.current = setInterval(checkFaceAndHeadPose, 1200);

    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
      if (headPoseTimerRef.current) clearTimeout(headPoseTimerRef.current);
    };
  }, [enabled, requireVideo, videoElement, addProctoringWarning]);

  // General Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
      if (headPoseTimerRef.current) clearTimeout(headPoseTimerRef.current);
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
    headPoseStatus,
    tabVisible,
    interviewTerminated,
    terminationReason,
    addProctoringWarning
  };
}

