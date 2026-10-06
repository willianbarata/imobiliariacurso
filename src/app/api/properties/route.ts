import { NextRequest, NextResponse } from "next/server";
import { listPublicProperties, parsePublicPropertyQuery } from "@/features/properties/public-property-query";
export async function GET(request: NextRequest) {
  const query = parsePublicPropertyQuery(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!query) return NextResponse.json({ success: false, error: { code: "INVALID_QUERY", message: "Filtros inválidos." } }, { status: 400 });
  return NextResponse.json(await listPublicProperties(query));
}
