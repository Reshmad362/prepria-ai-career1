// frontend/src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const generateQuestions = async (role, difficulty, questionCount) => {
  const response = await fetch(`${API_URL}/generate-interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role, difficulty, question_count: questionCount })
  });
  if (!response.ok) throw new Error("Failed to generate questions");
  return await response.json();
};

export const generateFollowUp = async (prompt) => {
  const response = await fetch(`${API_URL}/ai/generate-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error("Failed to generate follow-up question");
  return await response.json();
};
