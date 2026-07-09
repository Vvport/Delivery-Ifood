'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { clearHistory, DeliveryHistoryEntry } from '@/lib/history';
import { useDeliveryHistory } from '@/lib/hooks';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const history = useDeliveryHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleClear() {
    if (!window.confirm('Deseja apagar todo o histórico de entregas?')) return;
    clearHistory();
  }

  const grouped = new Map<string, DeliveryHistoryEntry[]>();
  history.forEach((entry) => {
    const date = formatDate(entry.deliveredAt);
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(entry);
  });

  const today = formatDate(new Date().toISOString());
  const todayEntries = grouped.get(today) ?? [];
  const avgWait =
    todayEntries.length > 0
      ? Math.round(todayEntries.reduce((sum, e) => sum + e.waitMinutes, 0) / todayEntries.length)
      : 0;

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <IconClock />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent leading-none mb-1">
                Central de rotas
              </p>
              <h1 className="font-display text-xl font-bold text-ink leading-none">
                Histórico de entregas
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors px-4 py-2 rounded-xl border border-border hover:bg-surface"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-10">
          {!mounted ? (
            <div className="flex items-center gap-3 text-muted py-12">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-sm">Carregando histórico...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
                <IconClock size={28} />
              </div>
              <p className="text-muted text-sm">Nenhuma entrega registrada ainda.</p>
              <p className="text-muted/50 text-xs mt-1">
                As entregas marcadas como concluídas no dashboard aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Entregas hoje" value={String(todayEntries.length)} unit="pedidos" />
                <StatCard label="Tempo médio hoje" value={String(avgWait)} unit="min" />
                <StatCard label="Total registrado" value={String(history.length)} unit="entregas" />
              </div>

              {/* Ações */}
              <div className="flex justify-end">
                <button
                  onClick={handleClear}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Limpar histórico
                </button>
              </div>

              {/* Entregas agrupadas por data */}
              {Array.from(grouped.entries()).map(([date, entries]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted font-mono">
                      {entries.length} entrega{entries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {entries.map((entry, i) => (
                      <HistoryCard key={`${entry.orderId}-${i}`} entry={entry} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold text-ink">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
    </div>
  );
}

function HistoryCard({ entry }: { entry: DeliveryHistoryEntry }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-sm">#{entry.displayId}</span>
          <span className="font-mono text-xs text-muted">{formatTime(entry.deliveredAt)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted">{entry.customerName}</p>
        <p className="mt-1 text-sm text-ink/90 truncate">{entry.address}</p>
        {entry.neighborhood && (
          <p className="text-xs text-muted">
            {entry.neighborhood}
            {entry.city ? ` · ${entry.city}` : ''}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-xs text-muted">aguardou</p>
        <p className="font-mono text-sm font-semibold text-ink">{entry.waitMinutes} min</p>
      </div>
    </div>
  );
}

function IconClock({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
