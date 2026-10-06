import { Role } from "@prisma/client";
import { hashPassword } from "@/auth/password";
import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "@/schemas/user";

export async function createUser(input: unknown) { const { password, ...data } = createUserSchema.parse(input); return prisma.user.create({ data: { ...data, passwordHash: await hashPassword(password) }, select: { id: true, name: true, email: true, role: true, active: true } }); }
export async function updateUser(id: string, input: unknown) { const data = updateUserSchema.parse(input); const current = await prisma.user.findUnique({ where: { id } }); if (!current) return null; const removesLastAdmin = current.role === Role.ADMIN && current.active && (data.role !== Role.ADMIN || !data.active); if (removesLastAdmin && await prisma.user.count({ where: { role: Role.ADMIN, active: true } }) <= 1) throw new Error("LAST_ACTIVE_ADMIN"); const user = await prisma.user.update({ where: { id }, data: { name: data.name, email: data.email, role: data.role, active: data.active, ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}) }, select: { id: true, name: true, email: true, role: true, active: true } }); if (!user.active) await prisma.refreshSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }); return user; }
