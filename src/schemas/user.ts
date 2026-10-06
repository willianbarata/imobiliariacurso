import { z } from "zod";
export const createUserSchema = z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()), password: z.string().min(8).max(1024), role: z.enum(["ADMIN", "USER"]).default("USER") });
export const updateUserSchema = z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()), role: z.enum(["ADMIN", "USER"]), active: z.boolean(), password: z.string().min(8).max(1024).optional() });
export const settingsSchema = z.object({ defaultWhatsappNumber: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(10).max(15)) });
