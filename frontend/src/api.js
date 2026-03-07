import axios from 'axios';

const rawURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const baseURL = rawURL.endsWith('/') ? rawURL.slice(0, -1) : rawURL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Required for sessions
});

export default api;
