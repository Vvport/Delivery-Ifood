'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const css = `
  @keyframes au {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .au    { animation: au 0.5s ease both; }
  .au-d1 { animation: au 0.5s 0.10s ease both; }
  .au-d2 { animation: au 0.5s 0.20s ease both; }
  .au-d3 { animation: au 0.5s 0.30s ease both; }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 13px 14px 13px 42px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.22); }
  .field-input:focus {
    border-color: rgba(234,29,44,0.5);
    box-shadow: 0 0 0 3px rgba(234,29,44,0.12);
  }

  .social-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  .social-btn:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.18);
  }
`;

const RED = '#EA1D2C';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Usuário ou senha incorretos. Verifique suas credenciais.');
        return;
      }
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen flex flex-col" style={{ background: '#0D0F16' }}>

        {/* ── MAIN ROW ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══════════════════════════════════
              LEFT PANEL
          ══════════════════════════════════ */}
          <div className="hidden lg:flex flex-col relative flex-1 overflow-hidden"
            style={{ background: '#0D0F16' }}>

            {/* Red radial glow on the left edge */}
            <div className="absolute inset-y-0 left-0 pointer-events-none" style={{
              width: '55%',
              background: 'radial-gradient(ellipse at 0% 50%, rgba(234,29,44,0.32) 0%, transparent 70%)',
            }} />

            {/* Logo — top left */}
            <div className="relative z-10 flex items-center gap-2.5 px-14 pt-12 au">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24"
                stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-[0.28em]"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Central de Rotas
              </span>
            </div>

            {/* Route illustration — fills the panel */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <svg className="w-full h-full" viewBox="0 0 660 820"
                preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="glow-pin">
                    <feGaussianBlur stdDeviation="7" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="glow-line">
                    <feGaussianBlur stdDeviation="3.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <radialGradient id="pin-base" cx="50%" cy="80%" r="50%">
                    <stop offset="0%" stopColor={RED} stopOpacity="0.35"/>
                    <stop offset="100%" stopColor={RED} stopOpacity="0"/>
                  </radialGradient>
                </defs>

                {/* Wavy route line */}
                <path
                  d="M430,155 C455,220 415,285 400,360 C385,435 445,475 425,550 C405,625 345,650 310,710"
                  stroke={RED} strokeWidth="2.5" fill="none" filter="url(#glow-line)"
                  opacity="0.88"
                />

                {/* ── TOP PIN ── */}
                <g filter="url(#glow-pin)" transform="translate(393,88)">
                  {/* Base oval shadow */}
                  <ellipse cx="37" cy="108" rx="22" ry="9" fill="rgba(0,0,0,0.45)"/>
                  <ellipse cx="37" cy="104" rx="16" ry="6" fill={RED} opacity="0.2"/>
                  {/* Pin teardrop */}
                  <path d="M37 0C22.1 0 10 12.1 10 27C10 47.3 37 78 37 78C37 78 64 47.3 64 27C64 12.1 51.9 0 37 0Z"
                    fill={RED}/>
                  {/* Inner white ring */}
                  <circle cx="37" cy="27" r="14" fill="white" opacity="0.15"/>
                  {/* Inner dark circle */}
                  <circle cx="37" cy="27" r="10" fill="#1a0406"/>
                  {/* Inner red dot */}
                  <circle cx="37" cy="27" r="5" fill={RED}/>
                  {/* Glare highlight */}
                  <ellipse cx="30" cy="18" rx="5" ry="3.5" fill="white" opacity="0.25"
                    transform="rotate(-30 30 18)"/>
                </g>

                {/* ── BOTTOM PIN ── */}
                <g filter="url(#glow-pin)" transform="translate(273,643)">
                  <ellipse cx="37" cy="108" rx="22" ry="9" fill="rgba(0,0,0,0.45)"/>
                  <ellipse cx="37" cy="104" rx="16" ry="6" fill={RED} opacity="0.2"/>
                  <path d="M37 0C22.1 0 10 12.1 10 27C10 47.3 37 78 37 78C37 78 64 47.3 64 27C64 12.1 51.9 0 37 0Z"
                    fill={RED}/>
                  <circle cx="37" cy="27" r="14" fill="white" opacity="0.15"/>
                  <circle cx="37" cy="27" r="10" fill="#1a0406"/>
                  <circle cx="37" cy="27" r="5" fill={RED}/>
                  <ellipse cx="30" cy="18" rx="5" ry="3.5" fill="white" opacity="0.25"
                    transform="rotate(-30 30 18)"/>
                </g>
              </svg>
            </div>

            {/* Headline — bottom left */}
            <div className="relative z-10 mt-auto px-14 pb-14 au-d1">
              <h1 className="text-[52px] xl:text-[58px] font-bold text-white leading-[1.08] tracking-tight">
                Entregas mais<br />rápidas, rotas<br />
                <span style={{ color: RED }}>mais inteligentes.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed max-w-[380px]"
                style={{ color: 'rgba(255,255,255,0.40)' }}>
                Visualize pedidos do iFood em tempo real e calcule a rota
                otimizada para seus entregadores.
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════
              RIGHT PANEL — dark card
          ══════════════════════════════════ */}
          <div
            className="flex items-center justify-center w-full lg:w-[520px] xl:w-[560px] shrink-0 px-8 py-10"
            style={{
              background: '#13151F',
              boxShadow: '-1px 0 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="w-full max-w-[400px]">

              {/* Logo centered */}
              <div className="flex flex-col items-center mb-8 au">
                <div className="flex items-center gap-2.5 mb-5">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                    stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-mono text-xs uppercase tracking-[0.28em]"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Central de Rotas
                  </span>
                </div>
                <h2 className="text-[28px] font-bold text-white text-center">
                  Bem-vindo de volta
                </h2>
                <p className="mt-2 text-[13.5px] text-center leading-relaxed max-w-[280px]"
                  style={{ color: 'rgba(255,255,255,0.40)' }}>
                  Acesse sua central de entregas e acompanhe suas rotas em tempo real.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 au-d1">

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm mb-1.5"
                    style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Usuário
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.28)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </span>
                    <input
                      id="username" type="text" autoComplete="username"
                      value={username} onChange={e => setUsername(e.target.value)}
                      required placeholder="Digite seu usuário"
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm mb-1.5"
                    style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Senha
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.28)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                    <input
                      id="password" type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required placeholder="Digite sua senha"
                      className="field-input"
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                      style={{ color: 'rgba(255,255,255,0.32)' }}>
                      {showPw ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: RED }}
                    />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                      Lembrar-me
                    </span>
                  </label>
                  <button type="button" className="text-sm transition-colors"
                    style={{ color: RED }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    Esqueci minha senha
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(234,29,44,0.10)', border: '1px solid rgba(234,29,44,0.25)' }}
                    role="alert">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24" style={{ color: RED }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <p className="text-sm" style={{ color: RED }}>{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3.5 font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: RED, boxShadow: '0 4px 18px rgba(234,29,44,0.30)' }}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Social login */}
              <div className="mt-5 au-d2">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}/>
                  <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    ou continue com
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}/>
                </div>
                <div className="flex gap-3">
                  <button className="social-btn">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button className="social-btn">
                    <svg className="w-4 h-4" viewBox="0 0 21 21">
                      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
                      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    Microsoft
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-6 pt-5 grid grid-cols-3 gap-2 au-d3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke={RED} viewBox="0 0 24 24" strokeWidth="1.7">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>,
                    value: '1.248', label: 'Pedidos monitorados hoje',
                  },
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>,
                    value: '842', label: 'Entregas realizadas',
                  },
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>,
                    value: 'R$ 2.350', label: 'Economia estimada de rota',
                  },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1.5">
                    {icon}
                    <p className="font-bold text-white text-sm leading-none">{value}</p>
                    <p className="text-[11px] leading-tight"
                      style={{ color: 'rgba(255,255,255,0.32)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="hidden lg:flex items-center justify-between px-14 py-3.5 shrink-0"
          style={{
            background: '#0D0F16',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
          <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>
            &copy; {new Date().getFullYear()}{' '}
            <span style={{ color: RED }}>Central de Rotas.</span>{' '}
            Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"/>
              <span className="relative inline-flex rounded-full w-2 h-2 bg-green-400"/>
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
              Sistema operacional
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Versão 1.0.0
          </p>
        </div>
      </div>
    </>
  );
}
