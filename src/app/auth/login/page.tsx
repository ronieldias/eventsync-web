"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/services/api";
import { AuthResponse } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      localStorage.setItem("@EventSync:token", response.data.token);
      localStorage.setItem(
        "@EventSync:user",
        JSON.stringify(response.data.user)
      );
      showToast(`Bem-vindo, ${response.data.user.name}!`, "success");
      router.push(response.data.user.role === "organizer" ? "/dashboard" : "/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      const status = error.response?.status;
      const message = error.response?.data?.message;

      let errorMessage = "Erro ao fazer login. Tente novamente.";
      if (status === 401 || message === "Invalid credentials") {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (message === "Email already registered") {
        errorMessage = "Este email já está cadastrado.";
      } else if (message) {
        errorMessage = message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary-700">
            EventSync
          </Link>
          <h1 className="text-xl font-semibold mt-4 text-gray-900">
            Entrar na sua conta
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="******"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
