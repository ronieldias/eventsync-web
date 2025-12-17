export type UserRole = "organizer" | "participant";
export type EventStatus = "draft" | "published" | "in_progress" | "finished" | "cancelled";
export type EventCategory = "palestra" | "seminario" | "mesa_redonda" | "oficina" | "workshop" | "conferencia" | "outro" | "sem_categoria";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  banner?: string;
  date: string;
  endDate?: string;
  location: string;
  workload: number;
  capacity: number;
  status: EventStatus;
  subscriptionsOpen: boolean;
  organizerId: string;
  organizer?: User;
  subscriptions?: Subscription[];
  createdAt: string;
  updatedAt: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  palestra: "Palestra",
  seminario: "Seminário",
  mesa_redonda: "Mesa Redonda",
  oficina: "Oficina",
  workshop: "Workshop",
  conferencia: "Conferência",
  outro: "Outro",
  sem_categoria: "Sem Categoria",
};

export interface Subscription {
  id: string;
  userId: string;
  eventId: string;
  user?: User;
  event?: Event;
  subscribedAt: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  status: string;
  message: string;
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  in_progress: "Em Andamento",
  finished: "Evento encerrado",
  cancelled: "Cancelado",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  finished: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};
