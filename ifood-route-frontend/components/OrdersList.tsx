import { DeliveryOrder, RouteStop } from '@/lib/api';
import { getWaitMinutes, isOrderLate } from '@/lib/utils';

interface OrdersListProps {
  orders: DeliveryOrder[];
  stops: RouteStop[];
  onRemove: (orderId: string) => void;
  viewMode: 'route' | 'region';
  lateThresholdMinutes: number;
  removingOrderId?: string | null;
}

export function OrdersList({
  orders,
  stops,
  onRemove,
  viewMode,
  lateThresholdMinutes,
  removingOrderId,
}: OrdersListProps) {
  const now = Date.now();

  if (viewMode === 'region') {
    const grouped = new Map<string, { order: DeliveryOrder; routePosition: number | null }[]>();

    orders.forEach((order) => {
      const region = order.address.neighborhood || 'Sem bairro definido';
      if (!grouped.has(region)) grouped.set(region, []);
      const stopIndex = stops.findIndex((s) => s.orderId === order.orderId);
      grouped.get(region)!.push({ order, routePosition: stopIndex > 0 ? stopIndex : null });
    });

    grouped.forEach((items) =>
      items.sort((a, b) => {
        if (a.routePosition === null) return 1;
        if (b.routePosition === null) return -1;
        return a.routePosition - b.routePosition;
      }),
    );

    return (
      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([region, items]) => (
          <div key={region}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {region}
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted font-mono">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map(({ order, routePosition }) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  position={routePosition}
                  waitMinutes={getWaitMinutes(order.createdAt, now)}
                  late={isOrderLate(order.createdAt, now, lateThresholdMinutes)}
                  onRemove={onRemove}
                  removing={removingOrderId === order.orderId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Visão por rota (padrão)
  // stops[0] é a loja, então o pedido N corresponde a stops[N]
  const ordersMap = new Map(orders.map((o) => [o.orderId, o]));
  const ordered = stops
    .slice(1)
    .map((stop, index) => {
      const order = stop.orderId ? ordersMap.get(stop.orderId) : undefined;
      return order ? { order, position: index + 1 } : null;
    })
    .filter((item): item is { order: DeliveryOrder; position: number } => !!item);

  return (
    <div className="space-y-3">
      {ordered.map(({ order, position }) => (
        <OrderCard
          key={order.orderId}
          order={order}
          position={position}
          waitMinutes={getWaitMinutes(order.createdAt, now)}
          late={isOrderLate(order.createdAt, now, lateThresholdMinutes)}
          onRemove={onRemove}
          removing={removingOrderId === order.orderId}
        />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  position,
  waitMinutes,
  late,
  onRemove,
  removing,
}: {
  order: DeliveryOrder;
  position: number | null;
  waitMinutes: number;
  late: boolean;
  onRemove: (id: string) => void;
  removing?: boolean;
}) {
  return (
    <div
      className={[
        'bg-surface border rounded-xl p-4 flex gap-3 transition-colors',
        late ? 'border-accent/40' : 'border-border',
      ].join(' ')}
    >
      {position !== null ? (
        <div className="route-marker shrink-0">{position}</div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-border/60 flex items-center justify-center text-xs text-muted shrink-0 font-mono mt-0.5">
          ?
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-700 text-sm">#{order.displayId}</span>
          <span className="font-mono text-xs text-muted truncate">{order.customerName}</span>
        </div>

        <p className="mt-1 text-sm text-ink/90 truncate">{order.address.formatted}</p>
        {order.address.neighborhood && (
          <p className="text-xs text-muted">
            {order.address.neighborhood}
            {order.address.city ? ` · ${order.address.city}` : ''}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <span
            className={[
              'flex items-center gap-1 text-xs font-mono shrink-0',
              late ? 'text-accent font-semibold' : 'text-muted',
            ].join(' ')}
          >
            {late && (
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {waitMinutes}min aguardando
          </span>
          <button
            onClick={() => onRemove(order.orderId)}
            className={[
              'text-xs font-medium shrink-0 transition',
              removing ? 'text-muted cursor-not-allowed' : 'text-accent hover:underline',
            ].join(' ')}
            disabled={removing}
          >
            {removing ? 'Removendo...' : 'Marcar como entregue'}
          </button>
        </div>
      </div>
    </div>
  );
}
