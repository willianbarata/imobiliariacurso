import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { AdminActions } from "@/components/admin-actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser(); if (!user) redirect("/login");
  return <div className="admin-app"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><span className="admin-brand-mark">⌂</span><span>VIBE<small>IMOBILIÁRIA</small></span></Link><nav aria-label="Navegação administrativa"><Link href="/admin">⌂ <span>Dashboard</span></Link><Link href="/admin/imoveis">▥ <span>Imóveis</span></Link><Link href="/admin/imoveis/novo">⊕ <span>Novo imóvel</span></Link>{user.role === "ADMIN" && <><Link href="/admin/usuarios">♧ <span>Usuários</span></Link><Link href="/admin/configuracoes">⚙ <span>Configurações</span></Link></>}</nav><p>IMÓVEIS<br />EXTRAORDINÁRIOS<br />PARA NOVAS<br />HISTÓRIAS</p><AdminActions /></aside><div className="admin-workspace"><header className="admin-topbar"><label><span aria-hidden="true">⌕</span><input placeholder="Buscar imóveis, usuários..." aria-label="Busca administrativa" /></label><div><span className="admin-bell" aria-label="Notificações">♧</span><b>{user.name.slice(0, 2).toUpperCase()}</b><strong>{user.role === "ADMIN" ? "Administrador" : "Usuário"}</strong></div></header>{children}</div></div>;
}
