import { useState, useEffect } from 'react';
import { getHistory, DeliveryHistoryEntry } from './history';
import { getAlertsConfig, AlertsConfig } from './alerts';

/**
 * Hook customizado que lê o histórico do LocalStorage e se inscreve no
 * evento 'storage' nativo do window. Isso garante que caso outra aba
 * modifique o histórico, o estado desta aba será atualizado em tempo real.
 */
export function useDeliveryHistory(): DeliveryHistoryEntry[] {
  const [history, setHistory] = useState<DeliveryHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    const handleStorage = () => setHistory(getHistory());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return history;
}

/**
 * Hook que expõe as configurações de alertas ativas. Sincroniza
 * automaticamente as mudanças de propriedades de atraso feitas em
 * painéis abertos em outras guias do mesmo navegador.
 */
export function useAlertsConfig(): AlertsConfig {
  const [config, setConfig] = useState<AlertsConfig>(getAlertsConfig());

  useEffect(() => {
    setConfig(getAlertsConfig());
    const handleStorage = () => setConfig(getAlertsConfig());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return config;
}
