const ALERTS_KEY = 'rota_alerts_config';

export const DEFAULT_LATE_THRESHOLD = 45;

export interface AlertsConfig {
  lateThresholdMinutes: number;
}

export function getAlertsConfig(): AlertsConfig {
  if (typeof window === 'undefined') return { lateThresholdMinutes: DEFAULT_LATE_THRESHOLD };
  try {
    const stored = localStorage.getItem(ALERTS_KEY);
    if (!stored) return { lateThresholdMinutes: DEFAULT_LATE_THRESHOLD };
    const parsed = JSON.parse(stored);
    return {
      lateThresholdMinutes: Number(parsed.lateThresholdMinutes) || DEFAULT_LATE_THRESHOLD,
    };
  } catch {
    return { lateThresholdMinutes: DEFAULT_LATE_THRESHOLD };
  }
}

export function saveAlertsConfig(config: AlertsConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALERTS_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('storage'));
}
