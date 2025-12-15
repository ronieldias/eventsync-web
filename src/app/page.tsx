'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/api/events';
import { EventCard } from '@/components/events/event-card';
import { EventSearch } from '@/components/events/event-search';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // CORREÇÃO: Mapeamos 'search' para 'nome' aqui
  const queryParams = {
    nome: search || undefined, // Backend espera 'nome'
    categoria: category === 'all' ? undefined : category || undefined,
  };

  const { data: events, isLoading, isError } = useEvents(queryParams);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Descubra Experiências Incríveis
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Encontre shows, workshops, palestras e muito mais perto de você.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="container mx-auto max-w-6xl px-4 -mt-8">
        <EventSearch 
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        {isError && (
          <div className="text-center py-20 text-red-500">
            Erro ao carregar eventos. Verifique se a API está rodando.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Skeletons de Carregamento */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="space-y-2 p-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events?.length === 0 ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Nenhum evento encontrado para "{search}".
              </div>
            ) : (
              events?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}