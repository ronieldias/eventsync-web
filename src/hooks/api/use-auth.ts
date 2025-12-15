import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { LoginResponse, RegisterResponse } from '@/types';
import { z } from 'zod';
import { loginSchema, registerSchema } from '@/lib/schemas/auth'; // Criaremos isso abaixo ou inferimos no componente, mas para clean code, definirei os tipos baseados nos schemas do Zod usados nos formulários.

// Tipos inferidos para entrada (ou defina interfaces manuais se preferir)
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

// Schemas Zod para reutilização (pode colocar em src/lib/schemas/auth.ts, mas vou definir aqui para facilitar o copy-paste se preferir, ou importar nos componentes. 
// Para manter a resposta organizada, vou assumir que você definirá os schemas nos componentes ou num arquivo de validação. 
// Aqui usarei interfaces genéricas para o payload.

interface LoginPayload {
  email: string;
  senha: string;
}

interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  cidade: string;
  role: 'user' | 'organizer';
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const response = await api.post<LoginResponse>('/login', data);
      return response.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const response = await api.post<RegisterResponse>('/register', data);
      return response.data;
    },
  });
}