import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || 'Server error';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;