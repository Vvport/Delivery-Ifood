import { OrdersService } from './orders.service';
import { OrderEntity } from './order.entity';
import { Repository } from 'typeorm';
export declare class OrdersController {
    private readonly ordersService;
    private readonly repo;
    constructor(ordersService: OrdersService, repo: Repository<OrderEntity>);
    getPendingOrders(): Promise<import("./orders.service").DeliveryOrder[]>;
    removeOrder(orderId: string): {
        removed: string;
    };
    simulateOrders(): Promise<{
        message: string;
        orders: {
            orderId: string;
            displayId: string;
            customerName: string;
            addressFormatted: string;
            addressNeighborhood: string;
            addressCity: string;
            latitude: number;
            longitude: number;
        }[];
    }>;
}
