import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function loginAllowed(key: string) {
  const entry = await prisma.loginRateLimit.findUnique({ where: { key }, select: { count: true, expiresAt: true } });
  return !entry || entry.expiresAt <= new Date() || entry.count < MAX_ATTEMPTS;
}

export async function recordFailedLogin(key: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WINDOW_MS);
  const entry = await prisma.loginRateLimit.findUnique({ where: { key }, select: { expiresAt: true } });
  if (!entry || entry.expiresAt <= now) return prisma.loginRateLimit.upsert({ where: { key }, create: { key, count: 1, expiresAt }, update: { count: 1, expiresAt } });
  return prisma.loginRateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}

export async function clearFailedLogins(key: string) {
  await prisma.loginRateLimit.delete({ where: { key } }).catch(() => undefined);
}
