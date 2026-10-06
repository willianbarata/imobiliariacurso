import { NextRequest, NextResponse } from "next/server";
import { imageUrl } from "@/services/storage-service";
import { prisma } from "@/lib/prisma";
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const image = await prisma.propertyImage.findFirst({ where: { id: (await params).id, property: { deletedAt: null, publicationState: "PUBLISHED", status: { in: ["FOR_SALE", "FOR_RENT"] } } }, select: { bucket: true, objectKey: true } }); if (!image) return NextResponse.json({ success: false, error: { code: "IMAGE_NOT_FOUND", message: "Imagem não encontrada." } }, { status: 404 }); return NextResponse.redirect(await imageUrl(image.bucket, image.objectKey)); }
