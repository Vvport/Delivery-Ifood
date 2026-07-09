export interface DeliveryOrder {
  orderId: string;
  displayId: string;
  customerName: string;
  address: {
    formatted: string;
    neighborhood?: string;
    city?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export interface RouteStop {
  label: string;
  latitude: number;
  longitude: number;
  orderId?: string;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistanceMeters: number;
}

/**
 * Wrapper padronizado para as chamadas Fetch à API local (/api).
 * Centraliza o tratamento de erros HTTP e faz o parse automático do JSON,
 * evitando duplicação de rotinas nos métodos de dados individuais.
 */
export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`Falha na requisição: ${res.statusText || res.status}`);
  if (res.status === 204) return undefined as any;
  return res.json();
}

export async function getPendingOrders(): Promise<DeliveryOrder[]> {
  return apiFetch<DeliveryOrder[]>('/api/orders', { cache: 'no-store' });
}

export async function getOptimizedRoute(): Promise<OptimizedRoute> {
  return apiFetch<OptimizedRoute>('/api/route/optimize', { cache: 'no-store' });
}

export async function removeOrder(orderId: string): Promise<void> {
  return apiFetch<void>(`/api/orders/${orderId}`, { method: 'DELETE' });
}
