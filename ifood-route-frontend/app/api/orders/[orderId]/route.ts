import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3000';
const API_KEY = process.env.API_KEY ?? '';

export async function DELETE(_req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  try {
    const res = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : { removed: orderId };
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ removed: orderId }, { status: 503 });
  }
}
