"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IfoodPollingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfoodPollingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const schedule_1 = require("@nestjs/schedule");
const rxjs_1 = require("rxjs");
const ifood_auth_service_1 = require("../ifood-auth/ifood-auth.service");
const orders_service_1 = require("../orders/orders.service");
const settings_service_1 = require("../settings/settings.service");
let IfoodPollingService = IfoodPollingService_1 = class IfoodPollingService {
    constructor(http, auth, settings, ordersService) {
        this.http = http;
        this.auth = auth;
        this.settings = settings;
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(IfoodPollingService_1.name);
        this.baseUrl = 'https://merchant-api.ifood.com.br';
        this.isPolling = false;
    }
    async pollEvents() {
        if (this.isPolling) {
            this.logger.debug('Polling anterior ainda em andamento. Ignorando este ciclo.');
            return;
        }
        this.isPolling = true;
        try {
            const token = await this.auth.getAccessToken();
            const merchantId = (await this.settings.get('IFOOD_MERCHANT_ID')) ?? '';
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/events/v1.0/events:polling`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-polling-merchants': merchantId,
                },
            }));
            const events = response.data ?? [];
            if (events.length === 0)
                return;
            this.logger.log(`Recebidos ${events.length} evento(s)`);
            for (const event of events) {
                await this.handleEvent(event);
            }
            await this.acknowledgeEvents(events.map((e) => e.id), token);
        }
        catch (err) {
            this.logger.error('Erro durante o polling de eventos', err?.message ?? err);
        }
        finally {
            this.isPolling = false;
        }
    }
    async handleEvent(event) {
        switch (event.fullCode) {
            case 'PLACED':
                await this.ordersService.fetchAndStoreOrder(event.orderId);
                break;
            case 'CONCLUDED':
            case 'CANCELLED':
                await this.ordersService.removeOrder(event.orderId);
                break;
        }
    }
    async acknowledgeEvents(eventIds, token) {
        if (eventIds.length === 0)
            return;
        await (0, rxjs_1.firstValueFrom)(this.http.post(`${this.baseUrl}/events/v1.0/events/acknowledgment`, eventIds.map((id) => ({ id })), { headers: { Authorization: `Bearer ${token}` } }));
    }
};
exports.IfoodPollingService = IfoodPollingService;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IfoodPollingService.prototype, "pollEvents", null);
exports.IfoodPollingService = IfoodPollingService = IfoodPollingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        ifood_auth_service_1.IfoodAuthService,
        settings_service_1.SettingsService,
        orders_service_1.OrdersService])
], IfoodPollingService);
//# sourceMappingURL=ifood-polling.service.js.map