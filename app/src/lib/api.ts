import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.petai.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    // Token will be set from auth store
    const token = api.defaults.headers.common['Authorization'];
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      // Will be handled by auth store
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;

// ===========================
// API Functions
// ===========================

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

// Pets
export const petApi = {
  list: () => api.get('/pets'),
  get: (id: string) => api.get(`/pets/${id}`),
  create: (data: any) => api.post('/pets', data),
  update: (id: string, data: any) => api.patch(`/pets/${id}`, data),
  delete: (id: string) => api.delete(`/pets/${id}`),
};

// Businesses
export const businessApi = {
  list: (params?: { category?: string; search?: string; page?: number }) =>
    api.get('/businesses', { params }),
  get: (id: string) => api.get(`/businesses/${id}`),
  search: (query: string) => api.get('/businesses', { params: { search: query } }),
};

// Products
export const productApi = {
  list: (params?: { category?: string; search?: string; page?: number }) =>
    api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
};

// Chat
export const chatApi = {
  sendMessage: (message: string, channel: string = 'app') =>
    api.post('/chat/message', { message, channel }),
  getHistory: (sessionId?: string) =>
    api.get('/chat/history', { params: { session_id: sessionId } }),
};

// Consultations
export const consultationApi = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/consultations', { params }),
  get: (id: string) => api.get(`/consultations/${id}`),
  create: (data: any) => api.post('/consultations', data),
};

// Bookings
export const bookingApi = {
  list: () => api.get('/bookings'),
  get: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
};
