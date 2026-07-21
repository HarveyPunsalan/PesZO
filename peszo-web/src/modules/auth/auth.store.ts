import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
}

// Access token lives here, not in TanStack Query's cache. TanStack Query
// is for async, component-scoped server data; axios's request interceptor
// needs to read the token synchronously on every outgoing call, which is
// what Zustand is for here - this is session state derived from an API
// response, not server data itself.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setAuth: (token) => set({ accessToken: token, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: null, isAuthenticated: false }),
}));
