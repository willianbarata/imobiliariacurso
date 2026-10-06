import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { PropertyCard } from "@/components/property-card";
import { listPublicProperties, parsePublicPropertyQuery } from "@/features/properties/public-property-query";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function PropertiesPage({ searchParams }: PageProps) {
  const query = parsePublicPropertyQuery(await searchParams) ?? parsePublicPropertyQuery({})!;
  const result = await listPublicProperties(query);
  return <><PublicHeader /><main className="page-shell"><section className="listing-heading"><p className="eyebrow">Imóveis disponíveis</p><h1>Encontre seu próximo endereço</h1><form className="search-form" action="/imoveis"><input name="q" defaultValue={query.q} placeholder="Código, bairro, cidade ou imóvel" aria-label="Buscar imóveis" /><button type="submit">Buscar</button></form></section><section aria-live="polite"><p className="result-count">{result.pagination.total} imóvel(is) encontrado(s)</p>{result.data.length ? <div className="property-grid">{result.data.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><h2>Nenhum imóvel encontrado</h2><p>Tente ajustar sua busca ou veja todos os imóveis disponíveis.</p><Link href="/imoveis">Limpar filtros</Link></div>}</section></main><PublicFooter /></>;
}
