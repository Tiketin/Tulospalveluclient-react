// src/config.js

// Reads window._env_ set by Nginx at startup.
// If window._env_ isn't ready, falls back to build-time process.env or empty string.
const getInitialUrl = () => {
  if (typeof window !== 'undefined' && window._env_ && window._env_.REACT_APP_API_URL) {
    return window._env_.REACT_APP_API_URL;
  }
  return process.env.REACT_APP_API_URL || '';
};

export const API_URL = getInitialUrl();