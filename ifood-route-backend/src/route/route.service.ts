import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DeliveryOrder } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
import {
  RoutePoint,
  OptimizedRoute,
  haversineMatrix,
  nearestNeighborWithTwoOpt,
  sumRouteDistance,
  decodePolyline,
} from './route-algorithm';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    private readonly http: HttpService,
    private readonly settings: SettingsService,
  ) {}

  async optimize(orders: DeliveryOrder[]): Promise<OptimizedRoute> {
    const storeLat = Number(await this.settings.get('STORE_LATITUDE'));
    const storeLng = Number(await this.settings.get('STORE_LONGITUDE'));

    const points: RoutePoint[] = [
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
    const orderedIndexes = nearestNeighborWithTwoOpt(matrix);

    const stops = orderedIndexes.map((i) => points[i]);
    const totalDistanceMeters = sumRouteDistance(orderedIndexes, matrix);
    const path = await this.buildRoutePath(stops);

    return { stops, totalDistanceMeters, path };
  }

  private async getDistanceMatrix(points: RoutePoint[]): Promise<number[][]> {
    const osrmUrl = (await this.settings.get('OSRM_URL')) ?? 'https://router.project-osrm.org';
    const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(';');

    try {
      const response = await firstValueFrom(
        this.http.get(`${osrmUrl}/table/v1/driving/${coords}`, {
          params: { annotations: 'distance' },
        }),
      );
      return response.data.distances as number[][];
    } catch {
      this.logger.warn('OSRM indisponível, usando distância em linha reta (haversine)');
      return haversineMatrix(points);
    }
  }

  private async buildRoutePath(stops: RoutePoint[]): Promise<RoutePoint[]> {
    if (stops.length <= 1) {
      return stops;
    }

    const osrmUrl = (await this.settings.get('OSRM_URL')) ?? 'https://router.project-osrm.org';
    const coords = stops.map((p) => `${p.longitude},${p.latitude}`).join(';');

    try {
      const response = await firstValueFrom(
        this.http.get(`${osrmUrl}/route/v1/driving/${coords}`, {
          params: {
            overview: 'full',
            geometries: 'polyline',
          },
        }),
      );

      const geometry = response.data.routes?.[0]?.geometry;
      if (!geometry) {
        throw new Error('OSRM não retornou geometria');
      }

      return decodePolyline(geometry);
    } catch (err) {
      this.logger.warn('Não foi possível obter geometria da rota OSRM, usando caminho direto');
      return stops;
    }
  }
}
