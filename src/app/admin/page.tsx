import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";

export default async function AdminPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  return <main className="home"><p className="eyebrow">Administração</p><h1>Painel administrativo</h1><p>Sessão protegida no servidor. A gestão de imóveis será adicionada nas próximas fases.</p></main>;
}
