// src/types/index.ts
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

export enum EventStatus {
  RASCUNHO = "rascunho",
  PUBLICADO = "publicado",
  ENCERRADO = "encerrado",
  CANCELADO = "cancelado",
  ARQUIVADO = "arquivado"
}

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  categoria: string;
  data_inicio: string;
  data_fim?: string;
  carga_horaria?: number;
  
  status: EventStatus;
  max_inscricoes: number;
  inscricao_aberta: boolean;
  banner_url?: string;
  
  organizador_id: string;
  
  inscricoes?: any[]; 
  
  total_inscritos?: number;
  _count?: {
    registrations: number;
  };
  
  created_at: string;
  updated_at?: string;
}

export interface CreateEventDTO {
  titulo: string;
  descricao: string;
  data_inicio: string;
  local: string;
  max_inscricoes: number;
  categoria: string;
  //Adicionado data_fim, já que o backend exige.
  data_fim: string; 
}

// CORREÇÃO: Adicionando o tipo exportado que estava faltando
export interface GetEventsParams {
  nome?: string;
  categoria?: string;
}