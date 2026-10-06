# Checklist de desenvolvimento

Estado em 06/10/2026: bootstrap Next.js concluído, Prisma conectado ao PostgreSQL remoto, migration inicial aplicada e bucket MinIO remoto verificado. Execução Docker local pendente porque o daemon não está ativo. `[x]` exige evidência conforme definição de pronto da [SPEC](SPEC-DRIVEN-DEVELOPMENT.md). Em cada fase, registrar PR/commit, testes e data ao concluir. IDs conectam implementação aos critérios de aceite.

## FASE 0 — Levantamento e especificação

- [x] Ler `spec.md` e inventariar requisitos, atores e escopo.
- [x] Criar SPEC com IDs, regras, fluxos, aceite, testes e roadmap.
- [x] Documentar arquitetura, banco, API, segurança, deploy e decisões técnicas.
- [x] Criar `.env.example`, `.gitignore` e README inicial.
- [x] Revisar consistência entre documentos; pendência de endereço público registrada em DECISION-004.
- [ ] Confirmar com a imobiliária a política de endereço/coordenadas exatas antes de MAP-001.

## FASE 1 — Bootstrap do projeto

- [x] Criar Next.js App Router com TypeScript, lint, formatação e lockfile.
- [x] Configurar estrutura `src/app`, `components`, `features`, `services`, `repositories`, `auth`, `schemas`, `lib`.
- [x] Criar layout base, página de saúde e scripts de build, lint e typecheck.
- [x] Atualizar README com comandos reais.

Evidência Fase 1: `npm run lint`, `npm run typecheck` e `npm run build` concluíram com sucesso em 05/10/2026. A home é uma página inicial provisória; o layout público final permanece na Fase 8.

## FASE 2 — Docker e infraestrutura local

- [x] Criar `Dockerfile` multi-stage e `.dockerignore`.
- [x] Criar `docker-compose.yml` com app, PostgreSQL, MinIO, volumes e health checks; `docker compose config --quiet` passou com variáveis locais de teste.
- [ ] Criar bucket local, rede e dependências saudáveis; verificar persistência após reinício.

Bucket remoto `imobiliaria`: verificação autenticada `HeadBucket` passou em 06/10/2026. Isso não valida a infraestrutura Docker local.

## FASE 3 — PostgreSQL e Prisma

- [x] Configurar Prisma, conexão por ambiente e cliente singleton.
- [x] Criar e aplicar primeira migration versionada; `migrate deploy` e `migrate status` passaram no banco remoto vazio.
- [x] Registrar comandos e política de migrations no README e DATABASE.md.

Evidência Fase 3: `prisma validate`, `prisma generate`, `prisma migrate deploy`, `prisma migrate status` e consulta `Category.count()` em 06/10/2026. `npm run lint`, `npm run typecheck` e `npm run build` passaram. Limitação: o endpoint PostgreSQL remoto não aceita TLS; ver SECURITY.md e DEPLOYMENT.md. Backup/restauração permanecem para a Fase 28.

## FASE 4 — Modelagem do banco

- [x] Implementar User, Category, Property, PropertyImage, SystemSettings e RefreshSession conforme DATABASE.md.
- [x] Criar enums, FKs, constraints, índice parcial de principal e índices de consulta.
- [ ] Validar UUID, código sequencial concorrente, slug, Numeric e soft delete.
- [ ] Testar migrations e consultas com dados de exemplo.

## FASE 5 — Seeds e primeiro administrador

- [x] Criar seed idempotente de categorias e configuração inicial.
- [x] Criar CLI segura de bootstrap do primeiro ADMIN sem senha fixa.
- [ ] Testar execução repetida, credenciais inválidas e proteção do último ADMIN.

O primeiro ADMIN `willianbarata@gmail.com` foi criado em 06/10/2026 com hash Argon2id; o script não registra senha. O seed foi executado duas vezes com sucesso em 06/10/2026 e confirmou idempotência: 5 categorias e `SystemSettings.defaultWhatsappNumber=5511999999999`.

A validação automática do bloqueio a um segundo ADMIN permanece pendente: criar uma conta de teste em banco remoto foi rejeitado pela revisão de permissões, pois poderia inserir dados se a proteção falhasse.

## FASE 6 — Autenticação (AUTH-001/002)

- [x] Implementar hash Argon2id, login e mensagens sem enumeração.
- [x] Emitir access JWT 5 min e refresh opaco 7 dias em cookies seguros.
- [x] Implementar rotação, revogação, detecção de replay e logout.
- [x] Verificar usuário ativo em acesso/refresh e testar expiração.

Evidência Fase 6: login, `GET /api/auth/me`, refresh rotativo e logout retornaram 200 na instância Next.js com acesso ao PostgreSQL remoto em 06/10/2026. Segredos JWT aleatórios foram gravados apenas no `.env` ignorado pelo Git.

## FASE 7 — Autorização e roles (USER-001)

- [x] Criar guardas no servidor para ADMIN e USER.
- [x] Aplicar RBAC a Route Handlers e Server Actions.
- [ ] Testar que USER gerencia qualquer imóvel, mas não usuários/configurações.

Evidência parcial Fase 7: `GET /api/admin/session` retornou 200 para ADMIN e 403 para USER em teste controlado no PostgreSQL remoto. A permissão de USER sobre imóveis será validada quando o CRUD for implementado na Fase 15. Os dados de teste foram removidos ao final.

## FASE 8 — Layout público

- [x] Implementar identidade verde claro/branco, header, footer, home e cards.
- [x] Criar estados loading, erro e vazio e navegação mobile.
- [x] Conferir conteúdo e CTA da home em dados reais.

Evidência Fase 8: home, header, footer, busca, estados loading/erro/vazio e layout mobile foram implementados. Teste HTTP controlado confirmou que um imóvel público temporário foi renderizado na home; ele foi removido ao final.

## FASE 9 — Listagem dos imóveis (SEARCH-001)

- [x] Criar query pública que exclui SOLD, RENTED, excluídos e rascunhos.
- [x] Criar `/imoveis`, cards com imagem principal, categoria, valor, código e região.
- [x] Testar não exposição em lista e detalhe por slug.

Evidência Fase 9: teste controlado confirmou que FOR_SALE publicado aparece na lista; SOLD, RENTED e DRAFT retornaram 404 pela rota pública. Os dados temporários foram removidos ao final. `lint` e `tsc --noEmit` passaram após a implementação.

## FASE 10 — Busca, filtros e paginação (SEARCH-001/FILTER-001)

- [x] Implementar busca por código, título, cidade e bairro.
- [x] Implementar filtros finalidade, categoria, cidade, bairro e faixa de preço.
- [ ] Implementar ordem e paginação server-side com query string; testar combinações.

## FASE 11 — Detalhes do imóvel (SEARCH-001)

- [x] Criar `/imoveis/[slug]` com fotos, preço, descrição, categoria e região.
- [ ] Implementar carrossel, 404 para anúncio não elegível e layout mobile.

## FASE 12 — WhatsApp (WHATSAPP-001)

- [x] Compor mensagem com código, imóvel, finalidade, preço, região e URL.
- [x] Codificar URL, validar número e criar CTA acessível, inclusive no celular.
- [ ] Testar link e ausência de endereço privado.

## FASE 13 — Google Maps (MAP-001)

- [ ] Resolver DECISION-004 e definir autorização para coordenadas públicas.
- [ ] Configurar chave restrita, carregamento sob demanda e mapa no detalhe.
- [ ] Criar fallback sem coordenadas e testar privacidade.

Funcionalidade adiada para uma fase futura: depende da política de divulgação do endereço exato e de uma chave Google Maps restrita por domínio. O modelo já preserva latitude e longitude opcionais; nenhuma coordenada é exposta publicamente enquanto esta fase estiver pendente.

## FASE 14 — Painel administrativo

- [x] Criar layout protegido e dashboard com contagens por status.
- [ ] Criar listagem administrativa com busca, filtros, paginação e estados vazios.
- [ ] Testar uso em celular e acesso negado a visitante.

## FASE 15 — CRUD de imóveis (PROPERTY-001/002)

- [x] Criar formulário em seções e schemas Zod compartilhados.
- [x] Implementar criação de rascunho, código/slug e auditoria.
- [x] Implementar status SOLD/RENTED e soft delete.
- [ ] Testar validações, autorização, transições e remoção pública.

## FASE 16 — Consulta de CEP (CEP-001)

- [x] Integrar ViaCEP com timeout, loading e CEP inválido/inexistente.
- [x] Preencher campos editáveis e preservar edição manual em falha.
- [ ] Testar todas as respostas e indisponibilidade.

Evidência parcial Fases 10–16: filtros, detalhe, CTA WhatsApp, dashboard, formulário de rascunho e ViaCEP foram implementados. ViaCEP retornou 200 para o CEP `01001000`; criação e soft delete administrativos retornaram 201/200. Google Maps aguarda DECISION-004 e uma chave restrita. Publicação, carrossel e edição completa dependem da gestão de imagens das Fases 17–19.

## FASE 17 — MinIO (IMAGE-001)

- [x] Criar StorageService e cliente S3 por ambiente.
- [ ] Criar bucket local e política de menor privilégio.
- [x] Implementar upload, exclusão e entrega controlada.
- [x] Validar assinatura/MIME, tamanho e chave segura; testar operações.

Evidência parcial Fase 17: upload para o bucket remoto `imobiliaria`, exclusão de objeto e URL assinada de 60 segundos foram validados. Bucket local e credencial de mínimo privilégio ficam pendentes porque o ambiente remoto atual usa a conta root do MinIO.

## FASE 18 — Upload múltiplo (IMAGE-001)

- [x] Validar múltiplos arquivos e limite por imagem/quantidade.
- [x] Enviar objetos e salvar referências no PostgreSQL sem registros órfãos.
- [ ] Implementar compensação e teste de falhas em cada etapa.

Evidência parcial Fase 18: dois PNGs foram enviados no mesmo request, metadados foram persistidos e removidos no teste. A compensação de falha do banco está implementada, mas cenários de falha injetada permanecem para a Fase 24.

## FASE 19 — Gestão de imagens (IMAGE-001)

- [x] Selecionar principal única, reordenar e excluir com confirmação.
- [x] Impedir publicação sem principal e exclusão da última imagem publicada.
- [ ] Conferir imagem do card e ordem do carrossel.

Evidência parcial Fase 19: o teste validou imagem principal, reordenação, promoção automática ao excluir a principal e bloqueio da remoção da última imagem publicada. Card e carrossel dependem da renderização final das imagens na UI.

## FASE 20 — Gestão dos usuários (USER-001)

- [x] Criar lista, cadastro, edição, ativação, desativação e role para ADMIN.
- [x] Garantir email único, senha segura, revogação e proteção do último ADMIN.
- [x] Testar 403 para USER e fluxos de desativação.

Evidência Fase 20: endpoints ADMIN e listagem administrativa criados. Teste remoto criou USER temporário, confirmou 403 para recursos administrativos, desativou o usuário, confirmou revogação de sessão e removeu o registro ao final.

## FASE 21 — Configurações (SETTINGS-001)

- [x] Criar tela ADMIN e API de WhatsApp padrão.
- [x] Copiar padrão na criação, permitir override e manter imóveis existentes.
- [x] Testar validação do número e 403 para USER.

Evidência Fase 21: tela e API ADMIN implementadas; formulário de imóvel recebe o número padrão como valor inicial e permite edição. Teste remoto confirmou atualização de configurações e 403 para USER.

## FASE 22 — Segurança (NFR-001)

- [ ] Aplicar CSRF, rate limit compartilhado, headers e política de cookies.
- [ ] Revisar RBAC, XSS, SQL injection, uploads, secrets e logs.
- [ ] Executar testes negativos documentados em SECURITY.md.

Implementação parcial: cookies HttpOnly/SameSite, JWT curto, refresh rotativo, Argon2id, validação Zod, bloqueio de Origin inválida, headers de segurança e limite de login em memória estão ativos. Rate limit compartilhado, CSP final e revisão completa permanecem pendentes.

## FASE 23 — Tratamento de erros

- [ ] Padronizar códigos/respostas de API e mensagens de campo.
- [ ] Criar feedback de loading, sucesso, erro, vazio e confirmação destrutiva.
- [ ] Testar falhas de PostgreSQL, MinIO, ViaCEP e Maps.

Implementação parcial: cadastro de imóvel informa carregamento, bloqueia reenvio, exibe toast para erro ou retorno do ViaCEP e permite retorno à lista. O login possui alternância de visibilidade de senha; o campo de preço formata BRL; imagens selecionadas mostram prévia e permitem escolher a capa.

## FASE 24 — Testes

- [ ] Unitários: visibilidade, roles, principal única, WhatsApp padrão/link.
- [ ] Integração: PostgreSQL, auth, CRUD, filtros, permissões e MinIO.
- [ ] E2E: login, cadastro/edição, upload, busca, WhatsApp, SOLD/RENTED.

## FASE 25 — Responsividade e acessibilidade (NFR-002/003)

- [ ] Verificar 375, 768, 1024 e 1440 px em site e admin.
- [ ] Verificar teclado, labels, foco, alt, contraste e leitor de tela nas jornadas críticas.

## FASE 26 — SEO (SEO-001)

- [ ] Criar metadata dinâmica, Open Graph e canonical.
- [ ] Criar sitemap/robots só para anúncios públicos; bloquear indexação de login/admin.
- [ ] Testar remoção de anúncios indisponíveis do sitemap.

## FASE 27 — Performance (NFR-004)

- [ ] Otimizar imagens, lazy loading e queries sem N+1.
- [ ] Medir paginação, índices e planos de consulta com volume representativo.

## FASE 28 — Preparação de produção

- [ ] Configurar secrets, backups, observabilidade e readiness.
- [ ] Revisar política de privacidade do endereço e chaves Maps.
- [ ] Testar restauração e plano de rollback de imagem/migration.

## FASE 29 — Docker production

- [ ] Validar build standalone, usuário não root e imagem mínima.
- [ ] Executar migration como job único e smoke tests em Compose.

## FASE 30 — Deploy EasyPanel

- [ ] Provisionar PostgreSQL/MinIO/bucket e serviço da aplicação.
- [ ] Configurar domínio, HTTPS, variáveis, migrations e primeiro ADMIN.
- [ ] Validar health checks, backups e fluxos principais no ambiente publicado.

## FASE 31 — Testes finais

- [ ] Executar lint, typecheck, unitários, integração e E2E.
- [ ] Verificar todos os critérios de aceite do MVP e corrigir falhas.
- [ ] Conferir que `.env.local`, chaves e logs não estão versionados.

## FASE 32 — Documentação final

- [ ] Atualizar README com comandos reais, testes, build e troubleshooting.
- [ ] Sincronizar SPEC, API, banco, segurança, deploy e decisões com código.
- [ ] Registrar evidências de conclusão e marcar checklist apenas após validação.
