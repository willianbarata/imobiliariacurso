import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  if (!(await requireUser("ADMIN"))) redirect("/login");
  return <main className="admin-shell"><Link className="back-link" href="/admin/usuarios">← Voltar para usuários</Link><p className="eyebrow">Administração</p><h1>Incluir usuário</h1><UserForm /></main>;
}
