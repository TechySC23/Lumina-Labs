import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Implicitly handled by style tag in HTML usually, but good practice

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
