// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  // Padronizado para a URL usada nos outros serviços
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333', 
});

// Interceptor para adicionar o token automaticamente se existir
api.interceptors.request.use((config) => {
  // Padronizado para a chave usada no auth-provider
  const token = typeof window !== 'undefined' ? localStorage.getItem("xe_auth_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});