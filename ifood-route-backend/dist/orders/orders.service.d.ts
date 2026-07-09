import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { IfoodAuthService } from '../ifood-auth/ifood-auth.service';
import { OrderEntity } from './order.entity';
export interface DeliveryOrder {
    orderId: string;
    displayId: string;
    customerName: string;
    address: {
        formatted: string;
        neighborhood?: string;
        city?: string;
    };
    coordinates: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
}
export declare class OrdersService {
    private readonly http;
    private readonly auth;
    private readonly repo;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, auth: IfoodAuthService, repo: Repository<OrderEntity>);
    fetchAndStoreOrder(orderId: string): Promise<void>;
    getPendingOrders(): Promise<DeliveryOrder[]>;
    removeOrder(orderId: string): Promise<void>;
}
