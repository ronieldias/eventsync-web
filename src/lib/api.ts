import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Ajuste para a porta do seu backend
});

// Interceptor para adicionar o token automaticamente se existir
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});