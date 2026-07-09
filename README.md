# ifood-delivery

Projeto monorepo para otimização de rotas de entrega integrado ao iFood.

Sumário
- Visão geral
- Tecnologias
- Estrutura do repositório
- Requisitos e variáveis de ambiente
- Instruções de execução (desenvolvimento)
- Testes
- Endpoints principais e especificações
- CI / Qualidade do repositório
- Contribuição
- Contato / Segurança

Visão geral
O projeto fornece um backend em NestJS responsável por persistência, integração com iFood e cálculo/otimização de rotas, e um frontend em Next.js com painel de controle, validação de configurações e mapa interativo.

Tecnologias
- Backend: TypeScript, NestJS 11, TypeORM, Axios, RxJS, Jest
- Frontend: TypeScript, Next.js 14 (App Router), React, SWR, React-Leaflet, Tailwind CSS
- Ferramentas: GitHub Actions (CI), ESLint/Prettier (recomendado), Husky (recomendado)

Estrutura do repositório
- `ifood-route-backend/` — NestJS app
  - `src/settings/` — persistência e validação de configurações
  - `src/orders/`, `src/route/` — lógica de pedidos e roteamento
- `ifood-route-frontend/` — Next.js app
  - `app/dashboard/settings/page.tsx` — tela de configurações e validação de credenciais
  - `app/api/` — proxies para o backend (ex.: `/api/settings`, `/api/settings/validate`)

Requisitos
- Node.js 18+ recomendado
- PostgreSQL (ou ajustar `DATABASE_URL` para banco compatível)
- Variáveis de ambiente (exemplos)

  BACKEND
  - `DATABASE_URL` — URL de conexão com o Postgres
  - `API_KEY` — chave para proteger chamadas do frontend ao backend (opcional)

  IFOOD (opcional, para integração real)
  - `IFOOD_CLIENT_ID`
  - `IFOOD_CLIENT_SECRET`
  - `IFOOD_MERCHANT_ID`

  FRONTEND
  - `API_URL` — URL do backend (ex.: `http://localhost:3000`)
  - `API_KEY` — mesma chave definida no backend para chamadas internas

Rodando localmente (desenvolvimento)
1. Backend

  cd ifood-route-backend
  npm install
  npm run start:dev

  - Por padrão o backend espera `DATABASE_URL` configurada; sem DB o TypeORM pode usar `synchronize` para dev.

2. Frontend

  cd ifood-route-frontend
  npm install
  npm run dev

  - O frontend utiliza `API_URL` e `API_KEY` (defina via `.env` ou variáveis de ambiente).

Testes
- Backend (Jest):

  cd ifood-route-backend
  npm test -- --runInBand

- Recomenda-se executar testes no CI em cada PR.

Principais endpoints (backend)
- `GET /settings` — obtém configurações (usado por frontend proxy `/api/settings`)
- `PUT /settings` — salva várias configurações e tenta geocodificar CEP+numero
- `POST /settings/validate` — valida credenciais iFood (clientId/clientSecret/merchantId)
- `GET /route/optimize` — retorna rota otimizada (consome pedidos pendentes)
- `GET/DELETE /orders` — endpoints relacionados a pedidos (veja `src/orders`)

Especificações de validação
- `MOTOBOY_RATE_PER_KM` aceita formatos numéricos com `,` ou `.` e até 2 casas decimais (regex aplicada no DTO).
- Validação de credenciais iFood:
  1. Requisita token via OAuth client-credentials
  2. Verifica Merchant ID usando endpoint de polling (`/events:polling`)
  3. Retorna objeto `{ ok: boolean, message: string, authenticated?: boolean, merchantIdValid?: boolean }`

CI e Qualidade do repositório
- Workflow inicial já incluso: `.github/workflows/ci.yml` (executa testes backend e build frontend em PRs/push).
- Recomendações adicionais:
  - Adicionar ESLint + Prettier nas duas pastas
  - Configurar `husky` + `lint-staged` para pré-commit
  - Habilitar Dependabot para atualizações automáticas
  - Adicionar templates de PR/Issue e `SECURITY.md`

Contribuição
- Ver `CONTRIBUTING.md` para fluxo de PR e instruções de desenvolvimento local.

Segurança / Sensíveis
- Não comitar segredos. Use `.env` e GitHub Secrets para CI.
- Se segredos foram comitados, analise `git filter-repo` para limpar o histórico (cuidado).

Contato
- Para questões de segurança/vulnerabilidades, crie uma issue privada ou consulte `SECURITY.md` se existir.

Licença
- (Adicionar licença apropriada — por padrão não incluída)

---

Se quiser, eu:
- adiciono badges (build/coverage) ao `README.md`;
- configuro ESLint + Prettier + Husky automaticamente nas duas pastas;
- adiciono `dependabot.yml` e templates de issue/PR.
