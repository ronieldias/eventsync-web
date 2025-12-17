"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import {
  Event,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  Subscriber,
} from "@/types";
import { cn } from "@/lib/utils";

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (user) {
      setIsSubscribed(subscribers.some((s) => s.id === user.id));
    }
  }, [user, subscribers]);

  async function loadEvent() {
    try {
      const [eventRes, subscribersRes] = await Promise.all([
        api.get<Event>(`/events/${eventId}`),
        api.get<Subscriber[]>(`/events/${eventId}/subscribers`),
      ]);
      setEvent(eventRes.data);
      setSubscribers(subscribersRes.data);
    } catch (error) {
      console.error("Error loading event:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setIsSubscribing(true);
    try {
      await api.post(`/events/${eventId}/subscribe`);
      showToast("Inscrição realizada com sucesso!", "success");
      await loadEvent();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao se inscrever", "error");
    } finally {
      setIsSubscribing(false);
    }
  }

  async function handleUnsubscribe() {
    setIsSubscribing(true);
    try {
      await api.delete(`/events/${eventId}/subscribe`);
      showToast("Inscrição cancelada com sucesso", "success");
      await loadEvent();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao cancelar inscrição", "error");
    } finally {
      setIsSubscribing(false);
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

  if (!event) return null;

  const spotsLeft = event.capacity - subscribers.length;
  const canSubscribe =
    event.subscriptionsOpen &&
    spotsLeft > 0 &&
    ["published", "in_progress"].includes(event.status);

  // Participante pode cancelar inscrição se:
  // - Inscrições estão abertas
  // - Evento está publicado ou em andamento
  const canUnsubscribe =
    event.subscriptionsOpen &&
    ["published", "in_progress"].includes(event.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary-600 hover:underline text-sm flex items-center gap-1"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar para Eventos
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detalhes do evento */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {event.banner && (
                <div className="h-64 bg-gray-200">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded-full",
                      EVENT_STATUS_COLORS[event.status]
                    )}
                  >
                    {EVENT_STATUS_LABELS[event.status]}
                  </span>
                  {event.subscriptionsOpen ? (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      Inscrições Abertas
                    </span>
                  ) : event.status === "published" ? (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
                      Aguardando inscrições...
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                      Inscrições Fechadas
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                <p className="text-gray-600 whitespace-pre-wrap mb-6">
                  {event.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 mt-0.5"
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
                    <div>
                      <p className="font-medium text-gray-900">Data e Hora</p>
                      <p className="text-gray-600">
                        {format(new Date(event.date), "EEEE, dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-gray-600">
                        {format(new Date(event.date), "'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 mt-0.5"
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
                    <div>
                      <p className="font-medium text-gray-900">Local</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 mt-0.5"
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
                    <div>
                      <p className="font-medium text-gray-900">Carga Horária</p>
                      <p className="text-gray-600">{event.workload} horas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Organizador</p>
                      <p className="text-gray-600">{event.organizer?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de participantes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Participantes Inscritos ({subscribers.length}/{event.capacity})
              </h2>

              {subscribers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Seja o primeiro a se inscrever!
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {subscriber.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-gray-900 truncate">
                          {subscriber.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card de inscrição */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  {spotsLeft}
                </p>
                <p className="text-gray-600">vagas disponíveis</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(subscribers.length / event.capacity) * 100}%`,
                  }}
                />
              </div>

              {isAuthenticated ? (
                isSubscribed ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <svg
                        className="w-8 h-8 mx-auto text-green-600 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="font-medium text-green-800">
                        Você está inscrito!
                      </p>
                    </div>
                    {canUnsubscribe && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleUnsubscribe}
                        disabled={isSubscribing}
                      >
                        Cancelar Inscrição
                      </Button>
                    )}
                  </div>
                ) : canSubscribe ? (
                  <Button
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    isLoading={isSubscribing}
                  >
                    Inscrever-se
                  </Button>
                ) : (
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    event.status === "published" ? "bg-amber-50" : "bg-gray-50"
                  )}>
                    <p className={event.status === "published" ? "text-amber-700" : "text-gray-600"}>
                      {spotsLeft === 0
                        ? "Evento lotado"
                        : event.status === "published"
                        ? "Aguardando abertura de inscrições..."
                        : "Inscrições fechadas"}
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Faça login para se inscrever
                  </p>
                  <Link href="/auth/login" className="block">
                    <Button className="w-full">Fazer Login</Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button variant="outline" className="w-full">
                      Criar Conta
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
