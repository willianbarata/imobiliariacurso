"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = { id?: string; name?: string; email?: string; role?: "ADMIN" | "USER"; active?: boolean };
export function UserForm({ user }: { user?: UserData }) {
  const router = useRouter(); const editing = Boolean(user?.id);
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const data: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    if (editing) {
      data.active = data.active === "on";
      if (!data.password) delete data.password;
    }
    try {
      const response = await fetch(editing ? `/api/admin/users/${user!.id}` : "/api/admin/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar o usuário.");
      router.push("/admin/usuarios"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar o usuário."); }
    finally { setLoading(false); }
  }
  return <form className="property-form" onSubmit={submit} aria-busy={loading}><section><h2>{editing ? "Dados do usuário" : "Novo usuário"}</h2><label>Nome<input name="name" defaultValue={user?.name} required disabled={loading} /></label><label>Email<input name="email" type="email" defaultValue={user?.email} required disabled={loading} /></label><label>Perfil<select name="role" defaultValue={user?.role ?? "USER"} disabled={loading}><option value="USER">Usuário</option><option value="ADMIN">Administrador</option></select></label>{editing && <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={user?.active} disabled={loading} /> Usuário ativo</label>}<label>Senha {editing && <small>Deixe em branco para manter a senha atual.</small>}<input name="password" type="password" minLength={8} required={!editing} disabled={loading} /></label></section><button type="submit" disabled={loading}>{loading ? "Salvando…" : editing ? "Salvar alterações" : "Criar usuário"}</button>{message && <p className="toast toast-error" role="alert">{message}</p>}</form>;
}
