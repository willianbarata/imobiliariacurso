import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/property-form";
import { PropertyFormTips } from "@/components/property-form-tips";

export default async function NewPropertyPage() {
  if (!(await requireUser())) redirect("/login");
  const [categories, settings] = await Promise.all([prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), prisma.systemSettings.findUnique({ where: { id: 1 }, select: { defaultWhatsappNumber: true } })]);
  return <main className="admin-shell admin-modern"><Link className="back-link" href="/admin/imoveis">← Voltar para imóveis</Link><p className="eyebrow">Administração</p><h1>Novo imóvel</h1><p className="admin-page-description">Cadastre um novo imóvel com informações completas e fotos.</p><div className="admin-form-layout"><PropertyForm categories={categories} defaultWhatsappNumber={settings?.defaultWhatsappNumber ?? ""} /><PropertyFormTips /></div></main>;
}
