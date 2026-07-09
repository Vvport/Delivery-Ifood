import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service';
import { OrdersService } from '../orders/orders.service';

@Controller('route')
export class RouteController {
  constructor(
    private readonly routeService: RouteService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * GET /route/optimize
   * Pega todos os pedidos pendentes e devolve a rota otimizada,
   * começando pela loja. É esse endpoint que o frontend chama
   * para desenhar o trajeto no mapa.
   */
  @Get('optimize')
  async getOptimizedRoute() {
    const orders = await this.ordersService.getPendingOrders();
    return this.routeService.optimize(orders);
  }
}
