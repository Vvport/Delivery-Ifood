import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'rota_session';

/**
 * Protege qualquer rota dentro de /dashboard.
 * Se não houver o cookie de sessão, redireciona para /login.
 *
 * Esse cookie é setado pelo endpoint /api/login após validar
 * usuário/senha (ver app/api/login/route.ts).
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
