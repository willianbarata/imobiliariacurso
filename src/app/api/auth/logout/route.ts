import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/auth/constants";
import { clearSessionCookies } from "@/auth/session";
import { hashRefreshToken } from "@/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await prisma.refreshSession.updateMany({
      where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
