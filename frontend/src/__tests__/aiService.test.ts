import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from '@/services/aiService';

global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts messages and members to the local /api/chat route', async () => {
    const aiResponse = { action: null, message: 'Hello!' };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => aiResponse,
    } as Response);

    const result = await aiService.chat([{ role: 'user', content: 'hi' }], []);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(aiResponse);
  });

  it('throws a friendly error when the request fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'AI chat is not configured' }),
    } as Response);

    await expect(aiService.chat([], [])).rejects.toThrow('AI chat is not configured');
  });
});
