// src/components/auth/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/api/use-auth';
import { loginSchema, LoginFormData } from '@/schemas/auth-schemas';
import { UserRole } from '@/types';
import { useAuthContext } from '@/providers/auth-provider'; // <--- Importe o hook

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const { signIn } = useAuthContext(); // <--- Use o contexto

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  function onSubmit(data: LoginFormData) {
    login(data, {
      onSuccess: (response) => {
        // AQUI ESTAVA O ERRO: Faltava salvar o usuário e atualizar o estado
        signIn(response.user, response.token); 
        
        toast.success('Login realizado!');
        
        if (response.user.role === UserRole.ORGANIZER) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao entrar.');
      },
    });
  }

  // ... (o resto do return permanece igual)
  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Não tem uma conta?{' '}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}