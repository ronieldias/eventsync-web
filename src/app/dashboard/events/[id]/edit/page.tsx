"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/services/api";
import { Event, EventCategory, EVENT_CATEGORY_LABELS } from "@/types";

const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.enum(["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"]),
  banner: z.string().url("URL inválida").optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  endDate: z.string().optional(),
  location: z.string().min(3, "Local deve ter pelo menos 3 caracteres"),
  workload: z.coerce.number().int().min(0, "Carga horária deve ser positiva"),
  capacity: z.coerce.number().int().positive("Capacidade deve ser maior que 0"),
});

type EventFormData = z.infer<typeof eventSchema>;

const EDITABLE_STATUSES = ["draft", "published", "in_progress"];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const eventId = params.id as string;

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("@EventSync:user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "organizer") {
      router.push("/");
      return;
    }

    loadEvent();
  }, [router, eventId]);

  async function loadEvent() {
    try {
      const response = await api.get<Event>(`/events/${eventId}`);
      const eventData = response.data;

      // Verificar se o evento pode ser editado
      if (!EDITABLE_STATUSES.includes(eventData.status)) {
        showToast("Este evento não pode ser editado", "error");
        router.push(`/dashboard/events/${eventId}`);
        return;
      }

      setEvent(eventData);

      // Formatar as datas para datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      // Preencher o formulário com os dados do evento
      reset({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || "sem_categoria",
        banner: eventData.banner || "",
        date: formatDateForInput(eventData.date),
        endDate: eventData.endDate ? formatDateForInput(eventData.endDate) : "",
        location: eventData.location,
        workload: eventData.workload,
        capacity: eventData.capacity,
      });
    } catch (err) {
      console.error("Error loading event:", err);
      showToast("Erro ao carregar evento", "error");
      router.push("/dashboard");
    } finally {
      setIsFetching(false);
    }
  }

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
      await api.put(`/events/${eventId}`, payload);
      showToast("Evento atualizado com sucesso!", "success");
      router.push(`/dashboard/events/${eventId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao atualizar evento");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href={`/dashboard/events/${eventId}`}
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
            Voltar aos Detalhes
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Editar Evento
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
              <strong>Status atual:</strong> {event.status === "draft" ? "Rascunho" : event.status === "published" ? "Publicado" : "Em Andamento"}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Salvar Alterações
              </Button>
              <Link href={`/dashboard/events/${eventId}`}>
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
