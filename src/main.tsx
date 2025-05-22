
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Function to handle initialization
const initializeApp = () => {
  const container = document.getElementById("root");

  // Error handling for missing root element
  if (!container) {
    console.error("Root element not found - creating one");
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);
    
    const root = createRoot(rootDiv);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

// Initialize the app with error handling
try {
  initializeApp();
} catch (error) {
  console.error("Failed to initialize the app:", error);
  
  // Display a user-friendly error message
  const body = document.body;
  body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; padding: 20px; text-align: center;">
      <h2>Unable to load StrokeSense</h2>
      <p>Please check your internet connection and try again.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #3b82f6; color: white; border: none; border-radius: 5px;">
        Reload Application
      </button>
    </div>
  `;
}
