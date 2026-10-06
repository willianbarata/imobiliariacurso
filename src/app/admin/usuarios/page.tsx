import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function UsersPage({ searchParams }: PageProps) {
  const user = await requireUser("ADMIN"); if (!user) redirect("/login");
  const qValue = (await searchParams).q; const q = typeof qValue === "string" ? qValue.trim() : "";
  const users = await prisma.user.findMany({ where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, active: true } });
  return <main className="admin-shell admin-modern"><Link className="back-link" href="/admin">← Voltar ao painel</Link><header className="admin-page-heading"><div><p className="eyebrow">Administração</p><h1>Usuários</h1><p>Gerencie acessos e permissões da equipe.</p></div><Link href="/admin/usuarios/novo">＋ Incluir usuário</Link></header><form className="admin-filter-panel admin-user-search" action="/admin/usuarios"><input name="q" defaultValue={q} placeholder="Buscar por nome ou email" aria-label="Buscar usuários" /><button type="submit">Buscar</button></form><section className="admin-table-section"><h2>{users.length} {users.length === 1 ? "usuário encontrado" : "usuários encontrados"}</h2><div className="admin-table"><div className="admin-table-head user-table"><span>Usuário</span><span>Email</span><span>Perfil</span><span>Status</span><span>Ações</span></div>{users.map((item) => <article className="user-table" key={item.id}><strong>{item.name}</strong><span>{item.email}</span><span>{item.role === "ADMIN" ? "Administrador" : "Usuário"}</span><span><b className={item.active ? "status-public" : "status-draft"}>{item.active ? "Ativo" : "Inativo"}</b></span><Link href={"/admin/usuarios/" + item.id + "/editar"}>Editar</Link></article>)}</div></section></main>;
}
