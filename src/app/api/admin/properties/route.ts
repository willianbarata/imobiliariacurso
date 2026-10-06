import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { createProperty } from "@/services/property-service";
import { propertySchema } from "@/schemas/property";
import { prisma } from "@/lib/prisma";
export async function GET() { const auth = await requireApiUser(); if ("response" in auth) return auth.response; const properties = await prisma.property.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, code: true, title: true, status: true, publicationState: true, updatedAt: true } }); return NextResponse.json({ data: properties }); }
export async function POST(request: NextRequest) { const auth = await requireApiUser(); if ("response" in auth) return auth.response; const parsed = propertySchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: parsed.error.flatten() } }, { status: 422 }); try { return NextResponse.json({ data: await createProperty(parsed.data, auth.user.id) }, { status: 201 }); } catch (error) { return NextResponse.json({ success: false, error: { code: error instanceof Error ? error.message : "PROPERTY_CREATE_FAILED", message: "Não foi possível criar o imóvel." } }, { status: 422 }); } }
