import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
});

api.interceptors.request.use(
  (config) => {
    // Chỉ chạy ở môi trường trình duyệt (client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
