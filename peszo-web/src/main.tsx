import React from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./routes/router";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>
);
