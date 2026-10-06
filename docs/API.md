# Contratos de API — versão inicial

Base `/api`. JSON UTF-8. Endpoints administrativos exigem cookies de sessão e proteção CSRF em mutações. Respostas de lista: `{ "data": [], "pagination": { "page": 1, "pageSize": 12, "total": 0, "totalPages": 0 } }`. Erros: `{ "success": false, "error": { "code": "PROPERTY_NOT_FOUND", "message": "Imóvel não encontrado.", "details": {} } }`; `details` opcional por campo, nunca stack trace. Códigos HTTP: 400 query inválida, 401 sem sessão, 403 sem permissão, 404 não encontrado/oculto, 409 conflito, 413 arquivo grande, 422 validação, 429 limite, 500 erro interno, 503 dependência indisponível.

| Método | Rota | Acesso | Função / ID |
|---|---|---|---|
| POST | `/auth/login` | Público | AUTH-001; email/senha; cookies de sessão |
| POST | `/auth/refresh` | Refresh válido | AUTH-002; rotaciona cookies |
| POST | `/auth/logout` | Autenticado | AUTH-002; revoga e limpa cookies |
| GET | `/properties` | Público | SEARCH-001/FILTER-001; somente publicados e disponíveis |
| GET | `/properties/{slug}` | Público | SEARCH-001; detalhe público ou 404 |
| GET | `/admin/properties` | USER/ADMIN | Todos não excluídos, inclusive SOLD/RENTED e rascunhos |
| GET | `/admin/properties/{id}` | USER/ADMIN | Detalhe de edição |
| POST | `/admin/properties` | USER/ADMIN | PROPERTY-001; cria rascunho |
| PUT | `/admin/properties/{id}` | USER/ADMIN | PROPERTY-001/002; edita e publica após validação |
| DELETE | `/admin/properties/{id}` | USER/ADMIN | PROPERTY-002; soft delete |
| POST | `/admin/properties/{id}/images` | USER/ADMIN | IMAGE-001; multipart, upload validado |
| PUT | `/admin/properties/{id}/images/order` | USER/ADMIN | IMAGE-001; IDs ordenados e principal |
| DELETE | `/admin/properties/{id}/images/{imageId}` | USER/ADMIN | IMAGE-001; remoção segura |
| GET | `/admin/users` | ADMIN | USER-001; lista paginada |
| POST | `/admin/users` | ADMIN | USER-001; criação |
| PUT | `/admin/users/{id}` | ADMIN | USER-001; edição/ativação/desativação |
| GET | `/admin/settings` | ADMIN | SETTINGS-001 |
| PUT | `/admin/settings` | ADMIN | SETTINGS-001 |
| GET | `/admin/cep/{zipCode}` | USER/ADMIN | CEP-001; proxy com timeout e erros estáveis |

`GET /properties` aceita `q`, `status=FOR_SALE|FOR_RENT`, `category` (slug), `city`, `neighborhood`, `minPrice`, `maxPrice`, `sort=newest|price_asc|price_desc`, `page>=1`, `pageSize` (padrão 12, máximo 48). Query pública nunca aceita `SOLD`/`RENTED`. Ordenação usa desempate por ID. Retorno de imóvel público exclui dados administrativos e endereço exato enquanto não houver autorização de divulgação. Rotas administrativas usam UUID; rota pública usa slug. URLs do frontend: `/`, `/imoveis`, `/imoveis/[slug]`, `/login`, `/admin`, `/admin/imoveis`, `/admin/imoveis/novo`, `/admin/imoveis/[id]/editar`, `/admin/usuarios`, `/admin/usuarios/novo`, `/admin/usuarios/[id]/editar`, `/admin/configuracoes`.

Payload de criação/edição: `title`, `description`, `price` como string decimal, `status`, `categoryId`, endereço (`zipCode`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `country`), `latitude?`, `longitude?`, `whatsappNumber`; `publicationState` solicitado separadamente ou na edição após imagem válida. Campos de auditoria, ID, código e slug são definidos pelo servidor. Upload retorna metadados e ID da imagem, nunca chaves secretas.

Contratos serão refinados antes de cada fase, mantendo compatibilidade entre documentação, schemas Zod e testes. Se Server Actions substituírem endpoint interno, preservar semântica, autorização e critérios de aceite documentados aqui.
