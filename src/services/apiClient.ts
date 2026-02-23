import axios from "axios";
import { getToken, removeToken } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor: Handle Global Errors (401, 403 banned, etc)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401: Token expired, deleted account, or unauthenticated
      if (status === 401) {
        // Skip auto-redirect for /continue endpoint (401 = password required)
        const requestUrl = error.config?.url || "";
        if (requestUrl.includes("/continue")) {
          return Promise.reject(error);
        }

        removeToken();
        if (typeof window !== "undefined") {
          // Redirect to login with message
          window.location.href = "/login?expired=true";
        }
      }

      // 🔥 Detect banned/suspended user (while logged in making API calls)
      if (status === 403) {
        // User account banned
        if (data?.error === "Account Banned") {
          if (typeof window !== "undefined") {
            const banEvent = new CustomEvent("user:banned", {
              detail: {
                message: data?.message || "Akun Anda telah di-suspend.",
                reason: data?.ban_reason || "Pelanggaran Terms of Service",
              },
            });
            window.dispatchEvent(banEvent);
          }
        }

        // Admin account suspended
        if (data?.error === "Account Suspended" || data?.suspended === true) {
          removeToken();
          if (typeof window !== "undefined") {
            // Redirect to login with suspended message
            window.location.href = "/login?suspended=true";
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
