import { PrismaClient, PropertyStatus, PublicationState } from "@prisma/client";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3011";
const code = "TSTIMG-001";
const prisma = new PrismaClient();
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLz8QAAAABJRU5ErkJggg==", "base64");
const storage = new S3Client({ region: "us-east-1", endpoint: `https://${process.env.MINIO_ENDPOINT}:443`, forcePathStyle: true, credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY, secretAccessKey: process.env.MINIO_SECRET_KEY } });
function cookieHeader(response) { return response.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; "); }
async function cleanup() { const properties = await prisma.property.findMany({ where: { code }, include: { images: true } }); for (const property of properties) { for (const image of property.images) await storage.send(new DeleteObjectCommand({ Bucket: image.bucket, Key: image.objectKey })).catch(() => undefined); await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } }); } await prisma.property.deleteMany({ where: { code } }); }
try {
  await cleanup();
  const [admin, category] = await Promise.all([prisma.user.findUniqueOrThrow({ where: { email: "willianbarata@gmail.com" } }), prisma.category.findFirstOrThrow()]);
  const property = await prisma.property.create({ data: { code, slug: "teste-imagem-fluxo", title: "Teste de imagem", description: "Registro temporário para testar MinIO.", price: "100", status: PropertyStatus.FOR_SALE, publicationState: PublicationState.DRAFT, categoryId: category.id, zipCode: "01001000", street: "Praca da Se", number: "1", neighborhood: "Se", city: "Sao Paulo", state: "SP", whatsappNumber: "5511999999999", createdBy: admin.id, updatedBy: admin.id } });
  const login = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "willianbarata@gmail.com", password: "Will#2026" }) });
  if (!login.ok) throw new Error("Login de teste falhou.");
  const cookie = cookieHeader(login);
  const form = new FormData(); form.append("files", new File([png], "teste-1.png", { type: "image/png" })); form.append("files", new File([png], "teste-2.png", { type: "image/png" }));
  const upload = await fetch(`${baseUrl}/api/admin/properties/${property.id}/images`, { method: "POST", headers: { cookie }, body: form });
  if (upload.status !== 201) throw new Error(`Upload falhou: ${upload.status} ${await upload.text()}`);
  const images = (await upload.json()).data;
  if (images.length !== 2 || !images[0].isPrimary) throw new Error("Upload múltiplo não definiu a imagem principal.");
  const image = images[0];
  if ((await fetch(`${baseUrl}/api/images/${image.id}`, { redirect: "manual" })).status !== 404) throw new Error("Imagem de rascunho foi exposta.");
  await prisma.property.update({ where: { id: property.id }, data: { publicationState: PublicationState.PUBLISHED } });
  const publicAccess = await fetch(`${baseUrl}/api/images/${image.id}`, { redirect: "manual" });
  if (publicAccess.status !== 307 || !publicAccess.headers.get("location")?.includes("X-Amz-Signature")) throw new Error("URL assinada não foi criada.");
  const reorder = await fetch(`${baseUrl}/api/admin/properties/${property.id}/images/order`, { method: "PUT", headers: { cookie, "content-type": "application/json" }, body: JSON.stringify({ imageIds: [images[1].id, image.id], primaryImageId: images[1].id }) });
  const removed = await fetch(`${baseUrl}/api/admin/properties/${property.id}/images/${images[1].id}`, { method: "DELETE", headers: { cookie } });
  const remaining = await prisma.propertyImage.findMany({ where: { propertyId: property.id } });
  const blockedLastDeletion = await fetch(`${baseUrl}/api/admin/properties/${property.id}/images/${remaining[0].id}`, { method: "DELETE", headers: { cookie } });
  if (!reorder.ok || !removed.ok || remaining.length !== 1 || !remaining[0].isPrimary || blockedLastDeletion.status !== 422) throw new Error("Ordenação, principal ou exclusão falhou.");
  console.log("MinIO: upload, URL assinada, principal, ordenação e exclusão aprovados.");
} finally { await cleanup(); await prisma.$disconnect(); }
