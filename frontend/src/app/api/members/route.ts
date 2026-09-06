import { proxyToBackend } from '@/lib/backend';

export async function GET() {
  return proxyToBackend('/members');
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyToBackend('/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
