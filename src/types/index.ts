export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
}

export interface User {
  id: string;
  nome: string;
  email: string;
  cidade?: string;
  role: UserRole;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse extends User {}

// --- AJUSTE AQUI: Espelhando a Entidade do Backend ---
//

export type EventCategory = string; // O backend usa string livre por enquanto

export enum EventStatus {
  RASCUNHO = "rascunho",
  PUBLICADO = "publicado",
  ENCERRADO = "encerrado",
  CANCELADO = "cancelado",
}

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  local: string;          // Backend usa 'local', não 'localizacao'
  categoria: string;
  data_inicio: string;    // Backend usa 'data_inicio'
  data_fim: string;       // Backend tem 'data_fim'
  carga_horaria: number;
  
  status: EventStatus;
  max_inscricoes: number; // Backend usa 'max_inscricoes'
  inscricao_aberta: boolean;
  banner_url?: string;
  
  organizador_id: string;
  
  // Propriedades relacionais (podem vir ou não dependendo da query)
  inscricoes?: any[]; 
  total_inscritos?: number; // Se você computar isso no front baseando no array
  
  created_at: string;
  updated_at: string;
}

export interface GetEventsParams {
  nome?: string;      // Backend filtra por 'nome' (via query param), mas na entidade é titulo. O controller mapeia? 
                      // O Controller mapeia req.query.nome -> filters.nome.
  categoria?: string;
}