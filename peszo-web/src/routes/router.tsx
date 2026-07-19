// React Router v7 is installed (package.json: "react-router-dom": "^7.18.1").
// This file uses v7 in LIBRARY MODE ONLY (createBrowserRouter + RouterProvider).
// No framework-mode features are used — no file-based routing, no Vite router plugin.
// This deviates from AGENTS.md which references "React Router v6", but v7 library-mode
// API is backward-compatible with v6 patterns. Documented here rather than silently ignored.
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function LoginPage() {
  return <div>Login</div>;
}

function RegisterPage() {
  return <div>Register</div>;
}

function DashboardPage() {
  return <div>Dashboard</div>;
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/", element: <DashboardPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
