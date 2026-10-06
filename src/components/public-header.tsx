"use client";

import Link from "next/link";
import { useState } from "react";

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="site-header"><Link className="brand" href="/" onClick={close}>Viver Bem<span> Imóveis</span></Link><button className="menu-toggle" type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-controls="public-navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span /><span /><span /></button><nav id="public-navigation" className={open ? "is-open" : ""} aria-label="Navegação principal"><Link href="/imoveis?status=FOR_SALE" onClick={close}>Comprar</Link><Link href="/imoveis?status=FOR_RENT" onClick={close}>Alugar</Link><Link href="/login" onClick={close}>Área administrativa</Link></nav></header>;
}
