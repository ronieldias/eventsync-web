'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarIcon, MapPinIcon, UsersIcon, ArrowLeftIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { useEvent, useSubscribe, useCancelSubscription } from '@/hooks/api/events';
import { useMyRegistrations } from '@/hooks/api/registrations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/providers/auth-provider'; // No topo

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data: event, isLoading: isLoadingEvent, isError } = useEvent(id);
  const { data: myRegistrations, isLoading: isLoadingRegs, refetch: refetchMyRegs } = useMyRegistrations();
  
  const { mutate: subscribe, isPending: isSubscribing } = useSubscribe();
  const { mutate: cancelSubscription, isPending: isCanceling } = useCancelSubscription();

  const { isAuthenticated: isLoggedIn } = useAuthContext(); // Dentro do componente
  const isLoading = isLoadingEvent || (isLoggedIn && isLoadingRegs);

  // Procura a inscrição ativa deste usuário neste evento
  const myActiveRegistration = myRegistrations?.find(
    (reg) => reg.evento.id === id && reg.status === 'ativo'
  );

  const isSubscribed = !!myActiveRegistration;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Evento não encontrado</h1>
        <Button asChild variant="outline">
          <Link href="/">Voltar para Home</Link>
        </Button>
      </div>
    );
  }

  function handleSubscribe() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    subscribe(id, {
      onSuccess: () => {
        toast.success('Inscrição confirmada!');
        refetchMyRegs(); // Recarrega a lista para o botão mudar de estado
      },
      onError: (error: any) => {
        const msg = error.response?.data?.error || 'Erro ao se inscrever.';
        toast.error(msg);
      }
    });
  }

  function handleCancel() {
    if (!myActiveRegistration) return;
    
    // CORREÇÃO: Usamos .inscricao_id aqui
    const registrationId = myActiveRegistration.inscricao_id; 

    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) return;

    cancelSubscription(registrationId, {
      onSuccess: () => {
        toast.success('Inscrição cancelada.');
        refetchMyRegs(); // Recarrega a lista para o botão voltar a ser "Inscrever"
      },
      onError: () => toast.error('Erro ao cancelar.')
    });
  }

  // Cálculos visuais
  const startDate = new Date(event.data_inicio);
  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(startDate);

  const totalInscritos = event.total_inscritos || event.inscricoes?.length || 0;
  const hasLimit = event.max_inscricoes > 0;
  const isSoldOut = hasLimit && totalInscritos >= event.max_inscricoes;
  const percentage = hasLimit ? Math.min((totalInscritos / event.max_inscricoes) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Voltar para eventos
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="md:col-span-2 space-y-6">
            <div className="relative h-64 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
               {event.banner_url ? (
                 <img src={event.banner_url} alt={event.titulo} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-slate-400">Banner do Evento</span>
               )}
            </div>

            <div>
              <div className="flex gap-2 mb-4">
                <Badge>{event.categoria || 'Geral'}</Badge>
                {isSoldOut && !isSubscribed && <Badge variant="destructive">ESGOTADO</Badge>}
                {!event.inscricao_aberta && !isSubscribed && <Badge variant="outline">FECHADO</Badge>}
                {isSubscribed && <Badge variant="default" className="bg-green-600">INSCRITO</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {event.titulo}
              </h1>
            </div>

            <Separator />

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-2">Sobre o evento</h3>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {event.descricao}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Data e Hora</p>
                      <p className="text-sm text-muted-foreground capitalize">{dateFormatted}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Carga Horária</p>
                      <p className="text-sm text-muted-foreground">{event.carga_horaria} horas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Localização</p>
                      <p className="text-sm text-muted-foreground">{event.local}</p>
                    </div>
                  </div>

                  {hasLimit && (
                    <div className="flex items-start gap-3">
                      <UsersIcon className="w-5 h-5 text-primary mt-0.5" />
                      <div className="w-full">
                        <p className="font-semibold text-sm">Participantes</p>
                        <p className="text-sm text-muted-foreground">
                          {totalInscritos} / {event.max_inscricoes} vagas
                        </p>
                        <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  {!isLoggedIn ? (
                    <Button asChild className="w-full" variant="secondary">
                      <Link href="/login">Faça Login para Participar</Link>
                    </Button>
                  ) : isSubscribed ? (
                    <div className="space-y-2">
                       <Button 
                        className="w-full" 
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isCanceling}
                      >
                        {isCanceling ? 'Cancelando...' : 'Cancelar Inscrição'}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Sua vaga está garantida.
                      </p>
                    </div>
                  ) : isSoldOut ? (
                    <Button className="w-full" disabled variant="ghost">
                      Ingressos Esgotados
                    </Button>
                  ) : !event.inscricao_aberta ? (
                     <Button className="w-full" disabled variant="outline">
                      Inscrições Fechadas
                    </Button>
                  ) : (
                    <Button 
                      className="w-full size-lg" 
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? 'Inscrevendo...' : 'Inscrever-se'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}