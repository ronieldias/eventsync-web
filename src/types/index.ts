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
  foto_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

export interface RegisterResponse extends User {}