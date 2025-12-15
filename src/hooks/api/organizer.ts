// src/hooks/api/organizer.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api"; 
import { Event, CreateEventDTO } from "@/types";
import { toast } from "sonner";

// Listar eventos SOMENTE do organizador logado
export function useMyEvents(organizerId: string) { // **CORREÇÃO:** Recebe o ID do organizador
  return useQuery<Event[]>({
    // Adiciona o ID na queryKey para revalidação correta
    queryKey: ["my-events", organizerId], 
    queryFn: async () => {
      if (!organizerId) return []; // Previne a chamada se o ID não estiver disponível

      // **CORREÇÃO:** Usando o ID real do organizador na rota /events/:id
      const { data } = await api.get(`/events/${organizerId}`);
      return data;
    },
    // A query só é habilitada se tiver um organizerId
    enabled: !!organizerId, 
  });
}

// Criar novo evento
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEvent: CreateEventDTO) => {
      const { data } = await api.post("/events", newEvent);
      return data;
    },
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Erro ao criar evento.");
    },
  });
}

// Publicar Evento (Mudar status de rascunho para publicado)
export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data } = await api.patch(`/events/${eventId}/publish`);
      return data;
    },
    onSuccess: () => {
      toast.success("Evento publicado!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: () => toast.error("Erro ao publicar evento."),
  });
}

// Alternar Inscrições (Abrir/Fechar)
export function useToggleRegistrations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, open }: { id: string; open: boolean }) => {
      // Ajuste o endpoint conforme sua API
      const { data } = await api.patch(`/events/${id}/registrations`, { inscricao_aberta: open });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.open ? "Inscrições abertas!" : "Inscrições encerradas!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: () => toast.error("Erro ao alterar status das inscrições."),
  });
}