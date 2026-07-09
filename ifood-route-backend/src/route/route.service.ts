import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
      return { stops: points, totalDistanceMeters: 0 };
    }

    const matrix = await this.getDistanceMatrix(points);
    const orderedIndexes = this.nearestNeighborWithTwoOpt(matrix);

    const stops = orderedIndexes.map((i) => points[i]);
    const totalDistanceMeters = this.sumRouteDistance(orderedIndexes, matrix);

    return { stops, totalDistanceMeters };
  }

  private async getDistanceMatrix(points: RoutePoint[]): Promise<number[][]> {
    const osrmUrl =
      (await this.settings.get('OSRM_URL')) ?? 'https://router.project-osrm.org';
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
      return this.haversineMatrix(points);
    }
  }

  private haversineMatrix(points: RoutePoint[]): number[][] {
    return points.map((a) => points.map((b) => this.haversineDistance(a, b)));
  }

  private haversineDistance(a: RoutePoint, b: RoutePoint): number {
    const R = 6371000;
    const dLat = this.toRad(b.latitude - a.latitude);
    const dLng = this.toRad(b.longitude - a.longitude);
    const lat1 = this.toRad(a.latitude);
    const lat2 = this.toRad(b.latitude);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private nearestNeighbor(matrix: number[][]): number[] {
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

  private nearestNeighborWithTwoOpt(matrix: number[][]): number[] {
    return this.twoOpt(this.nearestNeighbor(matrix), matrix);
  }

  /**
   * Otimiza a rota local usando a heurística 2-Opt.
   * Ele desfaz cruzamentos na rota iterativamente invertendo segmentos,
   * reduzindo a distância total. Executa até não haver melhoria possível.
   */
  private twoOpt(route: number[], matrix: number[][]): number[] {
    const n = route.length;
    let improved = true;

    while (improved) {
      improved = false;

      for (let i = 1; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
          const a = route[i - 1], b = route[i];
          const c = route[j], d = route[j + 1];

          if (matrix[a][c] + matrix[b][d] < matrix[a][b] + matrix[c][d]) {
            // Swap in-place em memória para ganho extremo de performance (evita cópias de array)
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

  private sumRouteDistance(route: number[], matrix: number[][]): number {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += matrix[route[i]][route[i + 1]];
    }
    return total;
  }
}
