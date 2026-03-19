import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDfcSdk } from '../src/index.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ChallengeApi', () => {
  let sdk: ReturnType<typeof createDfcSdk>;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    sdk.client.setToken('player-jwt');
  });

  it('challengeOmega() posts to /api/challenge/omega with auth', async () => {
    const response = { matchId: 99, status: 'pending', message: 'Challenge accepted' };
    mockFetch.mockResolvedValueOnce(jsonResponse(response, 201));

    const result = await sdk.challenge.challengeOmega({ agentId: 1, wager: 100 });

    expect(result.matchId).toBe(99);
    expect(result.status).toBe('pending');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/challenge/omega',
      expect.objectContaining({ method: 'POST' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer player-jwt');
    expect(JSON.parse(call[1].body)).toEqual({ agentId: 1, wager: 100 });
  });

  it('challengeOmega() works without wager (optional field)', async () => {
    const response = { matchId: 100, status: 'pending', message: 'Challenge accepted' };
    mockFetch.mockResolvedValueOnce(jsonResponse(response, 201));

    await sdk.challenge.challengeOmega({ agentId: 2 });

    const call = mockFetch.mock.calls[0]!;
    expect(JSON.parse(call[1].body)).toEqual({ agentId: 2 });
  });

  it('getOmegaStatus() gets /api/challenge/omega/status without auth', async () => {
    const status = { available: true, activeMatches: 3, maxConcurrent: 10 };
    mockFetch.mockResolvedValueOnce(jsonResponse(status));

    const sdkNoAuth = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const result = await sdkNoAuth.challenge.getOmegaStatus();

    expect(result.available).toBe(true);
    expect(result.activeMatches).toBe(3);
    expect(result.maxConcurrent).toBe(10);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/challenge/omega/status',
      expect.objectContaining({ method: 'GET' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBeUndefined();
  });

  it('sdk factory includes challenge sub-api', () => {
    expect(sdk.challenge).toBeDefined();
  });
});
