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
  path: RouteStop[];
}

export interface AppSettings {
  IFOOD_CLIENT_ID: string;
  IFOOD_CLIENT_SECRET: string;
  IFOOD_MERCHANT_ID: string;
  STORE_CEP: string;
  STORE_NUMBER: string;
  STORE_COMPLEMENT: string;
  OSRM_URL: string;
  MOTOBOY_RATE_PER_KM: string;
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

export async function getAppSettings(): Promise<AppSettings> {
  return apiFetch<AppSettings>('/api/settings', { cache: 'no-store' });
}

export async function validateSettings(
  settings: AppSettings,
): Promise<{ ok: boolean; message: string }> {
  return apiFetch<{ ok: boolean; message: string }>('/api/settings/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
