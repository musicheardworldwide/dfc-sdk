import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DfcClient, ApiError } from '../src/client.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('DfcClient', () => {
  let client: DfcClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DfcClient({ baseUrl: 'http://localhost:3001' });
  });

  it('strips trailing slash from base URL', () => {
    const c = new DfcClient({ baseUrl: 'http://localhost:3001/' });
    // Access private property through the instance
    expect((c as any).baseUrl).toBe('http://localhost:3001');
  });

  it('makes GET requests', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));

    const result = await client.get<{ status: string }>('/health');

    expect(result.status).toBe('ok');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('makes POST requests with body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ nonce: 'abc' }));

    const result = await client.post<{ nonce: string }>(
      '/api/auth/nonce',
      { walletAddress: '0x123' },
    );

    expect(result.nonce).toBe('abc');
    const call = mockFetch.mock.calls[0]!;
    expect(JSON.parse(call[1].body)).toEqual({ walletAddress: '0x123' });
  });

  it('includes auth header when token is set', async () => {
    client.setToken('jwt-123');
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    await client.get('/api/protected', true);

    const headers = mockFetch.mock.calls[0]![1].headers;
    expect(headers.Authorization).toBe('Bearer jwt-123');
  });

  it('throws ApiError on 4xx', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('{"error":"not found"}', { status: 404 }),
    );

    try {
      await client.get('/api/missing');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });

  it('retries on 5xx then succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response('error', { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const c = new DfcClient({
      baseUrl: 'http://localhost:3001',
      maxRetries: 3,
      initialBackoffMs: 1, // fast for tests
    });

    const result = await c.get<{ ok: boolean }>('/api/flaky');
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries on persistent 5xx', async () => {
    mockFetch.mockResolvedValue(new Response('error', { status: 500 }));

    const c = new DfcClient({
      baseUrl: 'http://localhost:3001',
      maxRetries: 2,
      initialBackoffMs: 1,
    });

    await expect(c.get('/api/broken')).rejects.toThrow(ApiError);
  });
});
