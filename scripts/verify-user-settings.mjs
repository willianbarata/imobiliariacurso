import { PrismaClient } from "@prisma/client";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3011";
const email = "phase20-test@invalid.local";
const prisma = new PrismaClient();
const cookieHeader = (response) => response.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ");
async function login(loginEmail, password) { const response = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: loginEmail, password }) }); if (!response.ok) throw new Error(`Login falhou: ${response.status}`); return cookieHeader(response); }
try {
  const adminCookie = await login("willianbarata@gmail.com", "Will#2026");
  const settings = await fetch(`${baseUrl}/api/admin/settings`, { headers: { cookie: adminCookie } });
  const settingsData = (await settings.json()).data;
  const updateSettings = await fetch(`${baseUrl}/api/admin/settings`, { method: "PUT", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ defaultWhatsappNumber: settingsData.defaultWhatsappNumber }) });
  const create = await fetch(`${baseUrl}/api/admin/users`, { method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ name: "Teste Fase 20", email, password: "Phase20#test", role: "USER" }) });
  if (create.status !== 201 || !updateSettings.ok) throw new Error("Criação de usuário ou configuração falhou.");
  const user = (await create.json()).data;
  const userCookie = await login(email, "Phase20#test");
  const [usersDenied, settingsDenied] = await Promise.all([fetch(`${baseUrl}/api/admin/users`, { headers: { cookie: userCookie } }), fetch(`${baseUrl}/api/admin/settings`, { headers: { cookie: userCookie } })]);
  const disabled = await fetch(`${baseUrl}/api/admin/users/${user.id}`, { method: "PUT", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ name: user.name, email: user.email, role: "USER", active: false }) });
  const revoked = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie: userCookie } });
  if (usersDenied.status !== 403 || settingsDenied.status !== 403 || !disabled.ok || revoked.status !== 401) throw new Error("RBAC ou revogação falhou.");
  console.log("Usuários, configurações, RBAC e revogação aprovados.");
} finally { const user = await prisma.user.findUnique({ where: { email } }); if (user) { await prisma.refreshSession.deleteMany({ where: { userId: user.id } }); await prisma.user.delete({ where: { id: user.id } }); } await prisma.$disconnect(); }
