import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/auth/session";

export async function requireApiUser(role?: Role) {
  const user = await requireUser(role);
  if (user) return { user };
  return { response: NextResponse.json({ success: false, error: { code: role === Role.ADMIN ? "FORBIDDEN" : "UNAUTHORIZED", message: "Acesso não autorizado." } }, { status: role === Role.ADMIN ? 403 : 401 }) };
}
