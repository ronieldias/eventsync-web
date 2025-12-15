// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  // Garanta que esta URL está correta (http://localhost:3333, conforme documentação)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333', 
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use((config) => {
  // A chave 'xe_auth_token' é a correta para o sistema
  const token = typeof window !== 'undefined' ? localStorage.getItem("xe_auth_token") : null; 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});