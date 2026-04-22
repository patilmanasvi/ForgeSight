// src/utils/api.js
// Default to local backend for beginner-friendly local development.
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const parseApiResponse = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      payload?.detail || payload?.message || `Request failed with HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload;
};

export const api = {
  // Detection endpoints
  analyzeFrame: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${BASE_URL}/v1/detect/frame`, {
      method: "POST",
      body: formData,
    });
    return parseApiResponse(response);
  },

  // Provenance & audit
  getProvenance: async (assetHash) => {
    const response = await fetch(`${BASE_URL}/v1/provenance/${assetHash}`);
    return parseApiResponse(response);
  },

  getAuditLog: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${BASE_URL}/v1/audit?${params}`);
    return parseApiResponse(response);
  },

  // C2PA & Blockchain
  getC2PAManifest: async (assetId) => {
    const response = await fetch(`${BASE_URL}/v1/c2pa/${assetId}`);
    return parseApiResponse(response);
  },

  verifyOnPolygon: async (txHash) => {
    const response = await fetch(
      `${BASE_URL}/v1/polygon/verify/${txHash}`
    );
    return parseApiResponse(response);
  },

  // Gemini reports
  generateReport: async (analysisId) => {
    const response = await fetch(
      `${BASE_URL}/v1/report/${analysisId}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return parseApiResponse(response);
  },

  // User & session
  getSession: async () => {
    const response = await fetch(`${BASE_URL}/v1/session`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return parseApiResponse(response);
  },

  logout: async () => {
    await fetch(`${BASE_URL}/v1/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    localStorage.removeItem("token");
  },
};

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => localStorage.setItem("token", token);

// Retry logic for failed requests
export const fetchWithRetry = async (
  url,
  options = {},
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
      if (response.status === 429 || response.status >= 500) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};
