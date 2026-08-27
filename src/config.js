// src/config.js
export const API_URL = 
  window._env_?.REACT_APP_API_URL || 
  process.env.REACT_APP_API_URL || 
  'https://dev-tulospalvelu.tikkalandia.fi';