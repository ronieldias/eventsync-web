import { z } from 'zod';
import { UserRole } from '@/types';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  // CORREÇÃO DEFINITIVA:
  // Substituímos nativeEnum por z.enum explícito.
  // Isso é mais seguro, performático e compatível com todas as versões do Zod.
  role: z.enum([UserRole.USER, UserRole.ORGANIZER], {
    message: 'Selecione o tipo de conta',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;