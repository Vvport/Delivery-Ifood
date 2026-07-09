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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
const common_1 = require("@nestjs/common");
const route_service_1 = require("./route.service");
const orders_service_1 = require("../orders/orders.service");
let RouteController = class RouteController {
    constructor(routeService, ordersService) {
        this.routeService = routeService;
        this.ordersService = ordersService;
    }
    async getOptimizedRoute() {
        const orders = await this.ordersService.getPendingOrders();
        return this.routeService.optimize(orders);
    }
};
exports.RouteController = RouteController;
__decorate([
    (0, common_1.Get)('optimize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "getOptimizedRoute", null);
exports.RouteController = RouteController = __decorate([
    (0, common_1.Controller)('route'),
    __metadata("design:paramtypes", [route_service_1.RouteService,
        orders_service_1.OrdersService])
], RouteController);
//# sourceMappingURL=route.controller.js.map