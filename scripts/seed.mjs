import { PrismaClient } from "@prisma/client";

const categories = [
  ["Casa", "casa"],
  ["Apartamento", "apartamento"],
  ["Comércio", "comercio"],
  ["Galpão", "galpao"],
  ["Terreno", "terreno"],
];

const defaultWhatsappNumber = process.env.DEFAULT_WHATSAPP_NUMBER?.replace(/\D/g, "");

if (!defaultWhatsappNumber || defaultWhatsappNumber.length < 10 || defaultWhatsappNumber.length > 15) {
  throw new Error("Defina DEFAULT_WHATSAPP_NUMBER com 10 a 15 dígitos antes de executar o seed.");
}

const prisma = new PrismaClient();

try {
  await prisma.$transaction([
    ...categories.map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        create: { name, slug },
        update: { name },
      }),
    ),
    prisma.systemSettings.upsert({
      where: { id: 1 },
      create: { id: 1, defaultWhatsappNumber },
      update: {},
    }),
  ]);
  console.log("Categorias e configurações iniciais aplicadas.");
} finally {
  await prisma.$disconnect();
}
