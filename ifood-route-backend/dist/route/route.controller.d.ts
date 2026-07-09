import { RouteService } from './route.service';
import { OrdersService } from '../orders/orders.service';
export declare class RouteController {
    private readonly routeService;
    private readonly ordersService;
    constructor(routeService: RouteService, ordersService: OrdersService);
    getOptimizedRoute(): Promise<import("./route.service").OptimizedRoute>;
}
