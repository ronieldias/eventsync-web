// src/hooks/api/organizer.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api"; 
import { Event, CreateEventDTO } from "@/types";
import { toast } from "sonner";

// Listar eventos SOMENTE do organizador logado
export function useMyEvents(organizerId: string) { 
  return useQuery<Event[]>({
    // Adiciona o ID na queryKey para revalidação correta
    queryKey: ["my-events", organizerId], 
    queryFn: async () => {
      if (!organizerId) return []; // Previne a chamada se o ID não estiver disponível

      // CORREÇÃO: Usando o endpoint unificado /events/my-events
      const { data } = await api.get('/events/my-events');
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
      queryClient.invalidateQueries({ queryKey: ["event-by-id"] });
    },
    onError: () => toast.error("Erro ao publicar evento."),
  });
}

// Alternar Inscrições (Abrir/Fechar)
export function useToggleRegistrations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, open }: { id: string; open: boolean }) => {
      // Usando o endpoint e corpo corretos: PATCH /events/:id/toggle-inscriptions
      const { data } = await api.patch(`/events/${id}/toggle-inscriptions`, { status: open });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.open ? "Inscrições abertas!" : "Inscrições encerradas!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      queryClient.invalidateQueries({ queryKey: ["event-by-id"] });
    },
    onError: () => toast.error("Erro ao alterar status das inscrições."),
  });
}

// NOVO: Finalizar Evento (necessário para a próxima etapa, já incluído aqui)
export function useFinalizeEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data } = await api.patch(`/events/${eventId}/finalize`);
      return data;
    },
    onSuccess: () => {
      toast.success("Evento encerrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      queryClient.invalidateQueries({ queryKey: ["event-by-id"] }); 
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Erro ao encerrar evento.";
      toast.error(errorMessage);
    },
  });
}

// NOVO: Arquivar Evento (necessário para a próxima etapa, já incluído aqui)
export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data } = await api.patch(`/events/${eventId}/archive`);
      return data;
    },
    onSuccess: () => {
      toast.success("Evento arquivado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      queryClient.invalidateQueries({ queryKey: ["event-by-id"] }); 
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Erro ao arquivar evento.";
      toast.error(errorMessage);
    },
  });
}