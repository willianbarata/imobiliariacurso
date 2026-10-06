import { Prisma, PublicationState } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PropertyInput } from "@/schemas/property";

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
async function nextCode(tx: Prisma.TransactionClient) { const rows = await tx.$queryRaw<{ value: bigint }[]>`SELECT nextval('property_code_seq') AS value`; return `IMO-${String(rows[0].value).padStart(6, "0")}`; }
async function ensurePublishable(tx: Prisma.TransactionClient, propertyId: string, state: PublicationState) { if (state !== PublicationState.PUBLISHED) return; const image = await tx.propertyImage.findFirst({ where: { propertyId, isPrimary: true } }); if (!image) throw new Error("PUBLICATION_REQUIRES_PRIMARY_IMAGE"); }

export async function createProperty(input: PropertyInput, actorId: string) {
  return prisma.$transaction(async (tx) => { const code = await nextCode(tx); const slug = `${slugify(input.title)}-${code.toLowerCase()}`; const property = await tx.property.create({ data: { ...input, price: input.price, code, slug, createdBy: actorId, updatedBy: actorId } }); await ensurePublishable(tx, property.id, input.publicationState); return property; });
}
export async function updateProperty(id: string, input: PropertyInput, actorId: string) { return prisma.$transaction(async (tx) => { const current = await tx.property.findFirst({ where: { id, deletedAt: null } }); if (!current) return null; await ensurePublishable(tx, id, input.publicationState); return tx.property.update({ where: { id }, data: { ...input, price: input.price, updatedBy: actorId } }); }); }
export async function softDeleteProperty(id: string, actorId: string) { const result = await prisma.property.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), updatedBy: actorId } }); return result.count === 1; }
