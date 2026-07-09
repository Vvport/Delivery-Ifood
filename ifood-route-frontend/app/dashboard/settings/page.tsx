'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { saveAlertsConfig, DEFAULT_LATE_THRESHOLD } from '@/lib/alerts';
import { useAlertsConfig } from '@/lib/hooks';
import { validateSettings } from '@/lib/api';

interface Settings {
  IFOOD_CLIENT_ID: string;
  IFOOD_CLIENT_SECRET: string;
  IFOOD_MERCHANT_ID: string;
  STORE_CEP: string;
  STORE_NUMBER: string;
  STORE_COMPLEMENT: string;
  OSRM_URL: string;
  MOTOBOY_RATE_PER_KM: string;
}

interface AddressData {
  rua: string;
  bairro: string;
  cidade: string;
}

const EMPTY: Settings = {
  IFOOD_CLIENT_ID: '',
  IFOOD_CLIENT_SECRET: '',
  IFOOD_MERCHANT_ID: '',
  STORE_CEP: '',
  STORE_NUMBER: '',
  STORE_COMPLEMENT: '',
  OSRM_URL: 'https://router.project-osrm.org',
  MOTOBOY_RATE_PER_KM: '1.50',
};

interface SaveResult {
  ok: boolean;
  geocoded?: boolean;
  address?: string;
  latitude?: string;
  longitude?: string;
  geocodeWarning?: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [address, setAddress] = useState<AddressData>({ rua: '', bairro: '', cidade: '' });
  const [cepLoading, setCepLoading] = useState(false);
  // null = nenhum CEP completo digitado | true = válido | false = inválido
  const [cepValid, setCepValid] = useState<boolean | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationOk, setValidationOk] = useState<boolean | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [saveError, setSaveError] = useState('');
  const { lateThresholdMinutes } = useAlertsConfig();
  const [lateThreshold, setLateThreshold] = useState(DEFAULT_LATE_THRESHOLD);
  const [alertsSaved, setAlertsSaved] = useState(false);

  useEffect(() => {
    setLateThreshold(lateThresholdMinutes);
  }, [lateThresholdMinutes]);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(async (data) => {
        const merged = { ...EMPTY, ...data };
        setForm(merged);

        const digits = (merged.STORE_CEP ?? '').replace(/\D/g, '');
        if (digits.length === 8) {
          try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const cep = await res.json();
            if (!cep.erro) {
              setAddress({
                rua: cep.logradouro || '',
                bairro: cep.bairro || '',
                cidade: cep.localidade || '',
              });
              setCepValid(true);
            }
          } catch {
            // silencioso — não bloqueia o carregamento
          }
        }
      })
      .catch(() => setSaveError('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }

  function set(key: keyof Settings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  }

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    set('STORE_CEP', formatted);

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      setCepLoading(true);
      setCepValid(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress({
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
          });
          setCepValid(true);
        } else {
          setAddress({ rua: '', bairro: '', cidade: '' });
          setCepValid(false);
          showToast('CEP não encontrado. Confirme o número e tente novamente.');
        }
      } catch {
        setCepValid(false);
        showToast('Falha ao consultar o CEP. Verifique sua conexão e tente novamente.');
      } finally {
        setCepLoading(false);
      }
    } else {
      setAddress({ rua: '', bairro: '', cidade: '' });
      setCepValid(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cepDigits = form.STORE_CEP.replace(/\D/g, '');
    if (cepDigits.length === 8 && cepValid === false) {
      showToast('CEP inválido. Ajuste o CEP antes de salvar.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setResult(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data: SaveResult = await res.json();
      setResult(data);
    } catch {
      setSaveError('Não foi possível salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleValidateCredentials() {
    setValidating(true);
    setValidationMessage(null);
    setValidationOk(null);
    setSaveError('');
    setResult(null);

    try {
      const data = await validateSettings(form);
      setValidationMessage(data.message);
      setValidationOk(data.ok);
      if (!data.ok) {
        showToast(data.message);
      } else {
        showToast('Credenciais validadas com sucesso. Merchant ID está correto.');
      }
    } catch (err) {
      setValidationMessage('Não foi possível validar as credenciais no momento.');
      setValidationOk(false);
      showToast('Erro na validação das credenciais. Atualize os dados e tente novamente.');
    } finally {
      setValidating(false);
    }
  }

  const cepHasError = cepValid === false;

  return (
    <div className="min-h-screen bg-base flex flex-col">

      {/* Toast flutuante */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-surface border border-accent/40 shadow-2xl shadow-black/50 rounded-2xl px-5 py-4 max-w-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-0.5">Atenção</p>
            <p className="text-sm text-ink leading-snug">{toast}</p>
          </div>
          <button
            onClick={() => setToast('')}
            className="text-muted hover:text-ink transition-colors shrink-0 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <IconSettings />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent leading-none mb-1">
                Central de rotas
              </p>
              <h1 className="font-display text-xl font-bold text-ink leading-none">Configurações</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors px-4 py-2 rounded-xl border border-border hover:border-border/80 hover:bg-surface"
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
          {loading ? (
            <div className="flex items-center gap-3 text-muted py-12">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-sm">Carregando configurações...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Linha principal: iFood + Localização lado a lado */}
              <div className="grid grid-cols-2 gap-6 items-start">

                {/* iFood */}
                <SectionCard label="iFood" title="Credenciais de acesso" icon={<IconLock />}>
                  <Field
                    label="Client ID"
                    value={form.IFOOD_CLIENT_ID}
                    onChange={(v) => set('IFOOD_CLIENT_ID', v)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <Field
                    label="Client Secret"
                    type="password"
                    value={form.IFOOD_CLIENT_SECRET}
                    onChange={(v) => set('IFOOD_CLIENT_SECRET', v)}
                    placeholder="••••••••••••"
                  />
                  <Field
                    label="Merchant ID"
                    value={form.IFOOD_MERCHANT_ID}
                    onChange={(v) => set('IFOOD_MERCHANT_ID', v)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </SectionCard>

                {/* Localização */}
                <SectionCard label="Localização" title="Endereço da loja" icon={<IconPin />}>
                  <div className="grid grid-cols-[1fr_100px] gap-3">
                    {/* Campo CEP com estado de erro */}
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.STORE_CEP}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          inputMode="numeric"
                          className={[
                            'w-full rounded-lg bg-base border px-3 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 transition font-mono text-sm pr-9',
                            cepHasError
                              ? 'border-accent focus:ring-accent/40 focus:border-accent'
                              : 'border-border focus:ring-accent/40 focus:border-accent',
                          ].join(' ')}
                        />
                        {cepLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                          </div>
                        )}
                        {!cepLoading && cepValid === true && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {!cepLoading && cepHasError && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {cepHasError && (
                        <p className="mt-1.5 text-xs text-accent">CEP não encontrado.</p>
                      )}
                    </div>
                    <Field
                      label="Número"
                      value={form.STORE_NUMBER}
                      onChange={(v) => set('STORE_NUMBER', v)}
                      placeholder="100"
                    />
                  </div>

                  {/* Campos de endereço — sempre visíveis */}
                  <div className="rounded-xl border border-border/50 bg-base/40 p-4 space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted/50">
                      Endereço
                    </p>
                    <ReadonlyField
                      label="Rua"
                      value={address.rua}
                      placeholder="Preenchido ao digitar o CEP"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <ReadonlyField label="Bairro" value={address.bairro} placeholder="—" />
                      <ReadonlyField label="Cidade" value={address.cidade} placeholder="—" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted/70 mb-1">
                        Complemento
                        <span className="ml-1.5 text-[10px] font-normal text-muted/40 uppercase tracking-wide">opcional</span>
                      </label>
                      <input
                        type="text"
                        value={form.STORE_COMPLEMENT}
                        onChange={(e) => set('STORE_COMPLEMENT', e.target.value)}
                        placeholder="Apto, sala, bloco..."
                        className="w-full rounded-lg bg-base border border-border px-3 py-2 text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition font-mono text-sm"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted/50 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Coordenadas obtidas automaticamente pelo CEP e número ao salvar.
                  </p>
                </SectionCard>
              </div>

              {/* Alertas */}
              <SectionCard label="Alertas" title="Controle de atrasos" icon={<IconBell />}>
                <div className="grid grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      Tempo limite para alerta (minutos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={lateThreshold}
                      onChange={(e) => {
                        const val = Math.max(5, Math.min(240, Number(e.target.value) || DEFAULT_LATE_THRESHOLD));
                        setLateThreshold(val);
                        saveAlertsConfig({ lateThresholdMinutes: val });
                        setAlertsSaved(true);
                        setTimeout(() => setAlertsSaved(false), 2000);
                      }}
                      className="w-full rounded-lg bg-base border border-border px-3 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition font-mono text-sm"
                    />
                    {alertsSaved && (
                      <p className="mt-1.5 text-xs text-success flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvo automaticamente
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted/50 flex items-start gap-1.5 pt-7">
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pedidos aguardando mais do que esse tempo são marcados como atrasados no dashboard. Padrão: {DEFAULT_LATE_THRESHOLD} minutos.
                  </p>
                </div>
              </SectionCard>

              {/* Roteamento — largura total */}
              <SectionCard label="Roteamento" title="Servidor de rotas" icon={<IconRoute />}>
                <div className="grid grid-cols-2 gap-6 items-start">
                  <Field
                    label="Servidor OSRM"
                    value={form.OSRM_URL}
                    onChange={(v) => set('OSRM_URL', v)}
                    placeholder="https://router.project-osrm.org"
                  />
                  <Field
                    label="Tarifa do motoboy (R$/km)"
                    type="number"
                    inputMode="decimal"
                    value={form.MOTOBOY_RATE_PER_KM}
                    onChange={(v) => set('MOTOBOY_RATE_PER_KM', v)}
                    placeholder="1.50"
                  />
                </div>
                <p className="text-xs text-muted/50 flex items-start gap-1.5 pt-7">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  O servidor público serve para testes. Em produção, use uma instância própria.
                </p>
              </SectionCard>

              {/* Feedback salvar */}
              {saveError && (
                <div className="flex items-center gap-2.5 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3" role="alert">
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-accent">{saveError}</p>
                </div>
              )}
              {validationMessage && (
                <div
                  className={[
                    'flex items-center gap-2.5 rounded-xl px-4 py-3',
                    validationOk ? 'bg-success/10 border border-success/20 text-success' : 'bg-accent/10 border border-accent/30 text-accent',
                  ].join(' ')}
                  role="alert"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {validationOk ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <p className="text-sm">{validationMessage}</p>
                </div>
              )}
              {result?.ok && !saveError && (
                <div className="flex items-center gap-2.5 rounded-xl bg-success/10 border border-success/20 px-4 py-3">
                  <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-success">Configurações salvas com sucesso.</p>
                </div>
              )}

              <div className="flex justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={validating}
                  onClick={handleValidateCredentials}
                  className="flex items-center gap-2 rounded-xl bg-surface border border-border text-ink font-semibold px-5 py-3 text-sm transition-all hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? 'Validando...' : 'Validar credenciais'}
                </button>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || cepHasError}
                    className="flex items-center gap-2 rounded-xl bg-accent text-ink font-bold px-10 py-3 text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvar configurações
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-base/30">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent leading-none mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-ink leading-none">{title}</p>
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-lg bg-base border border-border px-3 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition font-mono text-sm"
      />
    </div>
  );
}

function ReadonlyField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted/70 mb-1">{label}</label>
      <div className="rounded-lg border border-border/40 bg-surface/50 px-3 py-2 font-mono text-sm min-h-[36px] flex items-center">
        {value ? (
          <span className="text-ink">{value}</span>
        ) : (
          <span className="text-muted/40 italic text-xs">{placeholder}</span>
        )}
      </div>
    </div>
  );
}

function IconSettings() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
