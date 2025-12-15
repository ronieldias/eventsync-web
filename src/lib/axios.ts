import axios from 'axios';

export const api = axios.create({
  // CORREÇÃO: Alterado para porta 3333 para não colidir com o Next.js (3000)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('xe_auth_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});