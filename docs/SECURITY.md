# Segurança

## Autenticação e autorização

Senha com Argon2id (parâmetros calibrados no ambiente) e comparação segura. Access JWT assinado com chave forte, validade de 5 minutos, claims mínimos (`sub`, `role`, `iat`, `exp`, `jti`); validar assinatura, algoritmo, expiração e usuário ativo em ações protegidas. Refresh token opaco de 7 dias, aleatório, guardado apenas em hash no PostgreSQL e rotacionado a cada uso. Reutilização revoga a família. Logout revoga sessão; desativação revoga todas as sessões do usuário. Cookies HttpOnly, Secure em produção, SameSite=Lax ou Strict conforme fluxo; escopo Path mínimo. Não usar localStorage.

Senhas administrativas aceitam no mínimo 8 caracteres, com recomendação de frase longa, exclusiva e gerenciada por cofre de senhas. O bootstrap não registra a senha em arquivo; ela é recebida somente pela variável de ambiente de uma execução.

Cada rota administrativa e Server Action verifica sessão e role no servidor. USER pode gerenciar qualquer imóvel, mas apenas ADMIN gerencia usuários/configurações. Login retorna erro genérico para evitar enumeração de contas. Rate limit de login por IP e identificador normalizado, inicialmente 5 tentativas por 15 minutos, com armazenamento compartilhado para múltiplas instâncias; retornar 429 e `Retry-After`. O limite e política operacional devem ser revisados antes do deploy.

Na implementação atual o limitador de login é em memória, adequado apenas para desenvolvimento e uma única instância. A Fase 22 deve substituí-lo por armazenamento compartilhado antes de qualquer escala horizontal.

## Proteções de entrada e transporte

Schemas Zod validam payloads, query e parâmetros. Prisma usa parâmetros; SQL bruto, se necessário, sempre parametrizado. Saída React é escapada; não renderizar HTML não confiável. Aplicar CSP compatível com Next.js/Maps, `X-Content-Type-Options: nosniff`, política de referrer, HSTS com HTTPS e política de frames. Mutations com cookies exigem proteção CSRF: SameSite, validação de Origin/Host e token CSRF para formulários/rotas de risco. CORS restrito ao domínio da aplicação.

Upload exige autenticação, limite configurável padrão 10 MiB, allowlist JPEG/PNG/WebP, conferência de assinatura de arquivo e decodificação, nome/chave gerados pelo servidor, sem execução de conteúdo. Objetos privados por padrão; entrega pública via URL assinada ou proxy controlado para imagens de anúncios elegíveis. Nunca expor credenciais MinIO. Restringir tamanho e quantidade por imóvel e considerar varredura adicional antes da produção.

Secrets exclusivamente por variáveis de ambiente/secret manager do EasyPanel; nunca em logs, Git ou imagem Docker. Credenciais diferentes por ambiente e rotação planejada. Logs estruturados sem senha, tokens, cookies, chaves ou endereço privado. API de erros não retorna stack trace em produção. Backup PostgreSQL e MinIO com restauração testada; acesso ao banco e bucket limitado por rede e privilégios.

Pendências do ambiente remoto: o PostgreSQL atual não aceita TLS no endpoint informado e o acesso MinIO disponível usa a conta root. Antes de trafegar dados reais em produção, configurar TLS ou rede privada para o PostgreSQL e uma credencial MinIO exclusiva, limitada ao bucket necessário.

## Verificação de segurança

Testar RBAC em todos os endpoints, usuário desativado com token válido, refresh expirado/reutilizado, CSRF, rate limit, MIME falso, arquivo grande, parâmetros inválidos e vazamento de SOLD/RENTED/endereços. Revisar dependências e headers antes do deploy.
