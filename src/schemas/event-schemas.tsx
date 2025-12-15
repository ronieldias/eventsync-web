// src/schemas/event-schemas.tsx
import { z } from "zod";

export const createEventSchema = z.object({
  titulo: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  // CORREÇÃO: Usando a sintaxe de erro mais segura para o z.date()
  data_inicio: z.date({
    message: "A data do evento é obrigatória."
  }).refine((date) => date > new Date(), {
    message: "A data do evento deve ser no futuro",
  }) as z.ZodDate, // Adiciona asserção de tipo para garantir que o RHF o trate como um objeto de data válido
  
  local: z.string().min(3, "Localização é obrigatória"),
  // Mantido coerce.number() e default(0) para compatibilidade com RHF
  max_inscricoes: z.coerce.number().min(1, "Deve haver pelo menos 1 vaga").default(0), 
  categoria: z.string().min(1, "Selecione uma categoria"),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;