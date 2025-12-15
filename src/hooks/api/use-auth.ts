import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}