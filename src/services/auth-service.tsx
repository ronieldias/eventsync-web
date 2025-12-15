import { api } from '@/lib/axios';
import { LoginResponse, RegisterResponse } from '@/types';
import { LoginFormData, RegisterFormData } from '@/schemas/auth-schemas';

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<RegisterResponse> => {
    // O endpoint /register retorna o User criado
    const response = await api.post<RegisterResponse>('/register', data);
    return response.data;
  }
};