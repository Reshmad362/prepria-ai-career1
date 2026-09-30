// frontend/src/utils/api.js
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getAuthHeaders = (includeJson = true) => {
  const headers = {};
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(options.body && !(options.body instanceof FormData)),
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
};

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

export const generateDynamicQuestions = async (role, interviewNumber = 1, count = 10) => {
  const response = await authenticatedFetch(`${API_URL}/api/interview/generate-dynamic`, {
    method: "POST",
    body: JSON.stringify({ role, interviewNumber, count })
  });
  if (!response.ok) throw new Error("Failed to generate dynamic questions");
  return await response.json();
};

export const getRecommendations = async (status = null) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await authenticatedFetch(`${API_URL}/recommendations${query}`, {
    method: "GET"
  });
  if (!response.ok) throw new Error("Failed to fetch recommendations");
  return await response.json();
};

export const updateRecommendationStatus = async (recommendationId, status) => {
  const response = await authenticatedFetch(`${API_URL}/recommendations/${encodeURIComponent(recommendationId)}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("Failed to update recommendation status");
  return await response.json();
};

export const getLongitudinalProfile = async (targetRole = null) => {
  const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : "";
  const response = await authenticatedFetch(`${API_URL}/longitudinal/profile${query}`, {
    method: "GET"
  });
  if (!response.ok) throw new Error("Failed to fetch longitudinal profile");
  return await response.json();
};

export const getTopicLongitudinalDetail = async (topic) => {
  const response = await authenticatedFetch(`${API_URL}/longitudinal/topic/${encodeURIComponent(topic)}`, {
    method: "GET"
  });
  if (!response.ok) throw new Error("Failed to fetch topic longitudinal detail");
  return await response.json();
};


