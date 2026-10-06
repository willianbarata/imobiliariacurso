import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { PropertyForm } from "@/components/property-form";
import { AdminImageGallery } from "@/components/admin-image-gallery";
import { prisma } from "@/lib/prisma";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireUser())) redirect("/login");
  const id = (await params).id;
  const [categories, settings, property] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.systemSettings.findUnique({ where: { id: 1 }, select: { defaultWhatsappNumber: true } }),
    prisma.property.findFirst({ where: { id, deletedAt: null }, include: { images: { orderBy: { sortOrder: "asc" }, select: { id: true, isPrimary: true, originalFilename: true } }, _count: { select: { images: true } } } }),
  ]);
  if (!property) notFound();
  const initialProperty = { id: property.id, title: property.title, description: property.description, price: property.price.toString(), status: property.status, publicationState: property.publicationState, categoryId: property.categoryId, zipCode: property.zipCode, street: property.street, number: property.number, complement: property.complement, neighborhood: property.neighborhood, city: property.city, state: property.state, country: property.country, latitude: property.latitude?.toString() ?? null, longitude: property.longitude?.toString() ?? null, whatsappNumber: property.whatsappNumber, imageCount: property._count.images, images: property.images };
  return <main className="admin-shell"><Link className="back-link" href="/admin/imoveis">← Voltar para imóveis</Link><p className="eyebrow">Administração</p><h1>Editar imóvel</h1><PropertyForm categories={categories} defaultWhatsappNumber={settings?.defaultWhatsappNumber ?? ""} property={initialProperty} /><AdminImageGallery propertyId={property.id} images={property.images} /></main>;
}
