# iFood Route Frontend

Painel web (Next.js) com:
- Tela de login (usuário/senha)
- Dashboard com a lista de pedidos pendentes e o mapa com a rota otimizada
- Estado "Procurando novos pedidos" quando não há entregas pendentes

## Setup

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:
- `NEXT_PUBLIC_API_URL`: URL do backend NestJS (ifood-route-backend), ex: `http://localhost:3000`
- `APP_USERNAME` / `APP_PASSWORD`: credenciais de acesso ao painel

## Rodando

```bash
npm run dev
```

Acesse `http://localhost:3001` (ou a porta que o Next escolher) — você será
redirecionado para `/login`.

## Estrutura

- `middleware.ts` — protege as rotas `/dashboard/*`, exigindo o cookie de sessão
- `app/api/login` — valida usuário/senha contra `.env` e cria o cookie de sessão
- `app/api/logout` — remove o cookie
- `app/login` — formulário de login
- `app/dashboard` — página principal:
  - busca `GET /orders` e `GET /route/optimize` no backend a cada 30s
  - mostra a lista de pedidos na ordem da rota (`OrdersList`)
  - mostra o mapa com marcadores numerados + linha da rota (`RouteMap`)
  - se não houver pedidos, mostra o estado "Procurando novos pedidos" (`SearchingOrders`)
- `lib/api.ts` — funções de acesso ao backend

## Notas sobre o login

O login atual é simples (usuário/senha fixos via `.env`, cookie httpOnly).
Funciona bem para uma única loja com um usuário. Se precisar de múltiplos
usuários (ex: um login por motoboy, vendo só a própria rota), vale migrar
para uma tabela de usuários com senha em hash (bcrypt) + JWT, ou usar o
NextAuth.js com um provider de credenciais.

## Próximos passos sugeridos

- Indicador visual de "atualizando..." durante o refresh automático
- Tela de cálculo do pagamento do motoboy por rota
- Notificação sonora/visual quando um novo pedido entra na fila
