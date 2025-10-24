import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMobileViewport } from "./lib/mobileViewport";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize mobile viewport height fix
initMobileViewport();

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  try {
    sessionStorage.setItem('unhandled_rejection', JSON.stringify({
      reason: event.reason?.message || String(event.reason),
      timestamp: new Date().toISOString(),
    }));
  } catch (e) {
    // Silently fail
  }
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
