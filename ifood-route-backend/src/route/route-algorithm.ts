export interface RoutePoint {
  label: string;
  latitude: number;
  longitude: number;
  orderId?: string;
}

export interface OptimizedRoute {
  stops: RoutePoint[];
  totalDistanceMeters: number;
  path: RoutePoint[];
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(a: RoutePoint, b: RoutePoint): number {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export function haversineMatrix(points: RoutePoint[]): number[][] {
  return points.map((a) => points.map((b) => haversineDistance(a, b)));
}

export function nearestNeighbor(matrix: number[][]): number[] {
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

export function twoOpt(route: number[], matrix: number[][]): number[] {
  const n = route.length;
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n - 1; j++) {
        const a = route[i - 1];
        const b = route[i];
        const c = route[j];
        const d = route[j + 1];

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

export function nearestNeighborWithTwoOpt(matrix: number[][]): number[] {
  return twoOpt(nearestNeighbor(matrix), matrix);
}

export function sumRouteDistance(route: number[], matrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += matrix[route[i]][route[i + 1]];
  }
  return total;
}

export function decodePolyline(encoded: string): RoutePoint[] {
  let index = 0;
  const points: RoutePoint[] = [];
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
