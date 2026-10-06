import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const properties = await prisma.property.findMany({ where: { deletedAt: null, publicationState: "PUBLISHED", status: { in: ["FOR_SALE", "FOR_RENT"] } }, select: { slug: true, updatedAt: true } });
  return [{ url: base, lastModified: new Date() }, { url: base + "/imoveis", lastModified: new Date() }, ...properties.map((property) => ({ url: base + "/imoveis/" + property.slug, lastModified: property.updatedAt }))];
}
