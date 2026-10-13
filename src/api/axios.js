import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3000', // Replace with your backend URL
  timeout: 10000,                      // Request aborts after 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;
