import axios from 'axios';

export const api = axios.create({
  // Se não houver variável de ambiente, usa o localhost:3000
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Interceptor para injetar o token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Vamos usar 'xe_auth_token' como chave para o token (podes mudar depois)
    const token = localStorage.getItem('xe_auth_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});