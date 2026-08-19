import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error catcher to display any runtime exceptions directly in the UI
window.addEventListener('error', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fff1f2; color: #9f1239; font-family: monospace; border: 2px solid #f43f5e; margin: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0;">⚠️ Uncaught Runtime Error</h2>
        <p><strong>Message:</strong> ${event.message}</p>
        <p><strong>Source:</strong> ${event.filename}:${event.lineno}:${event.colno}</p>
        <pre style="background: #ffe4e6; padding: 10px; overflow: auto; border-radius: 4px; font-size: 13px;">${event.error ? event.error.stack : 'No stack trace available'}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fff1f2; color: #9f1239; font-family: monospace; border: 2px solid #f43f5e; margin: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0;">⚠️ Unhandled Promise Rejection</h2>
        <p><strong>Reason:</strong> ${event.reason}</p>
        <pre style="background: #ffe4e6; padding: 10px; overflow: auto; border-radius: 4px; font-size: 13px;">${event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available'}</pre>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);