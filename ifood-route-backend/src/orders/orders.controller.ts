import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { Repository } from 'typeorm';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  /**
   * GET /orders
   * Lista os pedidos atualmente pendentes de entrega (com endereço e coordenadas).
   * O frontend pode usar isso pra mostrar a lista antes de gerar a rota.
   */
  @Get()
  getPendingOrders() {
    return this.ordersService.getPendingOrders();
  }

  /**
   * DELETE /orders/:orderId
   * Remove manualmente um pedido da fila (ex: entrega já realizada,
   * ou pedido adicionado por engano).
   */
  @Delete(':orderId')
  removeOrder(@Param('orderId') orderId: string) {
    this.ordersService.removeOrder(orderId);
    return { removed: orderId };
  }

  /**
   * POST /orders/simulate
   * Cria pedidos fictícios para testes visuais no dashboard.
   * Não depende da API do iFood — insere direto no banco de dados.
   */
  @Post('simulate')
  async simulateOrders() {
    const fakeOrders = [
      {
        orderId: `SIM-${Date.now()}-1`,
        displayId: '1001',
        customerName: 'João Silva',
        addressFormatted: 'Rua Augusta, 1200 - Consolação',
        addressNeighborhood: 'Consolação',
        addressCity: 'São Paulo',
        latitude: -23.5536,
        longitude: -46.6580,
      },
      {
        orderId: `SIM-${Date.now()}-2`,
        displayId: '1002',
        customerName: 'Maria Oliveira',
        addressFormatted: 'Av. Paulista, 900 - Bela Vista',
        addressNeighborhood: 'Bela Vista',
        addressCity: 'São Paulo',
        latitude: -23.5632,
        longitude: -46.6542,
      },
      {
        orderId: `SIM-${Date.now()}-3`,
        displayId: '1003',
        customerName: 'Carlos Santos',
        addressFormatted: 'Rua Oscar Freire, 500 - Jardins',
        addressNeighborhood: 'Jardins',
        addressCity: 'São Paulo',
        latitude: -23.5629,
        longitude: -46.6718,
      },
    ];

    for (const order of fakeOrders) {
      await this.repo.save(order);
    }

    return { message: `${fakeOrders.length} pedidos simulados criados com sucesso`, orders: fakeOrders };
  }
}
