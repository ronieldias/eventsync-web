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
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["organizer", "participant"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "participant",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      showToast("Conta criada com sucesso! Faça login para continuar.", "success");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao criar conta");
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
            Criar sua conta
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de conta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "participant")}
                className={cn(
                  "p-4 border-2 rounded-lg text-center transition",
                  selectedRole === "participant"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <svg
                  className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    selectedRole === "participant"
                      ? "text-primary-600"
                      : "text-gray-400"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span
                  className={cn(
                    "font-medium text-sm",
                    selectedRole === "participant"
                      ? "text-primary-700"
                      : "text-gray-600"
                  )}
                >
                  Participante
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Inscreva-se em eventos
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue("role", "organizer")}
                className={cn(
                  "p-4 border-2 rounded-lg text-center transition",
                  selectedRole === "organizer"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <svg
                  className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    selectedRole === "organizer"
                      ? "text-primary-600"
                      : "text-gray-400"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span
                  className={cn(
                    "font-medium text-sm",
                    selectedRole === "organizer"
                      ? "text-primary-700"
                      : "text-gray-600"
                  )}
                >
                  Organizador
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Crie e gerencie eventos
                </p>
              </button>
            </div>
            <input type="hidden" {...register("role")} />
          </div>

          <Input
            label="Nome"
            type="text"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register("name")}
          />

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

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="******"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Criar Conta
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
