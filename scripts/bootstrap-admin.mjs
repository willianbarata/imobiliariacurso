import { hash } from "@node-rs/argon2";
import { PrismaClient, Role } from "@prisma/client";

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password) {
  throw new Error("Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD somente para esta execução.");
}

if (name.length > 160 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
  throw new Error("Nome, email ou senha inválidos. A senha deve ter ao menos 8 caracteres.");
}

const prisma = new PrismaClient();

try {
  const admins = await prisma.user.count({ where: { role: Role.ADMIN, active: true } });
  if (admins > 0) {
    throw new Error("Já existe ADMIN ativo. Use a gestão de usuários para criar outros administradores.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("O email informado já está em uso.");

  const passwordHash = await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await prisma.user.create({
    data: { name, email, passwordHash, role: Role.ADMIN },
  });
  console.log("Primeiro administrador criado.");
} finally {
  await prisma.$disconnect();
}
