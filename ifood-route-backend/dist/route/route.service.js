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
var RouteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const settings_service_1 = require("../settings/settings.service");
let RouteService = RouteService_1 = class RouteService {
    constructor(http, settings) {
        this.http = http;
        this.settings = settings;
        this.logger = new common_1.Logger(RouteService_1.name);
    }
    async optimize(orders) {
        const storeLat = Number(await this.settings.get('STORE_LATITUDE'));
        const storeLng = Number(await this.settings.get('STORE_LONGITUDE'));
        const points = [
            { label: 'Loja', latitude: storeLat, longitude: storeLng },
            ...orders.map((order) => ({
                label: order.displayId,
                latitude: order.coordinates.latitude,
                longitude: order.coordinates.longitude,
                orderId: order.orderId,
            })),
        ];
        if (points.length <= 1) {
            return { stops: points, totalDistanceMeters: 0, path: points };
        }
        const matrix = await this.getDistanceMatrix(points);
        const orderedIndexes = this.nearestNeighborWithTwoOpt(matrix);
        const stops = orderedIndexes.map((i) => points[i]);
        const totalDistanceMeters = this.sumRouteDistance(orderedIndexes, matrix);
        const path = await this.buildRoutePath(stops);
        return { stops, totalDistanceMeters, path };
    }
    async getDistanceMatrix(points) {
        const osrmUrl = (await this.settings.get('OSRM_URL')) ?? 'https://router.project-osrm.org';
        const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${osrmUrl}/table/v1/driving/${coords}`, {
                params: { annotations: 'distance' },
            }));
            return response.data.distances;
        }
        catch {
            this.logger.warn('OSRM indisponível, usando distância em linha reta (haversine)');
            return this.haversineMatrix(points);
        }
    }
    haversineMatrix(points) {
        return points.map((a) => points.map((b) => this.haversineDistance(a, b)));
    }
    async buildRoutePath(stops) {
        if (stops.length <= 1) {
            return stops;
        }
        const osrmUrl = (await this.settings.get('OSRM_URL')) ?? 'https://router.project-osrm.org';
        const coords = stops.map((p) => `${p.longitude},${p.latitude}`).join(';');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get(`${osrmUrl}/route/v1/driving/${coords}`, {
                params: {
                    overview: 'full',
                    geometries: 'polyline',
                },
            }));
            const geometry = response.data.routes?.[0]?.geometry;
            if (!geometry) {
                throw new Error('OSRM não retornou geometria');
            }
            return this.decodePolyline(geometry);
        }
        catch (err) {
            this.logger.warn('Não foi possível obter geometria da rota OSRM, usando caminho direto');
            return stops;
        }
    }
    decodePolyline(encoded) {
        let index = 0;
        const points = [];
        let lat = 0;
        let lng = 0;
        while (index < encoded.length) {
            let result = 0;
            let shift = 0;
            let byte = 0;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lat += deltaLat;
            result = 0;
            shift = 0;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lng += deltaLng;
            points.push({
                label: '',
                latitude: lat / 1e5,
                longitude: lng / 1e5,
            });
        }
        return points;
    }
    haversineDistance(a, b) {
        const R = 6371000;
        const dLat = this.toRad(b.latitude - a.latitude);
        const dLng = this.toRad(b.longitude - a.longitude);
        const lat1 = this.toRad(a.latitude);
        const lat2 = this.toRad(b.latitude);
        const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }
    toRad(deg) {
        return (deg * Math.PI) / 180;
    }
    nearestNeighbor(matrix) {
        const n = matrix.length;
        const visited = new Array(n).fill(false);
        const route = [0];
        visited[0] = true;
        let current = 0;
        for (let step = 1; step < n; step++) {
            let nearest = -1;
            let nearestDist = Infinity;
            for (let j = 0; j < n; j++) {
                if (!visited[j] && matrix[current][j] < nearestDist) {
                    nearestDist = matrix[current][j];
                    nearest = j;
                }
            }
            route.push(nearest);
            visited[nearest] = true;
            current = nearest;
        }
        return route;
    }
    nearestNeighborWithTwoOpt(matrix) {
        return this.twoOpt(this.nearestNeighbor(matrix), matrix);
    }
    twoOpt(route, matrix) {
        const n = route.length;
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 1; i < n - 2; i++) {
                for (let j = i + 1; j < n - 1; j++) {
                    const a = route[i - 1], b = route[i];
                    const c = route[j], d = route[j + 1];
                    if (matrix[a][c] + matrix[b][d] < matrix[a][b] + matrix[c][d]) {
                        let left = i;
                        let right = j;
                        while (left < right) {
                            const temp = route[left];
                            route[left] = route[right];
                            route[right] = temp;
                            left++;
                            right--;
                        }
                        improved = true;
                    }
                }
            }
        }
        return route;
    }
    sumRouteDistance(route, matrix) {
        let total = 0;
        for (let i = 0; i < route.length - 1; i++) {
            total += matrix[route[i]][route[i + 1]];
        }
        return total;
    }
};
exports.RouteService = RouteService;
exports.RouteService = RouteService = RouteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        settings_service_1.SettingsService])
], RouteService);
//# sourceMappingURL=route.service.js.map