import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/auth.store";

// This check is only for UX - immediately redirecting an obviously-logged-out
// visitor rather than showing a broken dashboard with silent 401s. It is NOT
// a security boundary. The real security boundary is the backend's auth
// middleware rejecting unauthenticated requests; a determined user could
// still manipulate client-side Zustand state. This distinction matters so
// nobody mistakes this for the actual security layer.
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
