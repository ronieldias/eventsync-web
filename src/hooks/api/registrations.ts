import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface MyRegistration {
  inscricao_id: string; // CORREÇÃO: Antes era 'id', agora é 'inscricao_id'
  status: 'ativo' | 'cancelado' | 'removido' | 'finalizado';
  data_inscricao: string;
  evento: {
    id: string;
    titulo: string;
    data_inicio: string;
    local: string;
    banner?: string;
  };
}

// Hook para listar inscrições do usuário logado
export function useMyRegistrations() {
  // Verifica se estamos no browser para acessar o localStorage
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('xe_auth_token');

  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await api.get<MyRegistration[]>('/registrations');
      return response.data;
    },
    enabled: isLoggedIn, 
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}