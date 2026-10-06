import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicPropertyBySlug } from "@/features/properties/public-property-query";

type PageProps = { params: Promise<{ slug: string }> };
export default async function PropertyPage({ params }: PageProps) {
  const property = await getPublicPropertyBySlug((await params).slug);
  if (!property) notFound();
  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(property.price));
  const purpose = property.status === "FOR_SALE" ? "Venda" : "Aluguel";
  const message = `Olá! Tenho interesse neste imóvel.\n\nCódigo: ${property.code}\nImóvel: ${property.title}\nFinalidade: ${purpose}\nValor: ${price}\n\nRegião: ${property.neighborhood}, ${property.city} - ${property.state}\n\nGostaria de mais informações.`;
  const whatsappHref = `https://wa.me/${property.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return <><PublicHeader /><main className="page-shell property-detail"><Link className="back-link" href="/imoveis">← Voltar para imóveis</Link><div className="gallery-placeholder" aria-label={`${property.images.length} foto(s) do imóvel`}>{property.images.length ? `${property.images.length} foto(s) cadastrada(s)` : "Fotos em breve"}</div><div className="detail-grid"><article><p className="eyebrow">{purpose} · {property.category.name}</p><h1>{property.title}</h1><p className="property-code">{property.code}</p><p className="description">{property.description}</p><h2>Região</h2><p>{property.neighborhood}, {property.city} - {property.state}</p></article><aside className="contact-card"><strong>{price}</strong><span>{purpose}</span><a href={whatsappHref} target="_blank" rel="noreferrer">Tenho interesse</a></aside></div></main><PublicFooter /></>;
}
