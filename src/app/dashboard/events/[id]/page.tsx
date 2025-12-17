"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/services/api";
import {
  Event,
  EventStatus,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  Subscriber,
} from "@/types";
import { cn } from "@/lib/utils";

const STATUS_TRANSITIONS: Record<EventStatus, { status: EventStatus; label: string; variant: "primary" | "secondary" | "destructive" | "success-soft" | "warning-soft" | "danger-soft" | "info-soft" }[]> = {
  draft: [
    { status: "published", label: "Publicar", variant: "success-soft" },
    // Rascunho não pode ser cancelado, apenas excluído
  ],
  published: [
    { status: "in_progress", label: "Iniciar Evento", variant: "success-soft" },
    { status: "draft", label: "Voltar para Rascunho", variant: "warning-soft" },
    { status: "cancelled", label: "Cancelar Evento", variant: "danger-soft" },
  ],
  in_progress: [
    { status: "finished", label: "Finalizar", variant: "info-soft" },
    { status: "cancelled", label: "Cancelar Evento", variant: "danger-soft" },
  ],
  finished: [],
  cancelled: [],
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [removingSubscriber, setRemovingSubscriber] = useState<string | null>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    loadEvent();
  }, [eventId]);

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
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangeStatus(newStatus: EventStatus) {
    if (!event) return;

    setIsUpdating(true);
    try {
      const response = await api.patch<Event>(`/events/${eventId}/status`, {
        status: newStatus,
      });
      setEvent(response.data);
      showToast(`Status alterado para "${EVENT_STATUS_LABELS[newStatus]}"`, "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao alterar status do evento", "error");
      console.error("Error changing status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleToggleSubscriptions() {
    if (!event) return;

    setIsUpdating(true);
    try {
      const response = await api.patch<Event>(`/events/${eventId}/subscriptions`, {
        open: !event.subscriptionsOpen,
      });
      setEvent(response.data);
      showToast(response.data.subscriptionsOpen ? "Inscrições abertas" : "Inscrições fechadas", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao alterar inscrições", "error");
      console.error("Error toggling subscriptions:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    setIsUpdating(true);
    try {
      await api.delete(`/events/${eventId}`);
      showToast("Evento excluído com sucesso", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao excluir evento", "error");
      console.error("Error deleting event:", error);
      setIsUpdating(false);
    }
  }

  function openRemovalModal(subscriber: Subscriber) {
    setSelectedSubscriber(subscriber);
    setRemovalReason("");
    setShowRemovalModal(true);
  }

  async function handleRemoveSubscriber() {
    if (!selectedSubscriber || !removalReason.trim()) {
      showToast("Por favor, informe o motivo da remoção", "error");
      return;
    }

    setRemovingSubscriber(selectedSubscriber.id);
    try {
      await api.delete(`/events/${eventId}/subscribers/${selectedSubscriber.id}`, {
        data: { reason: removalReason },
      });
      setSubscribers(subscribers.filter((s) => s.id !== selectedSubscriber.id));
      showToast(`${selectedSubscriber.name} foi removido do evento`, "success");
      setShowRemovalModal(false);
      setSelectedSubscriber(null);
      setRemovalReason("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao remover participante", "error");
    } finally {
      setRemovingSubscriber(null);
    }
  }

  async function handleSendNotification() {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      showToast("Preencha o título e a mensagem", "error");
      return;
    }

    setIsSendingNotification(true);
    try {
      await api.post(`/notifications/event/${eventId}/send`, {
        title: notificationTitle,
        message: notificationMessage,
      });
      showToast(`Notificação enviada para ${subscribers.length} participante(s)`, "success");
      setShowNotificationModal(false);
      setNotificationTitle("");
      setNotificationMessage("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao enviar notificação", "error");
    } finally {
      setIsSendingNotification(false);
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

  const canEdit = ["draft", "published", "in_progress"].includes(event.status);
  const canDelete = event.status === "draft";
  const canManageSubscriptions = ["published", "in_progress"].includes(event.status);
  const canRemoveParticipants = ["published", "in_progress"].includes(event.status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
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
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detalhes do evento */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded-full",
                      EVENT_STATUS_COLORS[event.status]
                    )}
                  >
                    {EVENT_STATUS_LABELS[event.status]}
                  </span>
                </div>
                {canEdit && (
                  <Link href={`/dashboard/events/${eventId}/edit`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                )}
              </div>

              {event.banner && (
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>

              <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                {event.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                    <p className="font-medium">Data</p>
                    <p>
                      {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                    <p className="font-medium">Local</p>
                    <p>{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                    <p className="font-medium">Carga Horária</p>
                    <p>{event.workload}h</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Vagas</p>
                    <p>
                      {subscribers.length} / {event.capacity}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de inscritos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Participantes Inscritos ({subscribers.length})
              </h2>

              {subscribers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum participante inscrito ainda.
                </p>
              ) : (
                <div className="divide-y">
                  {subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {subscriber.name}
                        </p>
                        <p className="text-sm text-gray-500">{subscriber.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-400">
                          {format(
                            new Date(subscriber.subscribedAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                        {canRemoveParticipants && (
                          <button
                            onClick={() => openRemovalModal(subscriber)}
                            disabled={removingSubscriber === subscriber.id}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Remover participante"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-6">
            {/* Status e transições */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ações
              </h2>

              <div className="space-y-3">
                {STATUS_TRANSITIONS[event.status].map((transition) => (
                  <Button
                    key={transition.status}
                    variant={transition.variant}
                    className="w-full"
                    onClick={() => handleChangeStatus(transition.status)}
                    disabled={isUpdating}
                  >
                    {transition.label}
                  </Button>
                ))}

                {canManageSubscriptions && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleToggleSubscriptions}
                    disabled={isUpdating}
                  >
                    {event.subscriptionsOpen
                      ? "Fechar Inscrições"
                      : "Abrir Inscrições"}
                  </Button>
                )}

                {subscribers.length > 0 && (
                  <Button
                    variant="info-soft"
                    className="w-full"
                    onClick={() => setShowNotificationModal(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Enviar Notificação
                  </Button>
                )}

                {canDelete && (
                  <Button
                    variant="danger-soft"
                    className="w-full"
                    onClick={handleDelete}
                    disabled={isUpdating}
                  >
                    Excluir Evento
                  </Button>
                )}

                {!canDelete && canEdit && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Eventos publicados ou em andamento não podem ser excluídos.
                  </p>
                )}
              </div>
            </div>

            {/* Info inscrições */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Inscrições
              </h2>

              <div
                className={cn(
                  "p-4 rounded-lg text-center",
                  event.subscriptionsOpen
                    ? "bg-green-50 text-green-800"
                    : event.status === "published"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-gray-50 text-gray-600"
                )}
              >
                <p className="font-medium">
                  {event.subscriptionsOpen
                    ? "Abertas"
                    : event.status === "published"
                    ? "Aguardando abertura..."
                    : "Fechadas"}
                </p>
                <p className="text-sm mt-1">
                  {subscribers.length} de {event.capacity} vagas preenchidas
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de remoção de participante */}
      {showRemovalModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remover Participante
            </h3>
            <p className="text-gray-600 mb-4">
              Você está removendo <strong>{selectedSubscriber.name}</strong> do evento.
              Por favor, informe o motivo:
            </p>
            <textarea
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Motivo da remoção..."
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemovalModal(false);
                  setSelectedSubscriber(null);
                  setRemovalReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger-soft"
                onClick={handleRemoveSubscriber}
                disabled={!removalReason.trim() || removingSubscriber !== null}
                isLoading={removingSubscriber !== null}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de envio de notificação */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enviar Notificação aos Participantes
            </h3>
            <p className="text-gray-600 mb-4">
              Esta mensagem será enviada para <strong>{subscribers.length} participante(s)</strong> inscritos.
            </p>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Título da notificação..."
              maxLength={100}
            />
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Mensagem para os participantes..."
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotificationTitle("");
                  setNotificationMessage("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="info-soft"
                onClick={handleSendNotification}
                disabled={!notificationTitle.trim() || !notificationMessage.trim() || isSendingNotification}
                isLoading={isSendingNotification}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
