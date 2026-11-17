import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://campusrag-backend-x87x.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusrag_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: handle 401 Unauthorized
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('campusrag_token');
    localStorage.removeItem('campusrag_user');
  }
  return Promise.reject(error);
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  quickPortalLogin: (role) => api.post(`/auth/quick-portal-login?role=${role}`),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (data) => api.post('/auth/google', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const academicAPI = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  getSubjects: (dept, sem) => api.get('/subjects', { params: { departmentCode: dept, semester: sem } }),
  createSubject: (data) => api.post('/subjects', data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

export const documentAPI = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  reprocessDocument: (id) => api.post(`/documents/${id}/reprocess`),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  batchDeleteDocuments: (docIds) => api.post('/documents/batch-delete', docIds),
  getPDFUrl: (id) => `${API_BASE}/documents/${id}/view`,
};

export const ragAPI = {
  query: (payload) => api.post('/rag/query', payload),
};

export const chatAPI = {
  createChat: (data) => api.post('/chats', data),
  getChats: () => api.get('/chats'),
  getChat: (id) => api.get(`/chats/${id}`),
  deleteChat: (id) => api.delete(`/chats/${id}`),
  clearChats: () => api.delete('/chats'),
};

export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
