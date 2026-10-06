import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, ACCESS_TOKEN_TTL_SECONDS, REFRESH_COOKIE, REFRESH_TOKEN_TTL_SECONDS } from "@/auth/constants";
import { verifyAccessToken } from "@/auth/tokens";
import { prisma } from "@/lib/prisma";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookies(response: { cookies: { set: (name: string, value: string, options: object) => void } }, accessToken: string, refreshToken: string) {
  response.cookies.set(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL_SECONDS });
  response.cookies.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_TTL_SECONDS });
}

export function clearSessionCookies(response: { cookies: { set: (name: string, value: string, options: object) => void } }) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function requireUser(requiredRole?: Role) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const session = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, role: true, active: true },
    });
    if (!user?.active || (requiredRole === Role.ADMIN && user.role !== Role.ADMIN)) return null;
    return user;
  } catch {
    return null;
  }
}
