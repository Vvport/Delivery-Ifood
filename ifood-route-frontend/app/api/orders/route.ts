import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3000';
const API_KEY = process.env.API_KEY ?? '';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/orders`, {
      headers: { 'x-api-key': API_KEY },
      cache: 'no-store',
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 503 });
  }
}
