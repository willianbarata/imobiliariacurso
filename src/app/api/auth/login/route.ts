import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { clearFailedLogins, loginAllowed, recordFailedLogin } from "@/auth/login-rate-limit";
import { setSessionCookies } from "@/auth/session";
import { createAccessToken, createRefreshToken, createSessionFamilyId, hashRefreshToken, refreshExpiry } from "@/auth/tokens";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";
import { verifyPassword } from "@/auth/password";

const invalidCredentials = () => NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email ou senha inválidos." } }, { status: 401 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  let input: { email: string; password: string };
  try {
    input = loginSchema.parse(await request.json());
  } catch {
    return invalidCredentials();
  }

  const limitKey = `${ip}:${input.email}`;
  if (!loginAllowed(limitKey)) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Tente novamente mais tarde." } }, { status: 429, headers: { "Retry-After": "900" } });
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.active || !(await verifyPassword(user.passwordHash, input.password))) {
    recordFailedLogin(limitKey);
    return invalidCredentials();
  }

  clearFailedLogins(limitKey);
  const refreshToken = createRefreshToken();
  await prisma.refreshSession.create({
    data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), familyId: createSessionFamilyId(), expiresAt: refreshExpiry() },
  });
  const accessToken = await createAccessToken({ sub: user.id, role: user.role, jti: randomUUID() });
  const response = NextResponse.json({ success: true, data: { user: { id: user.id, name: user.name, role: user.role } } });
  setSessionCookies(response, accessToken, refreshToken);
  return response;
}
