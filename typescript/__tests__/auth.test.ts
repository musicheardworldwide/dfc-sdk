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

const mockPlayerProfile = {
  id: 7,
  username: 'alice',
  wallet_address: 'So1abc123',
  rank_points: 1000,
  wins: 5,
  losses: 2,
  draws: 0,
  total_matches: 7,
  win_rate: 0.714,
};

describe('AuthApi', () => {
  let sdk: ReturnType<typeof createDfcSdk>;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
  });

  it('getNonce() posts walletAddress to /api/auth/nonce', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ nonce: 'deadbeef', message: 'Sign: deadbeef' }),
    );

    const result = await sdk.auth.getNonce('Sol123abc');

    expect(result.nonce).toBe('deadbeef');
    expect(result.message).toBe('Sign: deadbeef');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/nonce',
      expect.objectContaining({ method: 'POST' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(JSON.parse(call[1].body)).toEqual({ walletAddress: 'Sol123abc' });
  });

  it('getNonce() requires no auth header', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ nonce: 'abc', message: 'Sign: abc' }),
    );

    await sdk.auth.getNonce('Sol123');
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBeUndefined();
  });

  it('verify() posts walletAddress + signature to /api/auth/verify', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ token: 'jwt-xyz', player: mockPlayerProfile, isNewPlayer: false }),
    );

    const result = await sdk.auth.verify({
      walletAddress: 'Sol123abc',
      signature: 'sig-deadbeef',
    });

    expect(result.token).toBe('jwt-xyz');
    expect(result.isNewPlayer).toBe(false);
    expect(result.player.username).toBe('alice');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/verify',
      expect.objectContaining({ method: 'POST' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(JSON.parse(call[1].body)).toEqual({
      walletAddress: 'Sol123abc',
      signature: 'sig-deadbeef',
    });
  });

  it('verify() for new player sets isNewPlayer=true', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ token: 'jwt-new', player: mockPlayerProfile, isNewPlayer: true }),
    );

    const result = await sdk.auth.verify({
      walletAddress: 'SolNew',
      signature: 'sig-new',
    });

    expect(result.isNewPlayer).toBe(true);
  });

  it('sdk factory includes auth sub-api', () => {
    expect(sdk.auth).toBeDefined();
  });
});
