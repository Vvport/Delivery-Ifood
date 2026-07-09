import {
  haversineDistance,
  haversineMatrix,
  nearestNeighbor,
  twoOpt,
  nearestNeighborWithTwoOpt,
  sumRouteDistance,
} from './route-algorithm';

describe('route-algorithm', () => {
  const points = [
    { label: 'A', latitude: 0, longitude: 0 },
    { label: 'B', latitude: 0, longitude: 1 },
    { label: 'C', latitude: 1, longitude: 1 },
    { label: 'D', latitude: 1, longitude: 0 },
  ];

  it('calculates haversine distance between two points', () => {
    const distance = haversineDistance(points[0], points[1]);
    expect(distance).toBeGreaterThan(110000);
    expect(distance).toBeLessThan(112000);
  });

  it('builds a symmetric haversine matrix', () => {
    const matrix = haversineMatrix(points);
    expect(matrix.length).toBe(4);
    expect(matrix[0][1]).toBeCloseTo(matrix[1][0]);
    expect(matrix[0][0]).toBe(0);
  });

  it('computes a nearest neighbor route', () => {
    const matrix = haversineMatrix(points);
    const route = nearestNeighbor(matrix);
    expect(route[0]).toBe(0);
    expect(new Set(route).size).toBe(4);
  });

  it('applies 2-opt to improve a route', () => {
    const matrix = haversineMatrix(points);
    const route = [0, 2, 1, 3];
    const optimized = twoOpt(route, matrix);
    expect(optimized).toContain(0);
    expect(optimized.length).toBe(4);
  });

  it('combines nearest neighbor and 2-opt', () => {
    const matrix = haversineMatrix(points);
    const route = nearestNeighborWithTwoOpt(matrix);
    expect(route.length).toBe(4);
    expect(new Set(route).size).toBe(4);
  });

  it('sums route distance correctly', () => {
    const matrix = haversineMatrix(points);
    const route = [0, 1, 2, 3];
    const total = sumRouteDistance(route, matrix);
    expect(total).toBeGreaterThan(300000);
  });
});
