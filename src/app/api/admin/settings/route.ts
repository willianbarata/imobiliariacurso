import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/schemas/user";
export async function GET() { const auth = await requireApiUser(Role.ADMIN); if ("response" in auth) return auth.response; return NextResponse.json({ data: await prisma.systemSettings.findUnique({ where: { id: 1 } }) }); }
export async function PUT(request: NextRequest) { const auth = await requireApiUser(Role.ADMIN); if ("response" in auth) return auth.response; const parsed = settingsSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Número inválido." } }, { status: 422 }); return NextResponse.json({ data: await prisma.systemSettings.update({ where: { id: 1 }, data: { ...parsed.data, updatedBy: auth.user.id } }) }); }
