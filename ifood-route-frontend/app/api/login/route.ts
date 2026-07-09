import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'rota_session';

/**
 * Login simples por usuário/senha fixos no .env.
 *
 * Para uma única loja isso é suficiente como ponto de partida.
 * Se no futuro houver mais de um usuário (ex: cada motoboy logando
 * pra ver sua própria rota), troque por uma tabela de usuários
 * com senha em hash (bcrypt) + JWT.
 */
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const validUsername = process.env.APP_USERNAME;
  const validPassword = process.env.APP_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 horas
  });

  return response;
}
