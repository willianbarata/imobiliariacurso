import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { listPublicProperties, parsePublicPropertyQuery } from "@/features/properties/public-property-query";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [properties, categories] = await Promise.all([
    listPublicProperties(parsePublicPropertyQuery({})!),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);
  return <div className="home-page"><section className="home-hero"><PublicHeader /><main className="home"><div className="hero-copy"><p className="hero-kicker">Imóveis extraordinários</p><h1>Encontre seu próximo imóvel</h1><p>Casas, apartamentos, terrenos e imóveis de alto padrão nas melhores regiões.</p></div><form className="home-search-panel" action="/imoveis"><div className="home-search-tabs"><span>Venda e aluguel</span><Link href="/imoveis?status=FOR_SALE">Comprar</Link><Link href="/imoveis?status=FOR_RENT">Alugar</Link></div><div className="home-search-fields"><input name="q" placeholder="Código, bairro, cidade ou imóvel" aria-label="Buscar imóveis" /><select name="category" aria-label="Categoria"><option value="">Todas as categorias</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select><input name="city" placeholder="Cidade" aria-label="Cidade" /><input name="neighborhood" placeholder="Bairro" aria-label="Bairro" /><input name="minPrice" inputMode="decimal" placeholder="Preço mínimo" aria-label="Preço mínimo" /><input name="maxPrice" inputMode="decimal" placeholder="Preço máximo" aria-label="Preço máximo" /><select name="sort" defaultValue="newest" aria-label="Ordenação"><option value="newest">Mais recentes</option><option value="price_asc">Menor preço</option><option value="price_desc">Maior preço</option></select><button type="submit">Buscar imóveis <span aria-hidden="true">→</span></button></div></form></main></section><main className="home-content"><section className="home-listing"><div className="home-listing-heading"><div><p className="hero-kicker">Imóveis em destaque</p><h2>Oportunidades exclusivas para você</h2></div><p>Selecionamos imóveis especiais nas melhores localizações, com conforto, sofisticação e qualidade.</p><Link className="outline-link" href="/imoveis">Ver todos os imóveis <span aria-hidden="true">→</span></Link></div>{properties.data.length ? <div className="property-grid">{properties.data.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><h2>Novos imóveis em breve</h2><p>Use a busca para acompanhar as próximas oportunidades.</p></div>}</section></main><PublicFooter /></div>;
}
