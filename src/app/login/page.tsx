"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
    setLoading(false);
    if (!response.ok) {
      setMessage("Email ou senha inválidos.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return <main className="auth-page"><form className="auth-form" onSubmit={handleSubmit}><p className="eyebrow">Administração</p><h1>Entrar</h1><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /><button type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>{message && <p role="alert">{message}</p>}</form></main>;
}
