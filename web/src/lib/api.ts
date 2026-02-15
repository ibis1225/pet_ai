import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

export const chatApi = {
  sendMessage: (message: string) => api.post('/chat/message', { message, channel: 'web' }),
};

export const petApi = {
  list: () => api.get('/pets'),
  create: (data: any) => api.post('/pets', data),
  delete: (id: string) => api.delete(`/pets/${id}`),
};

export const businessApi = {
  list: (params?: any) => api.get('/businesses', { params }),
  get: (id: string) => api.get(`/businesses/${id}`),
};

export const productApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
};

export const consultationApi = {
  list: (params?: any) => api.get('/consultations', { params }),
  get: (id: string) => api.get(`/consultations/${id}`),
};
