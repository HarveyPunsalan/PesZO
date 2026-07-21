import axios from "axios";
import { useAuthStore } from "@/modules/auth/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attaches the access token to every outgoing request if present.
// Reads synchronously from Zustand - the store is the source of truth
// for session state, not TanStack Query's cache.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
