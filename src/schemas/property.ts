import { z } from "zod";

const price = z.union([z.number(), z.string()]).transform((value, context) => {
  const raw = String(value).trim().replace(/[R$\s]/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um preço válido." });
    return z.NEVER;
  }
  return parsed;
});

export const propertySchema = z.object({
  title: z.string().trim().min(3).max(200), description: z.string().trim().min(10).max(10000), price, status: z.enum(["FOR_SALE", "FOR_RENT", "SOLD", "RENTED"]), categoryId: z.string().uuid(),
  zipCode: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().length(8)), street: z.string().trim().min(2).max(200), number: z.string().trim().min(1).max(30), complement: z.string().trim().max(120).optional().transform((value) => value || undefined), neighborhood: z.string().trim().min(2).max(120), city: z.string().trim().min(2).max(120), state: z.string().trim().toUpperCase().length(2), country: z.string().trim().min(2).max(80).default("Brasil"), latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(), whatsappNumber: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(10).max(15)), publicationState: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
export type PropertyInput = z.infer<typeof propertySchema>;
