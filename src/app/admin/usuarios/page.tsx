import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const user = await requireUser("ADMIN"); if (!user) redirect("/login");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, active: true } });
  return <main className="admin-shell"><header><div><p className="eyebrow">Administração</p><h1>Usuários</h1></div><Link href="/admin/usuarios/novo">Incluir usuário</Link></header><div className="admin-list">{users.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{item.email} · {item.role} · {item.active ? "Ativo" : "Inativo"}</span></div><Link href={`/admin/usuarios/${item.id}/editar`}>Editar</Link></article>)}</div></main>;
}
