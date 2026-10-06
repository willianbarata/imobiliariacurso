# Deploy no EasyPanel

Este é o procedimento planejado; a aplicação ainda não foi implementada nem publicada.

1. Provisionar PostgreSQL com volume persistente, backup automatizado e rede privada. Provisionar MinIO com volume persistente, credenciais próprias da aplicação e bucket privado. Configurar health checks.
2. Construir imagem pelo `Dockerfile` multi-stage após implementar Next.js com `output: 'standalone'`. Fixar versão de Node compatível com o projeto e instalar dependências pelo lockfile. A imagem final executa usuário não root e expõe porta configurada.
3. No EasyPanel, criar serviço da aplicação apontando para repositório/imagem e Dockerfile. Definir `DATABASE_URL`, segredo de assinatura JWT, configuração MinIO/S3, URL pública, ambiente de produção e chave pública restrita de Maps. Injetar pelo gerenciador de secrets; não enviar `.env` ao Git.
4. Criar bucket e política de menor privilégio. Confirmar acesso da aplicação à rede privada de PostgreSQL/MinIO e domínio HTTPS externo.
5. Antes de liberar tráfego, fazer backup e executar `prisma migrate deploy` como job único. Rodar seed idempotente de categorias/configurações. Criar primeiro ADMIN com CLI de bootstrap interativa/secret temporário; revogar secret após uso. Nunca criar conta ou senha fixa.
6. Configurar domínio, HTTPS, redirecionamento HTTP→HTTPS, cookies Secure, CSP e restrições da chave Google Maps por domínio. Configurar storage público apenas via URLs controladas.
7. Validar readiness, login, cadastro, upload, consulta pública, ocultação de SOLD/RENTED, WhatsApp, mapa e logs. Fazer rollback de imagem se smoke tests falharem; migration incompatível requer plano de reversão de dados validado previamente.
8. Configurar backups e exercício de restauração de PostgreSQL e MinIO, alertas de espaço/erro e rotação de secrets.

Estado do ambiente informado em 06/10/2026: PostgreSQL remoto recebeu a migration inicial e o bucket `imobiliaria` respondeu a `HeadBucket`. A conexão PostgreSQL fornecida usa `sslmode=disable`; tentativa com TLS retornou que o servidor não oferece TLS. Habilitar TLS ou restringir o tráfego por rede privada antes de publicar dados reais. As credenciais MinIO fornecidas são de root; criar usuário/política exclusiva da aplicação com acesso mínimo ao bucket antes do deploy.

O seed atual usa `5511999999999` como WhatsApp fictício de desenvolvimento. Atualize `SystemSettings.defaultWhatsappNumber` para o número real antes de disponibilizar CTAs públicos.

Compose local deve ter `app`, `postgres`, `minio` e opcional `minio-init`, com volumes, health checks e dependências. Ver [README](../README.md) para comandos concretos quando o bootstrap existir. Variáveis estão em [`.env.example`](../.env.example).
