import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/auth/constants";
import { clearSessionCookies, setSessionCookies } from "@/auth/session";
import { createAccessToken, createRefreshToken, hashRefreshToken, refreshExpiry } from "@/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const unauthorized = () => {
    const response = NextResponse.json({ success: false, error: { code: "SESSION_EXPIRED", message: "Sua sessão expirou." } }, { status: 401 });
    clearSessionCookies(response);
    return response;
  };
  if (!refreshToken) return unauthorized();

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    include: { user: { select: { id: true, name: true, role: true, active: true } } },
  });
  if (!session || !session.user.active || session.expiresAt <= new Date()) return unauthorized();

  if (session.revokedAt) {
    await prisma.refreshSession.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    return unauthorized();
  }

  const nextRefreshToken = createRefreshToken();
  const now = new Date();
  await prisma.$transaction([
    prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: now, lastUsedAt: now } }),
    prisma.refreshSession.create({
      data: { userId: session.userId, tokenHash: hashRefreshToken(nextRefreshToken), familyId: session.familyId, expiresAt: refreshExpiry() },
    }),
  ]);

  const accessToken = await createAccessToken({ sub: session.user.id, role: session.user.role, jti: randomUUID() });
  const response = NextResponse.json({ success: true, data: { user: { id: session.user.id, name: session.user.name, role: session.user.role } } });
  setSessionCookies(response, accessToken, nextRefreshToken);
  return response;
}
