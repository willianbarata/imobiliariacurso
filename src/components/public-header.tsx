import Link from "next/link";
export function PublicHeader() { return <header className="site-header"><Link className="brand" href="/">Viver Bem<span> Imóveis</span></Link><nav aria-label="Navegação principal"><Link href="/imoveis?status=FOR_SALE">Comprar</Link><Link href="/imoveis?status=FOR_RENT">Alugar</Link><Link href="/login">Área administrativa</Link></nav></header>; }
