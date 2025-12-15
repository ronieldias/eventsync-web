import axios from 'axios';

export const api = axios.create({
  // MUDANÇA: Alterar de localhost:3000 para localhost:3333
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
});

// Interceptor para injetar o token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('xe_auth_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});