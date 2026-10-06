# Plataforma imobiliária

Projeto especificado em [docs/SPEC-DRIVEN-DEVELOPMENT.md](docs/SPEC-DRIVEN-DEVELOPMENT.md) a partir de [docs/spec.md](docs/spec.md). Estado atual: bootstrap Next.js com página inicial provisória e health check; funcionalidades imobiliárias, banco e autenticação ainda pendentes.

Stack planejada: Next.js App Router, TypeScript, Prisma, PostgreSQL, MinIO, Docker e EasyPanel. UI responsiva em pt-BR.

## Para desenvolver

Pré-requisitos: Node 22.13+ e npm 10+, Docker Compose. Copie `.env.example` para `.env.local` e preencha segredos próprios. Para o Compose, copie também os valores `POSTGRES_*` e `MINIO_*` para um arquivo `.env` local (ignorado pelo Git). O servidor Next.js já pode ser iniciado, mas ainda não há banco, anúncios ou autenticação.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
docker compose up --build
```

O Compose requer `POSTGRES_PASSWORD`, `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`. Para PostgreSQL remoto, defina `DATABASE_URL` somente em `.env` (ignorado pelo Git). Nunca coloque credenciais reais em `.env.example`.

```bash
npm run db:generate
npm run db:status
npm run db:migrate
```

A migration inicial está em `prisma/migrations/20261006000000_init`. `db:migrate` altera o banco apontado por `DATABASE_URL`: confira o destino antes de executar. O banco remoto informado em 06/10/2026 recebeu essa migration e está sincronizado. Seed e bootstrap do primeiro ADMIN serão adicionados na Fase 5. O servidor Next.js ainda não oferece funcionalidades imobiliárias.

O Next.js pode copiar arquivos `.env` para a saída local `.next/standalone`; essa pasta é ignorada pelo Git. O Dockerfile remove essas cópias antes de montar a imagem final. Não publique a pasta `.next/standalone` manualmente sem conferir seu conteúdo.

## Seed e primeiro administrador

O seed exige um número padrão de WhatsApp válido e é idempotente:

```bash
DEFAULT_WHATSAPP_NUMBER=5511999999999 npm run db:seed
```

O primeiro administrador só é criado se não houver ADMIN ativo. Defina as três variáveis somente no terminal, execute o comando e descarte a senha da sessão:

```bash
ADMIN_NAME="Nome" ADMIN_EMAIL="admin@empresa.com" ADMIN_PASSWORD="uma-senha-forte-com-8-ou-mais" npm run admin:bootstrap
```

Consulte [checklist](docs/DEVELOPMENT-CHECKLIST.md) para progresso, [arquitetura](docs/ARCHITECTURE.md), [banco](docs/DATABASE.md), [API](docs/API.md), [segurança](docs/SECURITY.md) e [deploy](docs/DEPLOYMENT.md). Testes previstos: unitários de regras, integração com PostgreSQL/MinIO e E2E com Playwright. Build/deploy só após as fases correspondentes.
