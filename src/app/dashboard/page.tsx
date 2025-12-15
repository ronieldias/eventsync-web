"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrganizerEventList } from "@/components/organizer/OrganizerEventList";
import { CreateEventForm } from "@/components/organizer/CreateEventForm";
// Importe seu hook de autenticação (ajuste o caminho se necessário)
import { useAuth } from "@/hooks/useAuth"; 

export default function DashboardPage() {
  const { user, isLoading } = useAuth(); 
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Proteção de Rota (Simples)
  // Verifica se não está carregando e se usuário não é ORGANIZER
  if (!isLoading) {
    if (!user || user.role !== "organizer") {
      router.push("/login"); 
      return null;
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Organizador</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos e acompanhe as inscrições.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Criar Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo. O evento será criado como rascunho.
              </DialogDescription>
            </DialogHeader>
            
            <CreateEventForm onSuccess={() => setIsDialogOpen(false)} />
            
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border p-2 md:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 px-2">Meus Eventos</h2>
        <OrganizerEventList />
      </div>
    </div>
  );
}