import axios from "axios";
import { getToken, clearAuth } from "./auth";

// ✅ FIXED base URL logic
function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl && process.env.NODE_ENV !== "production") {
  console.warn("NEXT_PUBLIC_API_URL is not set; falling back to http://localhost:5000");
}

// ✅ Axios instance
export const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle unauthorized (auto logout)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

// Optional alias (you already used it somewhere)
export const api = API;

// ================= TYPES =================

export type ApiAuthResponse = {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    role: "care_manager" | "parent" | "child";
  };
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

export type HealthRecord = {
  id: string;
  patientId: string;
  heartRate: number;
  oxygen: number;
  systolic: number;
  diastolic: number;
  alert: "Normal" | "Warning" | "Alert" | "Critical";
  createdAt: string;
};