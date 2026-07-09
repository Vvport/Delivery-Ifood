import { HttpService } from '@nestjs/axios';
import { DeliveryOrder } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
export interface RoutePoint {
    label: string;
    latitude: number;
    longitude: number;
    orderId?: string;
}
export interface OptimizedRoute {
    stops: RoutePoint[];
    totalDistanceMeters: number;
}
export declare class RouteService {
    private readonly http;
    private readonly settings;
    private readonly logger;
    constructor(http: HttpService, settings: SettingsService);
    optimize(orders: DeliveryOrder[]): Promise<OptimizedRoute>;
    private getDistanceMatrix;
    private haversineMatrix;
    private haversineDistance;
    private toRad;
    private nearestNeighbor;
    private nearestNeighborWithTwoOpt;
    private twoOpt;
    private sumRouteDistance;
}
