import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/property-form";

export default async function NewPropertyPage() {
  if (!(await requireUser())) redirect("/login");
  const [categories, settings] = await Promise.all([prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), prisma.systemSettings.findUnique({ where: { id: 1 }, select: { defaultWhatsappNumber: true } })]);
  return <main className="admin-shell admin-modern"><Link className="back-link" href="/admin/imoveis">← Voltar para imóveis</Link><p className="eyebrow">Administração</p><h1>Novo imóvel</h1><PropertyForm categories={categories} defaultWhatsappNumber={settings?.defaultWhatsappNumber ?? ""} /></main>;
}
