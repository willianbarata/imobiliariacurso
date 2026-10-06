import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireUser("ADMIN"))) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (await params).id }, select: { id: true, name: true, email: true, role: true, active: true } });
  if (!user) notFound();
  return <main className="admin-shell admin-modern"><Link className="back-link" href="/admin/usuarios">← Voltar para usuários</Link><p className="eyebrow">Administração</p><h1>Editar usuário</h1><UserForm user={user} /></main>;
}
