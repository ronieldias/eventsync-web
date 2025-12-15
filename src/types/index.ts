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