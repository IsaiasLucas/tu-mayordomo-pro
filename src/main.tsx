import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMobileViewport } from "./lib/mobileViewport";

// Initialize mobile viewport height fix
initMobileViewport();

createRoot(document.getElementById("root")!).render(<App />);
