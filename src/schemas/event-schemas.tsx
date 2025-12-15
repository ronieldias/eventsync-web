// src/schemas/event-schemas.tsx
import { z } from "zod";

export const createEventSchema = z.object({
  titulo: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  
  data_inicio: z.date({
    message: "A data de início é obrigatória."
  }).refine((date) => date > new Date(), {
    message: "A data de início deve ser no futuro",
  }),
  
  data_fim: z.date({
    message: "A data de término é obrigatória."
  }),
  
  // NOVO CAMPO OBRIGATÓRIO: Carga Horária
  carga_horaria: z.string()
    .min(1, "A carga horária deve ser de pelo menos 1 hora.")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "A carga horária deve ser um número positivo.",
    }),
  
  local: z.string().min(3, "Localização é obrigatória"),
  
  max_inscricoes: z.string()
    .min(1, "A capacidade deve ser de pelo menos 1.")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), {
        message: "O número de vagas deve ser um número inteiro positivo.",
    }),
    
  categoria: z.string().min(1, "Selecione uma categoria"),
})
// VALIDAÇÃO DE OBJETO: data_fim não pode ser anterior à data_inicio
.refine((data) => data.data_fim >= data.data_inicio, {
  message: "A data de término não pode ser anterior à data de início.",
  path: ["data_fim"],
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;