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

describe('createDfcSdk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates all sub-APIs', () => {
    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    expect(sdk.players).toBeDefined();
    expect(sdk.matches).toBeDefined();
    expect(sdk.nodes).toBeDefined();
    expect(sdk.replays).toBeDefined();
  });

  it('players.getLeaderboard calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ entries: [], total: 0 }));

    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const result = await sdk.players.getLeaderboard(10, 0);

    expect(result.total).toBe(0);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/leaderboard?limit=10&offset=0',
      expect.anything(),
    );
  });

  it('players.getProfile calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ id: 1, username: 'alice', rank_points: 1200 }),
    );

    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const profile = await sdk.players.getProfile(1);

    expect(profile.username).toBe('alice');
  });

  it('nodes.requestNonce sends wallet address', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ nonce: 'abc', message: 'Sign this' }),
    );

    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const result = await sdk.nodes.requestNonce('Sol123');

    expect(result.nonce).toBe('abc');
    const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
    expect(body.walletAddress).toBe('Sol123');
  });

  it('matches.getHistory calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ matches: [], total: 0 }));

    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    await sdk.matches.getHistory(5, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/matches/history?limit=5&offset=10',
      expect.anything(),
    );
  });

  it('replays.getReplay calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ matchId: 42, status: 'archived' }),
    );

    const sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const replay = await sdk.replays.getReplay(42);

    expect(replay.matchId).toBe(42);
  });
});
