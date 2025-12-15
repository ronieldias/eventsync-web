// src/components/organizer/OrganizerEventList.tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Users, ArrowUpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

import { useMyEvents, usePublishEvent, useToggleRegistrations } from "@/hooks/api/organizer";
import { EventStatus } from "@/types";

export function OrganizerEventList() {
  // Capturando também isError, que é o provável motivo da quebra
  const { data: events, isLoading, isError } = useMyEvents();
  const { mutate: publishEvent } = usePublishEvent();
  const { mutate: toggleRegistrations } = useToggleRegistrations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Se houver erro na API, mostramos uma mensagem de feedback
  if (isError) {
    return (
      <div className="text-center py-10 border border-destructive bg-red-50/50 rounded-lg">
        <p className="text-destructive font-medium">
          Erro ao carregar seus eventos. Verifique se o backend está rodando e se você está logado corretamente.
        </p>
        <p className="text-sm text-red-700 mt-1">
          (Pode ser um erro de permissão ou a API não retornou uma lista válida.)
        </p>
      </div>
    );
  }
  
  // CORREÇÃO FINAL DA LÓGICA:
  // Se 'events' não for um array, ou se for um array vazio, mostramos a mensagem.
  const eventList = Array.isArray(events) ? events : [];
  
  if (eventList.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Você ainda não criou nenhum evento.</p>
        <p className="text-sm text-muted-foreground mt-1">Use o botão "Criar Novo Evento" para começar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Inscrições</TableHead>
            <TableHead>Inscritos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Agora usamos eventList, que é garantidamente um array */}
          {eventList.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.titulo}</TableCell>
              <TableCell>
                {format(new Date(event.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {event.status === EventStatus.PUBLICADO ? (
                  <Badge variant="default" className="bg-green-600">Publicado</Badge>
                ) : event.status === EventStatus.RASCUNHO ? (
                  <Badge variant="secondary">Rascunho</Badge>
                ) : (
                  <Badge variant="destructive">Cancelado</Badge>
                )}
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <Switch 
                        checked={event.inscricao_aberta}
                        onCheckedChange={(checked: boolean) => toggleRegistrations({ id: event.id, open: checked })}
                        disabled={event.status === EventStatus.RASCUNHO} 
                    />
                    <span className="text-xs text-muted-foreground">
                        {event.inscricao_aberta ? 'Abertas' : 'Fechadas'}
                    </span>
                 </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.total_inscritos || 0} / {event.max_inscricoes}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opções</DropdownMenuLabel>
                    
                    {event.status === EventStatus.RASCUNHO && (
                        <DropdownMenuItem onClick={() => publishEvent(event.id)}>
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Publicar
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-blue-600 font-medium">
                        Ver Lista de Inscritos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}