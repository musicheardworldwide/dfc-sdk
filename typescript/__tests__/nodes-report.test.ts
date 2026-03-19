import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDfcSdk } from '../src/index.js';
import { truncateContainerLogs, CONTAINER_LOGS_MAX_BYTES } from '../src/types.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('nodes.reportMatch()', () => {
  let sdk: ReturnType<typeof createDfcSdk>;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    sdk.client.setToken('node-jwt');
  });

  it('posts to /api/nodes/:id/report with auth', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await sdk.nodes.reportMatch(5, {
      matchId: 42,
      winnerId: 7,
      endReason: 'objective_complete',
      durationSeconds: 120,
      recordingRef: null,
      containerLogs: null,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/nodes/5/report',
      expect.objectContaining({ method: 'POST' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer node-jwt');
  });

  it('sends correct match report payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const report = {
      matchId: 99,
      winnerId: null,
      endReason: 'timeout' as const,
      durationSeconds: 300,
      recordingRef: 's3://bucket/match-99.rec',
      containerLogs: 'Container exited normally',
    };

    await sdk.nodes.reportMatch(1, report);

    const call = mockFetch.mock.calls[0]!;
    const body = JSON.parse(call[1].body);
    expect(body.matchId).toBe(99);
    expect(body.winnerId).toBeNull();
    expect(body.endReason).toBe('timeout');
    expect(body.durationSeconds).toBe(300);
    expect(body.recordingRef).toBe('s3://bucket/match-99.rec');
    expect(body.containerLogs).toBe('Container exited normally');
  });

  it('supports all end reasons', async () => {
    const endReasons = ['objective_complete', 'timeout', 'forfeit', 'error'] as const;

    for (const endReason of endReasons) {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await sdk.nodes.reportMatch(1, {
        matchId: 1,
        winnerId: null,
        endReason,
        durationSeconds: 10,
        recordingRef: null,
        containerLogs: null,
      });
      const call = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]!;
      expect(JSON.parse(call[1].body).endReason).toBe(endReason);
    }
  });

  it('throws ApiError on 4xx without retrying', async () => {
    const { ApiError } = await import('../src/client.js');
    mockFetch.mockResolvedValueOnce(
      new Response('{"error":"node not found"}', { status: 404 }),
    );

    await expect(
      sdk.nodes.reportMatch(999, {
        matchId: 1,
        winnerId: null,
        endReason: 'error',
        durationSeconds: 0,
        recordingRef: null,
        containerLogs: null,
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('truncateContainerLogs()', () => {
  it('returns null when input is null', () => {
    expect(truncateContainerLogs(null)).toBeNull();
  });

  it('returns short logs unchanged', () => {
    const logs = 'Container started\nContainer exited with code 0';
    expect(truncateContainerLogs(logs)).toBe(logs);
  });

  it('truncates logs exceeding max bytes', () => {
    const bigLog = 'x'.repeat(CONTAINER_LOGS_MAX_BYTES + 1000);
    const result = truncateContainerLogs(bigLog);
    expect(result).not.toBeNull();
    const encoded = new TextEncoder().encode(result!);
    expect(encoded.byteLength).toBeLessThanOrEqual(CONTAINER_LOGS_MAX_BYTES);
  });

  it('preserves the tail (most recent logs) when truncating', () => {
    const tail = 'FINAL_LOG_LINE';
    const big = 'x'.repeat(CONTAINER_LOGS_MAX_BYTES + 1000) + tail;
    const result = truncateContainerLogs(big);
    expect(result).not.toBeNull();
    expect(result!.endsWith(tail)).toBe(true);
  });

  it('CONTAINER_LOGS_MAX_BYTES is 65536', () => {
    expect(CONTAINER_LOGS_MAX_BYTES).toBe(65_536);
  });

  it('respects custom maxBytes parameter', () => {
    const logs = 'a'.repeat(200);
    const result = truncateContainerLogs(logs, 100);
    const encoded = new TextEncoder().encode(result!);
    expect(encoded.byteLength).toBeLessThanOrEqual(100);
  });
});

describe('build fix: body must not be undefined in fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET request sends no body property (not undefined)', async () => {
    const sdk2 = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    await sdk2.client.get('/test');
    const call = mockFetch.mock.calls[0]!;
    // With the spread fix, body key is absent from the object entirely on GET
    expect(call[1].body).toBeUndefined();
  });

  it('POST request with body sends JSON string, not undefined', async () => {
    const sdk2 = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    await sdk2.client.post('/test', { key: 'value' });
    const call = mockFetch.mock.calls[0]!;
    expect(typeof call[1].body).toBe('string');
    expect(JSON.parse(call[1].body)).toEqual({ key: 'value' });
  });
});
