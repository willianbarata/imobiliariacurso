import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { updateUser } from "@/services/user-service";
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const auth = await requireApiUser(Role.ADMIN); if ("response" in auth) return auth.response; try { const user = await updateUser((await params).id, await request.json()); return user ? NextResponse.json({ data: user }) : NextResponse.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuário não encontrado." } }, { status: 404 }); } catch (error) { return NextResponse.json({ success: false, error: { code: error instanceof Error ? error.message : "VALIDATION_ERROR", message: "Não foi possível atualizar o usuário." } }, { status: 422 }); } }
