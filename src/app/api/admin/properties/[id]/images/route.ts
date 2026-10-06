import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { deleteImageObject, uploadImage, validateImage } from "@/services/storage-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const propertyId = (await params).id;
  const property = await prisma.property.findFirst({ where: { id: propertyId, deletedAt: null }, select: { id: true } });
  if (!property) return NextResponse.json({ success: false, error: { code: "PROPERTY_NOT_FOUND", message: "Imóvel não encontrado." } }, { status: 404 });
  const form = await request.formData();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ success: false, error: { code: "NO_FILES", message: "Selecione ao menos uma imagem." } }, { status: 422 });
  const primaryIndex = Number(form.get("primaryIndex") ?? 0);
  if (!Number.isInteger(primaryIndex) || primaryIndex < 0 || primaryIndex >= files.length) return NextResponse.json({ success: false, error: { code: "INVALID_PRIMARY_IMAGE", message: "A foto de capa selecionada é inválida." } }, { status: 422 });
  try {
    const existing = await prisma.propertyImage.count({ where: { propertyId } });
    const images = [];
    for (const [index, file] of files.entries()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { mimeType } = validateImage(buffer, file.type);
      const uploaded = await uploadImage(propertyId, buffer, mimeType);
      try {
        const image = await prisma.propertyImage.create({ data: { propertyId, ...uploaded, originalFilename: file.name.slice(0, 255), mimeType, size: buffer.length, isPrimary: existing === 0 && index === primaryIndex, sortOrder: existing + index } });
        images.push({ ...image, size: image.size.toString() });
      } catch (error) {
        await deleteImageObject(uploaded.bucket, uploaded.objectKey).catch(() => undefined);
        throw error;
      }
    }
    return NextResponse.json({ data: images }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: error instanceof Error ? error.message : "IMAGE_UPLOAD_FAILED", message: "Não foi possível enviar as imagens." } }, { status: 422 });
  }
}
