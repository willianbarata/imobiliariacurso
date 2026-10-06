import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPropertiesPage() {
  if (!(await requireUser())) redirect("/login");
  const properties = await prisma.property.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, select: { id: true, code: true, title: true, status: true, publicationState: true } });
  return <main className="admin-shell"><Link className="back-link" href="/admin">← Voltar ao painel</Link><header><div><p className="eyebrow">Administração</p><h1>Imóveis</h1></div><Link href="/admin/imoveis/novo">Novo imóvel</Link></header>{properties.length ? <div className="admin-list">{properties.map((property) => <article key={property.id}><div><strong>{property.title}</strong><span>{property.code} · {property.status} · {property.publicationState}</span></div><Link href={`/admin/imoveis/${property.id}/editar`}>Editar</Link></article>)}</div> : <div className="empty-state"><h2>Nenhum imóvel cadastrado</h2><Link href="/admin/imoveis/novo">Cadastrar o primeiro imóvel</Link></div>}</main>;
}
