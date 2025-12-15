import Link from 'next/link';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { Event } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // CORREÇÃO: Usar data_inicio ao invés de data_hora
  const dateObj = new Date(event.data_inicio);
  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);

  // CORREÇÃO: Usar max_inscricoes ao invés de max_participantes
  const totalInscritos = event.inscricoes?.length || 0;
  const isSoldOut = event.max_inscricoes > 0 && totalInscritos >= event.max_inscricoes;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-32 bg-slate-200 dark:bg-slate-800 w-full object-cover flex items-center justify-center text-slate-400 relative">
        {event.banner_url ? (
           /* Se tiver imagem real, usaríamos <img src={event.banner_url} ... /> */
           <span className="text-xs text-muted-foreground">Com Banner</span>
        ) : (
           <span className="text-sm">Sem imagem</span>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="uppercase text-xs font-bold truncate max-w-[120px]">
            {event.categoria || 'Geral'}
          </Badge>
          {isSoldOut && (
            <Badge variant="destructive" className="text-xs">
              ESGOTADO
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-lg leading-tight mt-2 line-clamp-2">
          {event.titulo}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            {/* CORREÇÃO: Usar 'local' ao invés de 'localizacao' */}
            <span className="line-clamp-1">{event.local}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant={isSoldOut ? "outline" : "default"}>
          <Link href={`/events/${event.id}`}>
            {isSoldOut ? 'Ver Detalhes' : 'Ver Evento'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}