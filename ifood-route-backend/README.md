# iFood Route Backend

Backend em NestJS que:

1. Recebe pedidos do iFood via polling de eventos
2. Extrai o endereço/coordenadas de entrega de cada pedido
3. Calcula a rota otimizada de entrega a partir da loja

## Setup

```bash
npm install
cp .env.example .env
```

Preencha o `.env` com:

- `IFOOD_CLIENT_ID` / `IFOOD_CLIENT_SECRET`: credenciais do app homologado no portal developer.ifood.com.br
- `IFOOD_MERCHANT_ID`: ID da sua loja na plataforma
- `STORE_LATITUDE` / `STORE_LONGITUDE`: coordenadas fixas da loja (ponto de partida da rota)
- `OSRM_URL`: servidor OSRM para cálculo de distância real (o público serve só para testes)

## Rodando

```bash
npm run start:dev
```

## Endpoints

- `GET /orders` — lista os pedidos pendentes de entrega
- `DELETE /orders/:orderId` — remove um pedido da fila manualmente
- `GET /route/optimize` — retorna a rota otimizada (loja + pedidos pendentes, na ordem ideal)

## Como funciona o fluxo

```
IfoodPollingService (a cada 30s)
  -> busca eventos novos na Merchant API
  -> para cada evento "PLACED": OrdersService.fetchAndStoreOrder(orderId)
       -> GET /orders/{id} na Merchant API
       -> extrai deliveryAddress.coordinates
       -> guarda em memória (fila de pedidos pendentes)
  -> confirma os eventos recebidos (acknowledgment)

RouteController (GET /route/optimize)
  -> pega os pedidos pendentes (OrdersService)
  -> monta a matriz de distâncias (OSRM, com fallback Haversine)
  -> aplica nearest neighbor + 2-opt
  -> retorna a ordem otimizada de paradas
```

## Próximos passos sugeridos

- Trocar o armazenamento em memória (`Map`) por Postgres, já que a Merchant
  API só mantém os detalhes do pedido por 7 dias
- Adicionar autenticação/login no painel (frontend)
- Cálculo do valor a pagar por motoboy, usando as distâncias entre
  trechos já retornadas por `route/optimize`
- Webhook em vez de polling, se preferir reduzir chamadas constantes
