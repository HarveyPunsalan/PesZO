// React Router v7 is installed (package.json: "react-router-dom": "^7.18.1").
// This file uses v7 in LIBRARY MODE ONLY (createBrowserRouter + RouterProvider).
// No framework-mode features are used - no file-based routing, no Vite router plugin.
// This deviates from AGENTS.md which references "React Router v6", but v7 library-mode
// API is backward-compatible with v6 patterns. Documented here rather than silently ignored.
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import DashboardPage from "@/pages/DashboardPage";

// Phase-0-style placeholders - simple stubs rendering inside the real
// sidebar shell. To be replaced with real pages in future build sessions.
function QuestsPlaceholder() {
  return <div>Quests</div>;
}
function BudgetPlaceholder() {
  return <div>Budget</div>;
}
function PortfolioPlaceholder() {
  return <div>Portfolio</div>;
}
function LiabilitiesPlaceholder() {
  return <div>Liabilities</div>;
}
function SimulationPlaceholder() {
  return <div>Simulation</div>;
}

// /login and /register render outside the app shell (no sidebar).
// All authenticated routes nest inside ProtectedRoute > AppLayout.
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/quests", element: <QuestsPlaceholder /> },
          { path: "/budget", element: <BudgetPlaceholder /> },
          { path: "/portfolio", element: <PortfolioPlaceholder /> },
          { path: "/liabilities", element: <LiabilitiesPlaceholder /> },
          { path: "/simulation", element: <SimulationPlaceholder /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
