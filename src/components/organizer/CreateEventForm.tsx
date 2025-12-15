// src/components/organizer/CreateEventForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea"; // Módulo agora existe
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

  // CORREÇÃO: Forçando a tipagem do useForm para corresponder exatamente ao nosso Zod Schema
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      local: "",
      // Define max_inscricoes como number, conforme esperado pelo FormValues
      max_inscricoes: 0, 
      categoria: "",
      // data_inicio é do tipo Date, e não deve estar aqui ou ser null/undefined
    },
  });

  function onSubmit(data: CreateEventFormValues) {
    // A tipagem 'data' aqui agora é a correta: CreateEventFormValues
    createEvent({
      ...data,
      data_inicio: data.data_inicio.toISOString(),
    }, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
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

        {/* Data Início */}
        <FormField
          control={form.control}
          name="data_inicio"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Evento</FormLabel>
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
                        <span>Escolha uma data</span>
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
                    components={{
                      IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
                      IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
                    } as any} // Manter a asserção para evitar o erro de tipagem anterior
                  />
                </PopoverContent>
              </Popover>
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
                <Input placeholder="Ex: Auditório A ou Online" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Capacidade */}
        <FormField
          control={form.control}
          name="max_inscricoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade Máxima</FormLabel>
              <FormControl>
                {/* Nota: Zod coerce trata a string vazia ou inválida para number */}
                <Input type="number" placeholder="100" {...field} />
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