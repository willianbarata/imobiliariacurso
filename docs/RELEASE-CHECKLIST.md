# Checklist de release

## Antes do deploy

1. Configure no EasyPanel as variáveis DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET, MINIO_USE_SSL, APP_URL, DEFAULT_WHATSAPP_NUMBER e NODE_ENV=production.
2. Garanta uma conta MinIO exclusiva da aplicação, limitada ao bucket da aplicação.
3. Garanta PostgreSQL protegido por TLS ou por rede privada.
4. Execute lint, typecheck e build.

## Publicação

1. Execute a migration como job único com a mesma imagem e as mesmas variáveis da aplicação.
2. Suba a aplicação Docker standalone.
3. Configure readiness para GET /api/health. A rota retorna 200 somente se o PostgreSQL estiver disponível.
4. Execute o smoke test com APP_URL apontando ao domínio HTTPS publicado.
5. Verifique login, criação de rascunho, upload, publicação, busca, carrossel e CTA do WhatsApp.

## Operação contínua

1. Mantenha backup automatizado de PostgreSQL e MinIO.
2. Execute e registre uma restauração de teste.
3. Rotacione segredos conforme política operacional.
4. Revise CSP, logs e dependências a cada release.

## Estado conhecido

O código implementa headers de segurança, cookies HttpOnly/SameSite, validação de Origin, RBAC, Zod, readiness, robots, sitemap e metadata. Rate limit distribuído, backup/restauração, TLS ou rede privada para PostgreSQL, credenciais MinIO de menor privilégio e validação do EasyPanel dependem da configuração do ambiente.
