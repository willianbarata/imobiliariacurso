import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/auth/authorization";
import { deleteImageObject, imageUrl } from "@/services/storage-service";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const auth = await requireApiUser(); if ("response" in auth) return auth.response;
  const { id: propertyId, imageId } = await params;
  const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId, property: { deletedAt: null } }, select: { bucket: true, objectKey: true } });
  if (!image) return NextResponse.json({ success: false, error: { code: "IMAGE_NOT_FOUND", message: "Imagem não encontrada." } }, { status: 404 });
  return NextResponse.redirect(await imageUrl(image.bucket, image.objectKey));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const auth = await requireApiUser(); if ("response" in auth) return auth.response;
  const { id: propertyId, imageId } = await params;
  const [image, property] = await Promise.all([prisma.propertyImage.findFirst({ where: { id: imageId, propertyId } }), prisma.property.findUnique({ where: { id: propertyId }, select: { publicationState: true } })]);
  if (!image || !property) return NextResponse.json({ success: false, error: { code: "IMAGE_NOT_FOUND", message: "Imagem não encontrada." } }, { status: 404 });
  const remaining = await prisma.propertyImage.count({ where: { propertyId } });
  if (property.publicationState === "PUBLISHED" && remaining === 1) return NextResponse.json({ success: false, error: { code: "PUBLISHED_PROPERTY_REQUIRES_IMAGE", message: "Um imóvel publicado precisa manter uma imagem." } }, { status: 422 });
  if (image.isPrimary && remaining > 1) { const next = await prisma.propertyImage.findFirst({ where: { propertyId, id: { not: image.id } }, orderBy: { sortOrder: "asc" } }); await prisma.$transaction([prisma.propertyImage.update({ where: { id: image.id }, data: { isPrimary: false } }), prisma.propertyImage.update({ where: { id: next!.id }, data: { isPrimary: true } }), prisma.propertyImage.delete({ where: { id: image.id } })]); } else await prisma.propertyImage.delete({ where: { id: image.id } });
  await deleteImageObject(image.bucket, image.objectKey).catch(() => undefined);
  return NextResponse.json({ success: true });
}
