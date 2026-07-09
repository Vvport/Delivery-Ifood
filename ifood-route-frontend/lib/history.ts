export interface DeliveryHistoryEntry {
  orderId: string;
  displayId: string;
  customerName: string;
  address: string;
  neighborhood?: string;
  city?: string;
  deliveredAt: string;
  createdAt: string;
  waitMinutes: number;
}

const HISTORY_KEY = 'rota_delivery_history';
const MAX_ENTRIES = 500;

export function addToHistory(entry: DeliveryHistoryEntry): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_ENTRIES) history.splice(MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event('storage'));
}

export function getHistory(): DeliveryHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('storage'));
}
