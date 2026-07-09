'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { getWaitMinutes, isOrderLate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  DeliveryOrder,
  OptimizedRoute,
  getPendingOrders,
  getOptimizedRoute,
  removeOrder,
} from '@/lib/api';
import Link from 'next/link';
import { OrdersList } from '@/components/OrdersList';
import { SearchingOrders } from '@/components/SearchingOrders';
import { ThemeToggle } from '@/components/ThemeToggle';
import { addToHistory } from '@/lib/history';
import { DEFAULT_LATE_THRESHOLD } from '@/lib/alerts';
import { useAlertsConfig } from '@/lib/hooks';

const RouteMap = dynamic(
  () => import('@/components/RouteMap').then((m) => m.RouteMap),
  { ssr: false },
);

const REFRESH_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const router = useRouter();

  const { data, error: swrError, mutate } = useSWR('dashboardData', async () => {
    const [pendingOrders, optimizedRoute] = await Promise.all([
      getPendingOrders(),
      getOptimizedRoute(),
    ]);
    return { orders: pendingOrders, route: optimizedRoute };
  }, { refreshInterval: REFRESH_INTERVAL_MS });

  const orders = data?.orders ?? [];
  const route = data?.route ?? null;
  const loading = !data && !swrError;
  const error = swrError ? 'Não foi possível conectar ao servidor de pedidos. Verifique se o backend está rodando.' : '';

  const [viewMode, setViewMode] = useState<'route' | 'region'>('route');
  const { lateThresholdMinutes } = useAlertsConfig();

  async function handleRemove(orderId: string) {
    const order = orders.find((o) => o.orderId === orderId);
    try {
      await removeOrder(orderId);
      if (order) {
        addToHistory({
          orderId: order.orderId,
          displayId: order.displayId,
          customerName: order.customerName,
          address: order.address.formatted,
          neighborhood: order.address.neighborhood,
          city: order.address.city,
          deliveredAt: new Date().toISOString(),
          createdAt: order.createdAt,
          waitMinutes: getWaitMinutes(order.createdAt, Date.now()),
        });
      }
      mutate();
    } catch (e) {
      console.error('Erro ao remover pedido', e);
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  const hasOrders = orders.length > 0;
  const distanceKm = route ? (route.totalDistanceMeters / 1000).toFixed(1) : '0';

  const now = Date.now();
  const lateCount = orders.filter((o) => isOrderLate(o.createdAt, now, lateThresholdMinutes)).length;

  return (
    <div className="h-screen flex flex-col">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Central de rotas
          </span>
          <h1 className="font-display text-xl font-700">Rota de entregas</h1>
        </div>

        <div className="flex items-center gap-4">
          {lateCount > 0 && (
            <div className="flex items-center gap-1.5 text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-mono text-xs font-semibold">
                {lateCount} atrasado{lateCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {hasOrders && (
            <div className="text-right">
              <p className="font-mono text-sm">{distanceKm} km</p>
              <p className="text-xs text-muted">distância total</p>
            </div>
          )}

          <Link href="/dashboard/history" className="text-sm text-muted hover:text-ink transition">
            Histórico
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-muted hover:text-ink transition"
          >
            Configurações
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-ink transition"
          >
            Sair
          </button>
          <ThemeToggle />
        </div>
      </header>

      {error && (
        <div className="px-6 py-3 bg-accent/10 border-b border-accent/20 text-sm text-accent">
          {error}
        </div>
      )}

      {/* Conteúdo */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] overflow-hidden">
        {/* Painel lateral */}
        <section className="border-r border-border flex flex-col overflow-hidden">
          {/* Toggle de visão */}
          {hasOrders && !loading && (
            <div className="flex gap-1 p-3 border-b border-border bg-base/50 shrink-0">
              <button
                onClick={() => setViewMode('route')}
                className={[
                  'flex-1 text-xs font-mono py-1.5 px-3 rounded-lg transition-colors',
                  viewMode === 'route'
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                Por rota
              </button>
              <button
                onClick={() => setViewMode('region')}
                className={[
                  'flex-1 text-xs font-mono py-1.5 px-3 rounded-lg transition-colors',
                  viewMode === 'region'
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                Por região
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-sm text-muted">Carregando...</p>
            ) : hasOrders ? (
              <OrdersList
                orders={orders}
                stops={route?.stops ?? []}
                onRemove={handleRemove}
                viewMode={viewMode}
                lateThresholdMinutes={lateThresholdMinutes}
              />
            ) : (
              <SearchingOrders />
            )}
          </div>
        </section>

        {/* Mapa */}
        <section className="relative">
          {hasOrders && route ? (
            <RouteMap stops={route.stops} />
          ) : (
            <div className="h-full flex items-center justify-center bg-surface">
              {!loading && <SearchingOrders />}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
