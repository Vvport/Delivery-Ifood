import { HttpService } from '@nestjs/axios';
import { IfoodAuthService } from '../ifood-auth/ifood-auth.service';
import { OrdersService } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
export declare class IfoodPollingService {
    private readonly http;
    private readonly auth;
    private readonly settings;
    private readonly ordersService;
    private readonly logger;
    private readonly baseUrl;
    private isPolling;
    constructor(http: HttpService, auth: IfoodAuthService, settings: SettingsService, ordersService: OrdersService);
    pollEvents(): Promise<void>;
    private handleEvent;
    private acknowledgeEvents;
}
