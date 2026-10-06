"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActions() {
  const router = useRouter(); const [leaving, setLeaving] = useState(false);
  async function logout() { setLeaving(true); try { await fetch("/api/auth/logout", { method: "POST" }); } finally { router.replace("/"); router.refresh(); } }
  return <div className="admin-actions"><Link href="/">Ver site</Link><button type="button" onClick={logout} disabled={leaving}>{leaving ? "Saindo…" : "Sair"}</button></div>;
}
