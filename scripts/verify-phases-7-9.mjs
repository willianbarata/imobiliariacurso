import { hash } from "@node-rs/argon2";
import { PrismaClient, PropertyStatus, PublicationState, Role } from "@prisma/client";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3011";
const testEmail = "phase7-test@invalid.local";
const testPassword = "Phase7#test";
const prefix = "TSTP9-";
const prisma = new PrismaClient();

function cookieHeader(response) {
  return response.headers.getSetCookie().map((cookie) => cookie.split(";", 1)[0]).join("; ");
}

async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error(`Login falhou: ${response.status}`);
  return cookieHeader(response);
}

try {
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "willianbarata@gmail.com" } });
  const category = await prisma.category.findFirstOrThrow();
  await prisma.user.upsert({ where: { email: testEmail }, update: { active: true, role: Role.USER }, create: { name: "Teste de autorização", email: testEmail, passwordHash: await hash(testPassword, { algorithm: 2, memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 }), role: Role.USER } });
  const propertyData = { title: "Imóvel de teste", description: "Registro temporário de validação.", price: "100000.00", categoryId: category.id, zipCode: "01001000", street: "Rua Teste", number: "1", neighborhood: "Centro", city: "São Paulo", state: "SP", whatsappNumber: "5511999999999", createdBy: admin.id, updatedBy: admin.id };
  await prisma.property.createMany({ data: [
    { ...propertyData, code: `${prefix}SALE`, slug: "test-auto-phase-sale", status: PropertyStatus.FOR_SALE, publicationState: PublicationState.PUBLISHED },
    { ...propertyData, code: `${prefix}SOLD`, slug: "test-auto-phase-sold", status: PropertyStatus.SOLD, publicationState: PublicationState.PUBLISHED },
    { ...propertyData, code: `${prefix}RENTED`, slug: "test-auto-phase-rented", status: PropertyStatus.RENTED, publicationState: PublicationState.PUBLISHED },
    { ...propertyData, code: `${prefix}DRAFT`, slug: "test-auto-phase-draft", status: PropertyStatus.FOR_RENT, publicationState: PublicationState.DRAFT },
  ] });
  const adminCookie = await login("willianbarata@gmail.com", "Will#2026");
  const userCookie = await login(testEmail, testPassword);
  const [adminResponse, userResponse, listResponse, soldResponse, rentedResponse, draftResponse, homeResponse] = await Promise.all([
    fetch(`${baseUrl}/api/admin/session`, { headers: { cookie: adminCookie } }), fetch(`${baseUrl}/api/admin/session`, { headers: { cookie: userCookie } }), fetch(`${baseUrl}/api/properties?q=${prefix}`), fetch(`${baseUrl}/api/properties/test-auto-phase-sold`), fetch(`${baseUrl}/api/properties/test-auto-phase-rented`), fetch(`${baseUrl}/api/properties/test-auto-phase-draft`), fetch(baseUrl),
  ]);
  const list = await listResponse.json();
  const home = await homeResponse.text();
  if (adminResponse.status !== 200 || userResponse.status !== 403 || list.data.length !== 1 || list.data[0].code !== `${prefix}SALE` || soldResponse.status !== 404 || rentedResponse.status !== 404 || draftResponse.status !== 404 || !home.includes("Imóvel de teste")) throw new Error("Uma regra de autorização, visibilidade ou home falhou.");
  console.log("Fases 7 e 9 verificadas: RBAC e visibilidade pública aprovados.");
} finally {
  await prisma.property.deleteMany({ where: { code: { startsWith: prefix } } });
  const user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (user) { await prisma.refreshSession.deleteMany({ where: { userId: user.id } }); await prisma.user.delete({ where: { id: user.id } }); }
  await prisma.$disconnect();
}
