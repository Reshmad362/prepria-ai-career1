// frontend/src/utils/emailApi.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Sends an email notification using the backend endpoint.
 * @param {string} eventType - The type of event ("signup", "resume_upload", "interview", "course_completion", "certificate")
 * @param {string} subject - The subject of the email
 * @param {object} data - The data payload required for the template
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const sendEmailNotification = async (eventType, subject, data) => {
  try {
    const response = await fetch(`${API_URL}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        subject,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend returned email failure:", errorData);
      return false;
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Failed to call email API:", error);
    return false;
  }
};
