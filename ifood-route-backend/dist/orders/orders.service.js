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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const ifood_auth_service_1 = require("../ifood-auth/ifood-auth.service");
const order_entity_1 = require("./order.entity");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(http, auth, repo) {
        this.http = http;
        this.auth = auth;
        this.repo = repo;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.baseUrl = 'https://merchant-api.ifood.com.br';
    }
    async fetchAndStoreOrder(orderId) {
        try {
            const token = await this.auth.getAccessToken();
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/order/v1.0/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            const data = response.data;
            const deliveryAddress = data?.delivery?.deliveryAddress;
            if (!deliveryAddress?.coordinates) {
                this.logger.warn(`Pedido ${orderId} não possui coordenadas de entrega, ignorando`);
                return;
            }
            await this.repo.save({
                orderId: data.id,
                displayId: data.displayId,
                customerName: data.customer?.name ?? 'Cliente',
                addressFormatted: deliveryAddress.formattedAddress ??
                    `${deliveryAddress.streetName}, ${deliveryAddress.streetNumber}`,
                addressNeighborhood: deliveryAddress.neighborhood ?? null,
                addressCity: deliveryAddress.city ?? null,
                latitude: deliveryAddress.coordinates.latitude,
                longitude: deliveryAddress.coordinates.longitude,
            });
            const total = await this.repo.count();
            this.logger.log(`Pedido ${data.displayId} salvo no banco (${total} pendentes)`);
        }
        catch (err) {
            this.logger.error(`Erro ao buscar detalhes do pedido ${orderId}`, err?.message ?? err);
        }
    }
    async getPendingOrders() {
        const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
        return rows.map((row) => ({
            orderId: row.orderId,
            displayId: row.displayId,
            customerName: row.customerName,
            address: {
                formatted: row.addressFormatted,
                neighborhood: row.addressNeighborhood ?? undefined,
                city: row.addressCity ?? undefined,
            },
            coordinates: {
                latitude: row.latitude,
                longitude: row.longitude,
            },
            createdAt: row.createdAt.toISOString(),
        }));
    }
    async removeOrder(orderId) {
        await this.repo.delete(orderId);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        ifood_auth_service_1.IfoodAuthService,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map