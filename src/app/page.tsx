import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { listPublicProperties, parsePublicPropertyQuery } from "@/features/properties/public-property-query";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await listPublicProperties(parsePublicPropertyQuery({})!);
  return <><PublicHeader /><main className="home"><section className="hero"><p className="eyebrow">Seu próximo endereço começa aqui</p><h1>Espaços para viver bem.</h1><p>Imóveis selecionados para venda e aluguel, com uma busca simples e transparente.</p><form className="hero-search" action="/imoveis"><input name="q" placeholder="O que você procura?" aria-label="Buscar imóveis" /><button type="submit">Encontrar imóveis</button></form><div className="hero-links"><Link href="/imoveis?status=FOR_SALE">Quero comprar</Link><Link href="/imoveis?status=FOR_RENT">Quero alugar</Link></div></section><section className="home-listing"><div><p className="eyebrow">Disponíveis agora</p><h2>Imóveis em destaque</h2></div>{properties.data.length ? <div className="property-grid">{properties.data.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><h2>Novos imóveis em breve</h2><p>Use a busca para acompanhar as próximas oportunidades.</p></div>}<Link className="view-all" href="/imoveis">Ver todos os imóveis</Link></section></main><PublicFooter /></>;
}
