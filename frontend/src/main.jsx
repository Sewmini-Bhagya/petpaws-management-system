import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * Main Entry Point
 * 
 * Mounts the React application to the DOM 'root' element.
 * StrictMode is enabled to catch potential problems during development.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);