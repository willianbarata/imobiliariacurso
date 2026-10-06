"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="page-shell empty-state"><h1>Não foi possível carregar esta página</h1><p>Tente novamente em alguns instantes.</p><button type="button" onClick={reset}>Tentar novamente</button></main>; }
