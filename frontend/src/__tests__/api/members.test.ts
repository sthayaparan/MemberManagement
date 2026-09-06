import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/members/route';
import { GET as GET_BY_ID, DELETE } from '@/app/api/members/[id]/route';

beforeEach(() => {
  vi.clearAllMocks();
});

function backendJson(body: unknown, status = 200) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    status,
    json: async () => body,
  } as Response);
}

describe('members proxy routes', () => {
  it('GET forwards the backend list and status', async () => {
    backendJson({ data: [{ id: 1 }] });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: 1 }] });
  });

  it('POST forwards the backend status (201)', async () => {
    backendJson({ data: { id: 5 } }, 201);
    const res = await POST(
      new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ firstName: 'A' }),
      })
    );
    expect(res.status).toBe(201);
  });

  it('GET by id forwards a 404 error envelope unchanged', async () => {
    backendJson({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' }, 404);
    const res = await GET_BY_ID(new Request('http://localhost/api/members/9'), {
      params: Promise.resolve({ id: '9' }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
  });

  it('DELETE passes through a 204 with no body', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ status: 204 } as Response);
    const res = await DELETE(new Request('http://localhost/api/members/1'), {
      params: Promise.resolve({ id: '1' }),
    });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('returns a 502 envelope when the backend is unreachable', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await GET();
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe('BACKEND_UNAVAILABLE');
  });
});
