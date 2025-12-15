import { z } from "zod";

export const createEventSchema = z.object({
  titulo: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  data_inicio: z.date({
    required_error: "A data do evento é obrigatória",
  }).refine((date) => date > new Date(), {
    message: "A data do evento deve ser no futuro",
  }),
  local: z.string().min(3, "Localização é obrigatória"),
  max_inscricoes: z.coerce.number().min(1, "Deve haver pelo menos 1 vaga"),
  categoria: z.string().min(1, "Selecione uma categoria"),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;                          