"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { EventCategory, EVENT_CATEGORY_LABELS } from "@/types";

const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.enum(["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"]).default("sem_categoria"),
  banner: z.string().url("URL inválida").optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  endDate: z.string().optional(),
  location: z.string().min(3, "Local deve ter pelo menos 3 caracteres"),
  workload: z.coerce.number().int().min(0, "Carga horária deve ser positiva"),
  capacity: z.coerce.number().int().positive("Capacidade deve ser maior que 0"),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("@EventSync:user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "organizer") {
      router.push("/");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      workload: 0,
      category: "sem_categoria",
    },
  });

  async function onSubmit(data: EventFormData) {
    // Validar que a data não é no passado
    const selectedDate = new Date(data.date);
    const now = new Date();
    if (selectedDate < now) {
      setError("A data do evento não pode ser no passado");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...data,
        banner: data.banner || undefined,
        endDate: data.endDate || undefined,
      };
      await api.post("/events", payload);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao criar evento");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:underline text-sm flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Criar Novo Evento
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Título"
              type="text"
              placeholder="Nome do evento"
              error={errors.title?.message}
              {...register("title")}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                rows={4}
                placeholder="Descreva o evento..."
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                {...register("category")}
              >
                {(Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {EVENT_CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <Input
              label="Banner (URL da imagem)"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              error={errors.banner?.message}
              {...register("banner")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data e Hora de Início"
                type="datetime-local"
                error={errors.date?.message}
                {...register("date")}
              />

              <Input
                label="Data e Hora de Término"
                type="datetime-local"
                error={errors.endDate?.message}
                {...register("endDate")}
              />
            </div>

            <Input
              label="Local"
              type="text"
              placeholder="Onde será o evento"
              error={errors.location?.message}
              {...register("location")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Carga Horária (horas)"
                type="number"
                min={0}
                placeholder="0"
                error={errors.workload?.message}
                {...register("workload")}
              />

              <Input
                label="Capacidade (vagas)"
                type="number"
                min={1}
                placeholder="Número de vagas"
                error={errors.capacity?.message}
                {...register("capacity")}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <strong>Nota:</strong> O evento será criado como{" "}
              <strong>Rascunho</strong>. Você poderá publicá-lo posteriormente.
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Criar Evento
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
