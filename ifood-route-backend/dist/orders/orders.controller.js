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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./order.entity");
const typeorm_2 = require("typeorm");
let OrdersController = class OrdersController {
    constructor(ordersService, repo) {
        this.ordersService = ordersService;
        this.repo = repo;
    }
    getPendingOrders() {
        return this.ordersService.getPendingOrders();
    }
    removeOrder(orderId) {
        this.ordersService.removeOrder(orderId);
        return { removed: orderId };
    }
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
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getPendingOrders", null);
__decorate([
    (0, common_1.Delete)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "removeOrder", null);
__decorate([
    (0, common_1.Post)('simulate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "simulateOrders", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        typeorm_2.Repository])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map