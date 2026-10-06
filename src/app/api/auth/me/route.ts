import { NextResponse } from "next/server";
import { requireUser } from "@/auth/session";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Não autenticado." } }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: { user } });
}
