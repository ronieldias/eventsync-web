"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layouts/Header";
import { EventCard } from "@/components/features/EventCard";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Event, EventStatus, EVENT_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { value: EventStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunhos" },
  { value: "published", label: "Publicados" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "finished", label: "Finalizados" },
  { value: "cancelled", label: "Cancelados" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<EventStatus | "all">("all");

  useEffect(() => {
    const storedUser = localStorage.getItem("@EventSync:user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "organizer") {
      router.push("/");
      return;
    }

    loadMyEvents();
  }, [router]);

  async function loadMyEvents() {
    try {
      const response = await api.get<Event[]>("/events/organizer/my-events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtrar e ordenar eventos alfabeticamente por título
  const filteredEvents = useMemo(() => {
    const filtered =
      filter === "all"
        ? events
        : events.filter((event) => event.status === filter);

    return [...filtered].sort((a, b) =>
      a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" })
    );
  }, [events, filter]);

  const statusCounts = events.reduce(
    (acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard do Organizador
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus eventos e acompanhe as inscrições
            </p>
          </div>
          <Link href="/dashboard/events/new">
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Evento
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition",
                filter === item.value
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.label}
              {statusCounts[item.value] !== undefined && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {statusCounts[item.value] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 mb-4">
              {filter === "all"
                ? "Você ainda não criou nenhum evento."
                : `Nenhum evento com status "${EVENT_STATUS_LABELS[filter as EventStatus]}".`}
            </p>
            {filter === "all" && (
              <Link href="/dashboard/events/new">
                <Button>Criar meu primeiro evento</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showStatus
                href={`/dashboard/events/${event.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
