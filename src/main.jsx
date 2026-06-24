import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Shared storage polyfill for deployment
// Replace with Supabase/Firebase for real shared data between admin and customer
if (!window.storage) {
  const STORAGE_KEY = 'alessandro_shared_data';
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val ? { key, value: val } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    list: async (prefix) => {
      const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
      return { keys };
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
