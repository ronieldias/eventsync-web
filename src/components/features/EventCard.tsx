"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
  href?: string;
}

export function EventCard({ event, showStatus = false, href }: EventCardProps) {
  const linkHref = href || `/events/${event.id}`;
  const isInactive = event.status === "cancelled" || event.status === "finished";

  return (
    <Link href={linkHref}>
      <div className={cn(
        "bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer h-full flex flex-col",
        isInactive && "opacity-60 grayscale-[30%]"
      )}>
        {event.banner && (
          <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
            <img
              src={event.banner}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          {showStatus && (
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap",
                EVENT_STATUS_COLORS[event.status]
              )}
            >
              {EVENT_STATUS_LABELS[event.status]}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <p className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
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
            <span>
              {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          </p>

          <p className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
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
            <span className="truncate">{event.location}</span>
          </p>

          {event.workload > 0 && (
            <p className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
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
              <span>{event.workload}h de carga horária</span>
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
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
              <span>{event.capacity} vagas</span>
            </p>

            {event.subscriptionsOpen ? (
              <span className="text-green-600 text-xs font-medium">
                Inscrições abertas
              </span>
            ) : event.status === "published" ? (
              <span className="text-amber-600 text-xs font-medium">
                Aguardando inscrições...
              </span>
            ) : (
              <span className="text-gray-400 text-xs">
                Inscrições fechadas
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
