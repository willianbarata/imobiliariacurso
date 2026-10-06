# Especificação funcional e processo SDD

Versão: 1.0 (05/10/2026). Estado: especificação inicial, sem implementação. Origem: [spec.md](spec.md). Este documento é a fonte de verdade operacional; mudanças de requisito devem atualizar o ID afetado, os contratos, os testes e o [checklist](DEVELOPMENT-CHECKLIST.md) antes do código.

## Produto, objetivo e escopo

Plataforma responsiva de uma imobiliária para anunciar imóveis à venda ou para aluguel, captar contato via WhatsApp e administrar anúncios, imagens, usuários e configurações. MVP: site público, área autenticada, PostgreSQL, MinIO, Docker e publicação no EasyPanel. Fora do MVP: favoritos, corretores, CRM, visitas, leads, analytics, vídeos, portais, auditoria completa, recuperação de exclusões, CRUD de categorias e multiempresa.

## Processo obrigatório

1. Abrir um item do checklist e ler os IDs desta especificação associados.
2. Confirmar pré-condições, dependências, contrato de API e critérios de aceite.
3. Registrar decisão relevante em `ARCHITECTURE.md` antes de alterar arquitetura ou produto.
4. Implementar com validação no cliente e servidor; autorização sempre no servidor.
5. Executar testes adequados, lint, checagem TypeScript e revisar UX, acessibilidade e segurança aplicáveis.
6. Atualizar documentação e marcar `[x]` apenas com evidência funcional. Se houver bloqueio, manter `[ ]` e registrar a causa.

Definição de pronto: código funcional, erros tratados, permissão verificada, testes relevantes passando, responsividade quando aplicável, documentos e checklist atualizados. A conclusão do MVP exige todos os critérios de aceite abaixo e validação em ambiente semelhante ao de produção.

## Atores e permissões

| Ação | Visitante | USER ativo | ADMIN ativo |
|---|---:|---:|---:|
| Consultar anúncios disponíveis, fotos, mapa e WhatsApp | Sim | Sim | Sim |
| Acessar administração e dashboard | Não | Sim | Sim |
| Criar, ler, editar, excluir logicamente e mudar status de qualquer imóvel | Não | Sim | Sim |
| Gerenciar imagens de qualquer imóvel | Não | Sim | Sim |
| Criar, editar, ativar, desativar e definir role de usuários | Não | Não | Sim |
| Alterar configurações da imobiliária | Não | Não | Sim |

Usuário desativado perde acesso inclusive com token ainda válido. `createdBy` e `updatedBy` são auditáveis; não restringem propriedade do anúncio. Nunca aceitar role ou identidade enviados pelo cliente como autoridade.

## Regras transversais

- Imóvel usa UUID interno, código público sequencial `IMO-000001` e slug único contendo o código. Código não é reutilizado. Preço é `Numeric(14,2)` em BRL, nunca float.
- `FOR_SALE` e `FOR_RENT` com `deletedAt = null` e pelo menos uma imagem são elegíveis para publicação. `SOLD`, `RENTED` e excluídos são omitidos de toda API pública, inclusive detalhe por slug.
- Cadastro pode iniciar como rascunho técnico sem imagem, invisível ao público; publicação ocorre apenas após imagem principal válida. Isso preserva o fluxo de upload sem anúncio incompleto.
- Exclusão de imóvel é lógica (`deletedAt`); listagens administrativas normais também omitem excluídos. Restauração fica para versão futura.
- Imagens ficam no MinIO; PostgreSQL guarda metadados. Um imóvel publicado tem exatamente uma imagem principal. JPEG, PNG e WebP até 10 MiB por padrão; validar conteúdo real além de extensão e MIME declarados.
- Configuração `defaultWhatsappNumber` é copiada na criação. Alterar o padrão não modifica imóveis existentes. Cada imóvel pode ter número próprio em formato internacional só com dígitos.
- Endereço completo fica internamente. Até decisão de privacidade, a interface pública mostrará bairro, cidade e UF; coordenadas exatas e mapa só devem ser publicados para imóveis cuja divulgação exata esteja autorizada. Ver `DECISION-004`.
- CEP retornado pelo ViaCEP é sugestão editável. Falha ou timeout não impedem edição manual.
- Consulta pública tem busca por código, título, cidade e bairro; filtros por finalidade, categoria, cidade e bairro; preço mínimo/máximo; ordenação por data ou preço; paginação no servidor de 12 itens por padrão. Estado de busca fica na URL.

## Catálogo de funcionalidades rastreáveis

Cada item contém objetivo, ator, pré-condição, fluxo, alternativas, validação/erro, permissão, aceite e teste. Contratos detalhados: [API.md](API.md).

### AUTH-001 — Login

Objetivo: abrir sessão administrativa. Ator: USER/ADMIN ativo. Pré-condição: conta previamente criada. Fluxo: informar email e senha; servidor valida credenciais, atividade da conta, limite de tentativas e emite access JWT de 5 minutos e refresh opaco rotativo de 7 dias em cookies HttpOnly. Alternativas: dados inválidos, conta desativada ou limite excedido retornam mensagem pública genérica e código estável. Permissão: visitante pode chamar endpoint. Aceite: acesso válido abre `/admin`; credenciais inválidas não abrem sessão. Testes: unitário de regras, integração de cookies e rate limit, E2E de login.

### AUTH-002 — Renovação e logout

Objetivo: continuidade e encerramento de sessão. Ator: autenticado. Pré-condição: refresh válido. Fluxo: trocar refresh por novo par, revogar anterior; logout revoga família e limpa cookies. Alternativas: token expirado, revogado, reutilizado ou usuário desativado exige novo login. Permissão: renovação apenas com refresh íntegro. Aceite: access expira em 5 minutos sem encerrar sessão válida; logout impede renovação. Testes: integração de rotação, revogação, replay e desativação.

### USER-001 — Gestão de usuários

Objetivo: criar e manter contas. Ator: ADMIN ativo. Pré-condição: sessão válida. Fluxo: listar, cadastrar, editar nome/email/role/status e definir senha inicial segura por procedimento administrativo. Alternativas: email duplicado, dados inválidos e tentativa de desativar último ADMIN ativo são rejeitados. Permissão: exclusiva de ADMIN no backend. Aceite: USER recebe 403; conta desativada não autentica nem renova sessão. Testes: integração de RBAC e unicidade; E2E de gestão.

### PROPERTY-001 — Cadastro e edição

Objetivo: manter anúncio. Ator: USER/ADMIN ativo. Pré-condição: categoria existente; para publicação, imagem principal. Fluxo: preencher título, descrição, preço, finalidade/status, categoria, endereço e WhatsApp; copiar número padrão, permitindo ajuste; gerar UUID/código/slug; salvar; anexar imagens; publicar. Alternativas: CEP indisponível permite preenchimento manual; dados inválidos retornam erros por campo; falha de imagem mantém rascunho invisível. Permissão: USER/ADMIN para qualquer imóvel. Aceite: campos obrigatórios válidos, código único e publicação somente com imagem. Testes: validação, concorrência de código, integração CRUD e E2E.

### PROPERTY-002 — Mudança de status e exclusão

Objetivo: encerrar anúncio sem perder histórico. Ator: USER/ADMIN. Pré-condição: imóvel não excluído. Fluxo: atualizar status ou preencher `deletedAt` após confirmação; registrar `updatedBy`. Alternativas: ID inexistente retorna 404; estado inválido retorna 422. Permissão: USER/ADMIN em qualquer imóvel. Aceite: SOLD/RENTED/excluído somem imediatamente de consultas públicas, mas vendido/alugado permanece no admin. Testes: unitário de visibilidade, integração de API, E2E.

### IMAGE-001 — Upload e gestão de imagens

Objetivo: fotos ordenadas com principal única. Ator: USER/ADMIN. Pré-condição: imóvel existente e não excluído. Fluxo: validar tipo/assinatura/tamanho, subir ao MinIO com chave gerada, registrar metadados, escolher principal e ordem; excluir sob confirmação. Alternativas: falha no banco após upload remove objeto; falha no armazenamento não cria referência; falha na limpeza gera registro de compensação operacional. Permissão: USER/ADMIN. Aceite: card usa principal, detalhe mostra carrossel, não existem duas principais e publicação exige uma. Testes: unidade de validação, integração com MinIO/PostgreSQL e E2E.

### SEARCH-001 — Consulta pública

Objetivo: encontrar imóveis disponíveis. Ator: visitante. Pré-condição: nenhuma. Fluxo: home e `/imoveis` exibem cards; pesquisa por código/título/cidade/bairro; detalhes por slug. Alternativas: ausência de resultados mostra estado vazio; slug oculto/inexistente retorna 404. Permissão: pública com filtro obrigatório no servidor. Aceite: nenhum SOLD, RENTED, excluído ou rascunho aparece em lista ou detalhe. Testes: integração de queries e E2E.

### FILTER-001 — Filtros, ordenação e paginação

Objetivo: refinar consulta compartilhável. Ator: visitante. Pré-condição: nenhuma. Fluxo: parâmetros de URL para finalidade, categoria, cidade, bairro, faixas de preço, ordem e página; servidor limita tamanho, pagina e retorna metadados. Alternativas: parâmetros inválidos retornam 400; página vazia mostra estado vazio. Permissão: pública. Aceite: filtros combinam corretamente, voltar do navegador restaura estado, 12 itens por página por padrão. Testes: integração de combinações e E2E.

### CEP-001 — Preenchimento de endereço

Objetivo: reduzir digitação. Ator: USER/ADMIN. Pré-condição: formulário aberto e CEP com 8 dígitos. Fluxo: consultar ViaCEP, preencher campos editáveis. Alternativas: CEP inválido, inexistente, timeout ou indisponibilidade exibem feedback e preservam edição manual. Permissão: formulário administrativo. Aceite: nenhum erro externo bloqueia salvamento de endereço válido. Testes: unidade de mapeamento e UI com respostas simuladas.

### MAP-001 — Mapa

Objetivo: contextualizar localização pública. Ator: visitante. Pré-condição: coordenadas válidas e divulgação autorizada. Fluxo: renderizar Google Maps no detalhe. Alternativas: sem coordenadas ou autorização, exibir região/fallback sem mapa exato. Permissão: pública. Aceite: mapa nunca recebe coordenadas ausentes ou privadas. Testes: componente e E2E em cenários com e sem mapa.

Status: adiado para versão futura até que a imobiliária defina a política de endereço público e forneça chave Google Maps com restrição de domínio.

### WHATSAPP-001 — Contato

Objetivo: iniciar atendimento sobre imóvel. Ator: visitante. Pré-condição: imóvel público com número válido. Fluxo: CTA abre `wa.me` com número e mensagem codificada contendo código, título, finalidade, preço, região e URL canônica. Alternativas: número ausente/inválido impede CTA e registra erro operacional. Permissão: pública. Aceite: URL codificada corretamente, sem dados de endereço exato não autorizados. Testes: unitário de composição e E2E do link.

### SETTINGS-001 — Configurações

Objetivo: definir WhatsApp padrão. Ator: ADMIN. Pré-condição: sessão válida. Fluxo: consultar/alterar número em formato internacional; novos imóveis recebem cópia. Alternativas: número inválido gera 422. Permissão: ADMIN. Aceite: alteração não muda imóveis existentes; USER recebe 403. Testes: unidade, integração e E2E.

### SEO-001 — Descoberta pública

Objetivo: indexar anúncios disponíveis. Ator: buscador/visitante. Pré-condição: anúncio público. Fluxo: metadata dinâmica com title, description, Open Graph, canonical; sitemap e robots incluem apenas URLs públicas. Alternativas: imóvel removido deixa sitemap e retorna 404. Permissão: pública. Aceite: `/login` e `/admin` não indexáveis. Testes: integração de metadata/sitemap.

## Requisitos não funcionais

NFR-001 Segurança: hash de senha, RBAC no servidor, cookies HttpOnly/Secure/SameSite, CSRF, rate limit, validação e headers conforme [SECURITY.md](SECURITY.md). NFR-002 Responsividade: verificar 375, 768, 1024 e 1440 px, inclusive admin. NFR-003 Acessibilidade: labels, teclado, foco visível, alt e contraste. NFR-004 Performance: paginação no servidor, imagens otimizadas, índices, ausência de N+1 e lazy loading. NFR-005 Operação: Docker multi-stage, health checks, migrations versionadas e EasyPanel. NFR-006 Confiabilidade: erros previsíveis, transações quando cabíveis, compensação de upload. NFR-007 Localização: pt-BR, BRL e timezone explícito na apresentação; timestamps UTC no banco.

NFR-008 Feedback administrativo: formulários exibem carregamento durante mutações, toast de sucesso/erro, ação de voltar e confirmação para operações destrutivas. Campos de preço aceitam e exibem BRL com duas casas decimais. Seleção de imagens mostra previews antes do envio e permite definir a capa.

## Entidades, relacionamentos e fluxos

Entidades: `User`, `Property`, `Category`, `PropertyImage`, `SystemSettings`, `RefreshSession`. Relações, constraints e tipos em [DATABASE.md](DATABASE.md). Fluxos principais: login → sessão → autorização; cadastro → rascunho → imagens → publicação; busca → filtro no servidor → detalhe → WhatsApp; encerramento → status/soft delete → remoção pública. Arquitetura e integrações em [ARCHITECTURE.md](ARCHITECTURE.md).

## Aceite do MVP

O MVP só está pronto quando: visitante navega home, lista, pesquisa, filtra finalidade/categoria/região, pagina, vê detalhe, fotos, mapa quando autorizado e CTA WhatsApp correto; USER autentica e gerencia qualquer imóvel e suas fotos; ADMIN gerencia usuários e número padrão; SOLD/RENTED/excluídos/rascunhos ficam fora do público; arquivos residem no MinIO e metadados no PostgreSQL; Docker funciona, deploy EasyPanel está documentado, segredos não são versionados e testes essenciais passam. Cada condição corresponde aos IDs acima e às fases do checklist.

## Roadmap posterior

Favoritos, corretores, CRM, agendamento, histórico de contatos, destaques, vídeos, tour virtual, portais, lead tracking, analytics, auditoria completa, restauração, CRUD de categorias e multiempresa/multitenancy. Só promover ao MVP mediante alteração formal desta SPEC.
