import { api } from '@/lib/api-old';
import { Event, GetEventsParams } from '@/types';

export const eventsService = {
  getEvents: async (params?: GetEventsParams): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  subscribe: async (eventId: string): Promise<any> => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  // Método de Cancelar Inscrição
  // Nota: O backend espera o ID da INSCRIÇÃO, não do evento
  cancelSubscription: async (registrationId: string): Promise<any> => {
    const response = await api.patch(`/registrations/${registrationId}/cancel`);
    return response.data;
  }
};