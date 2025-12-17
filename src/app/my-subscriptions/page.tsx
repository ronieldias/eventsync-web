"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Subscription, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from "@/types";
import { cn } from "@/lib/utils";

export default function MySubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("@EventSync:user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    loadSubscriptions();
  }, [router]);

  async function loadSubscriptions() {
    try {
      const response = await api.get<Subscription[]>(
        "/events/participant/my-subscriptions"
      );
      setSubscriptions(response.data);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe(eventId: string) {
    if (!confirm("Tem certeza que deseja cancelar sua inscrição?")) return;

    try {
      await api.delete(`/events/${eventId}/subscribe`);
      await loadSubscriptions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Erro ao cancelar inscrição");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minhas Inscrições
          </h1>
          <p className="text-gray-600">
            Acompanhe os eventos em que você está inscrito
          </p>
        </div>

        {subscriptions.length === 0 ? (
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
              Você ainda não está inscrito em nenhum evento.
            </p>
            <Link href="/">
              <Button>Explorar Eventos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const event = subscription.event;
              if (!event) return null;

              // Participante pode cancelar se inscrições abertas e evento publicado ou em andamento
              const canUnsubscribe =
                event.subscriptionsOpen &&
                ["published", "in_progress"].includes(event.status);

              return (
                <div
                  key={subscription.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            EVENT_STATUS_COLORS[event.status]
                          )}
                        >
                          {EVENT_STATUS_LABELS[event.status]}
                        </span>
                        {["published", "in_progress"].includes(event.status) && (
                          event.subscriptionsOpen ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Inscrições Abertas
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                              Inscrições Fechadas
                            </span>
                          )
                        )}
                        <span className="text-xs text-gray-500">
                          Inscrito em{" "}
                          {format(
                            new Date(subscription.subscribedAt),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>

                      <Link href={`/events/${event.id}`}>
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition">
                          {event.title}
                        </h2>
                      </Link>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                          {format(
                            new Date(event.date),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.location}
                        </span>
                        {event.workload > 0 && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {event.workload}h
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Evento
                        </Button>
                      </Link>
                      {canUnsubscribe && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnsubscribe(event.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
