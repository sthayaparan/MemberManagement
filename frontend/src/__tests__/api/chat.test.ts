import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';

function chatRequest(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockOpenRouterContent(content: string) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  } as Response);
}

const ORIGINAL_KEY = process.env.OPENROUTER_API_KEY;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENROUTER_API_KEY = 'test-key';
});

afterEach(() => {
  process.env.OPENROUTER_API_KEY = ORIGINAL_KEY;
});

describe('POST /api/chat', () => {
  it('returns 500 when the API key is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const res = await POST(chatRequest({ messages: [], members: [] }));
    expect(res.status).toBe(500);
  });

  it('passes a clean JSON action straight through', async () => {
    mockOpenRouterContent('{"action":"delete","member":{"id":3},"message":"Deleted."}');
    const res = await POST(chatRequest({ messages: [{ role: 'user', content: 'delete 3' }], members: [] }));
    expect(await res.json()).toEqual({ action: 'delete', member: { id: 3 }, message: 'Deleted.' });
  });

  it('extracts JSON wrapped in a markdown fence with prose around it', async () => {
    mockOpenRouterContent(
      'Sure! Here you go:\n```json\n{"action":"create","member":{"firstName":"A","surname":"B","dateOfBirth":"1990-01-01","postalCode":"X","mobileNumber":"Y"},"message":"Added {A}"}\n```\nLet me know if that works.'
    );
    const res = await POST(chatRequest({ messages: [], members: [] }));
    const body = await res.json();
    expect(body.action).toBe('create');
    expect(body.member.firstName).toBe('A');
    expect(body.message).toBe('Added {A}');
  });

  it('falls back to a plain message when there is no JSON', async () => {
    mockOpenRouterContent('I can help you manage members. What would you like to do?');
    const res = await POST(chatRequest({ messages: [], members: [] }));
    expect(await res.json()).toEqual({
      action: null,
      message: 'I can help you manage members. What would you like to do?',
    });
  });

  it('only sends id and name of members to the model', async () => {
    mockOpenRouterContent('{"action":null,"message":"ok"}');
    await POST(
      chatRequest({
        messages: [],
        members: [
          { id: 1, firstName: 'A', surname: 'B', dateOfBirth: '1990-01-01', postalCode: 'SECRET', mobileNumber: 'SECRET' },
        ],
      })
    );

    const sentBody = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]!.body as string);
    const systemPrompt = sentBody.messages[0].content as string;
    expect(systemPrompt).toContain('"firstName":"A"');
    expect(systemPrompt).not.toContain('SECRET');
  });

  it('returns 502 when OpenRouter fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    const res = await POST(chatRequest({ messages: [], members: [] }));
    expect(res.status).toBe(502);
  });
});
