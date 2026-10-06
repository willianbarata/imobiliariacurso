import { Prisma, PropertyStatus, PublicationState } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const pageSize = 12;
const blankToUndefined = (value: unknown) => value === "" || value === undefined ? undefined : value;
const optionalText = z.preprocess(blankToUndefined, z.string().trim().max(120).optional().transform((value) => value || undefined));
const optionalNumber = z.preprocess(blankToUndefined, z.coerce.number().positive().optional());

export const publicPropertyQuerySchema = z.object({
  q: optionalText,
  status: z.preprocess(blankToUndefined, z.enum(["FOR_SALE", "FOR_RENT"]).optional()), category: optionalText, city: optionalText, neighborhood: optionalText,
  minPrice: optionalNumber, maxPrice: optionalNumber,
  sort: z.preprocess(blankToUndefined, z.enum(["newest", "price_asc", "price_desc"]).default("newest")), page: z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(1)),
});
export type PublicPropertyQuery = z.infer<typeof publicPropertyQuerySchema>;
export function parsePublicPropertyQuery(input: Record<string, string | string[] | undefined>) {
  const parsed = publicPropertyQuerySchema.safeParse(input);
  return !parsed.success || (parsed.data.minPrice && parsed.data.maxPrice && parsed.data.minPrice > parsed.data.maxPrice) ? null : parsed.data;
}
export async function listPublicProperties(query: PublicPropertyQuery) {
  const where: Prisma.PropertyWhereInput = {
    deletedAt: null, publicationState: PublicationState.PUBLISHED,
    status: query.status ? query.status as PropertyStatus : { in: [PropertyStatus.FOR_SALE, PropertyStatus.FOR_RENT] },
    ...(query.category ? { category: { slug: query.category } } : {}), ...(query.city ? { city: { contains: query.city, mode: "insensitive" } } : {}), ...(query.neighborhood ? { neighborhood: { contains: query.neighborhood, mode: "insensitive" } } : {}),
    ...(query.minPrice || query.maxPrice ? { price: { ...(query.minPrice ? { gte: query.minPrice } : {}), ...(query.maxPrice ? { lte: query.maxPrice } : {}) } } : {}),
    ...(query.q ? { OR: [{ code: { contains: query.q, mode: "insensitive" } }, { title: { contains: query.q, mode: "insensitive" } }, { city: { contains: query.q, mode: "insensitive" } }, { neighborhood: { contains: query.q, mode: "insensitive" } }] } : {}),
  };
  const orderBy: Prisma.PropertyOrderByWithRelationInput = query.sort === "price_asc" ? { price: "asc" } : query.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };
  const [total, properties] = await prisma.$transaction([prisma.property.count({ where }), prisma.property.findMany({ where, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * pageSize, take: pageSize, include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true }, select: { id: true, objectKey: true, bucket: true, mimeType: true } } } })]);
  return { data: properties.map((property) => ({ id: property.id, code: property.code, slug: property.slug, title: property.title, price: property.price.toFixed(2), status: property.status, neighborhood: property.neighborhood, city: property.city, state: property.state, category: property.category, primaryImage: property.images[0] ?? null })), pagination: { page: query.page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function getPublicPropertyBySlug(slug: string) {
  const property = await prisma.property.findFirst({
    where: { slug, deletedAt: null, publicationState: PublicationState.PUBLISHED, status: { in: [PropertyStatus.FOR_SALE, PropertyStatus.FOR_RENT] } },
    include: { category: { select: { name: true } }, images: { orderBy: { sortOrder: "asc" }, select: { id: true, objectKey: true, bucket: true, mimeType: true, originalFilename: true } } },
  });
  if (!property) return null;
  return { id: property.id, code: property.code, slug: property.slug, title: property.title, description: property.description, price: property.price.toFixed(2), status: property.status, neighborhood: property.neighborhood, city: property.city, state: property.state, category: property.category, whatsappNumber: property.whatsappNumber, images: property.images };
}
