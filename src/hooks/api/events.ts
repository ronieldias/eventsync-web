import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/events-service';
import { GetEventsParams } from '@/types';

export function useEvents(params?: GetEventsParams) {
  return useQuery({
    queryKey: ['events', params], 
    queryFn: () => eventsService.getEvents(params),
    staleTime: 1000 * 60 * 1, 
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEventById(id),
    enabled: !!id,
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsService.subscribe(eventId),
    onSuccess: (_, eventId) => {
      // Atualiza a tela de detalhes e a lista
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Hook de Cancelamento
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registrationId: string) => eventsService.cancelSubscription(registrationId),
    onSuccess: () => {
      // Ao cancelar, invalidamos todas as queries de eventos para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}