import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { createUser } from "@/services/user-service";
import { prisma } from "@/lib/prisma";
export async function GET() { const auth = await requireApiUser(Role.ADMIN); if ("response" in auth) return auth.response; return NextResponse.json({ data: await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }) }); }
export async function POST(request: NextRequest) { const auth = await requireApiUser(Role.ADMIN); if ("response" in auth) return auth.response; try { return NextResponse.json({ data: await createUser(await request.json()) }, { status: 201 }); } catch (error) { return NextResponse.json({ success: false, error: { code: error instanceof Error && error.message.includes("Unique") ? "EMAIL_ALREADY_EXISTS" : "VALIDATION_ERROR", message: "Não foi possível criar o usuário." } }, { status: 422 }); } }
