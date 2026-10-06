import { NextRequest, NextResponse } from "next/server";
import { getPublicPropertyBySlug } from "@/features/properties/public-property-query";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) { const property = await getPublicPropertyBySlug((await params).slug); return property ? NextResponse.json({ data: property }) : NextResponse.json({ success: false, error: { code: "PROPERTY_NOT_FOUND", message: "Imóvel não encontrado." } }, { status: 404 }); }
