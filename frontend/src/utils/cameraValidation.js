// frontend/src/utils/cameraValidation.js
export const validateCamera = (videoElement) => {
  return new Promise((resolve) => {
    if (!videoElement || !videoElement.srcObject) {
      return resolve("off");
    }
    
    const stream = videoElement.srcObject;
    const tracks = stream.getVideoTracks();
    
    if (tracks.length === 0) {
      return resolve("off");
    }
    
    if (tracks[0].readyState !== "live") {
      return resolve("off");
    }

    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      // Check if frames are actively being rendered
      if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        clearInterval(checkInterval);
        resolve("success");
      } else if (attempts >= 30) { 
        // 3 seconds timeout (30 * 100ms)
        clearInterval(checkInterval);
        resolve("not_transmitting");
      }
    }, 100);
  });
};
