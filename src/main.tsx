import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMobileViewport } from "./lib/mobileViewport";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { errorTracker } from "./lib/errorTracking";

// Initialize mobile viewport height fix
initMobileViewport();

// Initialize error tracking
errorTracker.info('Application starting', 'Main');

// Global error handlers - enhanced with silent tracking
window.addEventListener('unhandledrejection', (event) => {
  errorTracker.error(
    'Unhandled promise rejection',
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    'Global'
  );
  
  // Prevent default only in production to avoid console noise
  if (process.env.NODE_ENV === 'production') {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  errorTracker.error('Global error', event.error, 'Global');
  
  // Prevent default only in production
  if (process.env.NODE_ENV === 'production') {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
