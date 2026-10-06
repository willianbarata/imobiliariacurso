import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Viver Bem Imóveis", template: "%s | Viver Bem Imóveis" },
  description: "Encontre imóveis para venda e aluguel.",
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "pt_BR", siteName: "Viver Bem Imóveis", title: "Viver Bem Imóveis", description: "Encontre imóveis para venda e aluguel." },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
