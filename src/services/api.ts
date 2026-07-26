import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('sep.token') || Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const requestUrl = error.config?.url || '';

      if (!requestUrl.includes('/login') && !requestUrl.includes('/auth')) {
        Cookies.remove('sep.token');
        Cookies.remove('token');

        if (typeof window !== 'undefined') {
          localStorage.removeItem('sep.token');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);