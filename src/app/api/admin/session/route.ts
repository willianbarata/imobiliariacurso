import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
export async function GET() { const result = await requireApiUser(Role.ADMIN); if ("response" in result) return result.response; return NextResponse.json({ success: true, data: { user: result.user } }); }
