import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActions } from "@/components/admin-actions";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await requireUser(); if (!user) redirect("/login");
  const groups = await prisma.property.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } });
  const count = (status: string) => groups.find((item) => item.status === status)?._count._all ?? 0;
  return <main className="admin-shell"><header><div><p className="eyebrow">Administração</p><h1>Painel</h1></div><div className="admin-header-actions"><Link className="admin-link" href="/admin/imoveis/novo">Cadastrar imóvel</Link><AdminActions /></div></header><section className="stat-grid"><article><span>À venda</span><strong>{count("FOR_SALE")}</strong></article><article><span>Para aluguel</span><strong>{count("FOR_RENT")}</strong></article><article><span>Vendidos</span><strong>{count("SOLD")}</strong></article><article><span>Alugados</span><strong>{count("RENTED")}</strong></article></section><div className="hero-links"><Link href="/admin/imoveis">Gerenciar imóveis</Link>{user.role === "ADMIN" && <><Link href="/admin/usuarios">Usuários</Link><Link href="/admin/configuracoes">Configurações</Link></>}</div></main>;
}
