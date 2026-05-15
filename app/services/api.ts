import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    // If accessing via local network IP, use the same IP for backend
    if (/^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)) {
      return `http://${window.location.hostname}:5001/api`;
    }
  }

  return 'https://api.rkinteriorstudio.in/api';
};

const API_URL = getApiUrl();


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
