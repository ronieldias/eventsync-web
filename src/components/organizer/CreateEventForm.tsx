// src/components/organizer/CreateEventForm.tsx
"use client";

import { CalendarIcon, Loader2, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"; 
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createEventSchema, CreateEventFormValues } from "@/schemas/event-schemas";
import { useCreateEvent } from "@/hooks/api/organizer";

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { mutate: createEvent, isPending } = useCreateEvent();

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      local: "",
      max_inscricoes: "", 
      categoria: "",
      carga_horaria: "", // NOVO DEFAULT
      data_fim: undefined, 
    },
  });

  const onSubmit: SubmitHandler<CreateEventFormValues> = (data) => {
    
    const dataToSend = {
      ...data,
      data_inicio: data.data_inicio.toISOString(),
      data_fim: data.data_fim.toISOString(),
      max_inscricoes: Number(data.max_inscricoes),
      carga_horaria: Number(data.carga_horaria), // NOVO DADO ENVIADO
    };
    
    createEvent(dataToSend, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        console.error('Erro ao salvar evento. Resposta do servidor:', error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Workshop de React" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria */}
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="negocios">Negócios</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* DUAS DATAS LADO A LADO */}
        <div className="grid grid-cols-2 gap-4">
            {/* Data Início */}
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Início</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        components={({
                          IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
                          IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
                        } as any)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Término */}
            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Término</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={!form.watch('data_inicio')}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Término</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < (form.watch('data_inicio') || new Date())}
                        initialFocus
                        components={({
                          IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
                          IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
                        } as any)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        {/* Carga Horária e Localização lado a lado */}
        <div className="grid grid-cols-2 gap-4">
            {/* NOVO CAMPO OBRIGATÓRIO: Carga Horária */}
            <FormField
                control={form.control}
                name="carga_horaria"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Carga Horária (h)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="4" 
                                {...field}
                                value={field.value as string}
                                min={1} // Adiciona min para melhor UX
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        
            {/* Localização */}
            <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Local</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Auditório A" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Capacidade */}
        <FormField
          control={form.control}
          name="max_inscricoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade Máxima</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="100" 
                  {...field}
                  value={field.value as string} 
                />
              </FormControl>
              <FormDescription>Quantas pessoas podem participar?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o evento..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Evento
        </Button>
      </form>
    </Form>
  );
}