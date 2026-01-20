import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Generic API request wrapper
export async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const response = await api.request({
      url: endpoint,
      method,
      data: body,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "API Error");
  }
}

// Get current user's activity
export async function getMyActivity() {
  try {
    const response = await api.get("/activity/my");
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "API Error");
  }
}

export default api;

// Decode JWT payload (no external deps) to extract user id
export function getCurrentUserId() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
    return decoded.id || decoded._id || null;
  } catch (e) {
    return null;
  }
}
