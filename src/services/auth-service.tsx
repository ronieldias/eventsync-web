import { api } from '@/lib/axios';
import { LoginResponse, RegisterResponse } from '@/types';
import { LoginFormData, RegisterFormData } from '@/schemas/auth-schemas';

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    // CORREÇÃO: Adicionado prefixo /auth
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<RegisterResponse> => {
    // CORREÇÃO: Adicionado prefixo /auth
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }
};