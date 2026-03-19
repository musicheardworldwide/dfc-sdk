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

const mockAgent = {
  id: 1,
  name: 'Alpha',
  ownerId: 42,
  gameMode: 'cyber',
  status: 'active',
  rankPoints: 1500,
  wins: 10,
  losses: 2,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('AgentsApi', () => {
  let sdk: ReturnType<typeof createDfcSdk>;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    sdk.client.setToken('test-jwt');
  });

  it('create() posts to /api/agents with auth', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockAgent, 201));

    const result = await sdk.agents.create({ name: 'Alpha', gameMode: 'cyber' });

    expect(result.id).toBe(1);
    expect(result.name).toBe('Alpha');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/agents',
      expect.objectContaining({ method: 'POST' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer test-jwt');
    expect(JSON.parse(call[1].body)).toEqual({ name: 'Alpha', gameMode: 'cyber' });
  });

  it('listMine() gets /api/agents/mine with auth', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ agents: [mockAgent] }));

    const result = await sdk.agents.listMine();

    expect(result.agents).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/agents/mine',
      expect.objectContaining({ method: 'GET' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer test-jwt');
  });

  it('getById() gets /api/agents/:id without auth', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockAgent));

    const sdkNoAuth = createDfcSdk({ baseUrl: 'http://localhost:3001' });
    const result = await sdkNoAuth.agents.getById(1);

    expect(result.id).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/agents/1',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('update() puts /api/agents/:id with auth', async () => {
    const updated = { ...mockAgent, name: 'Beta' };
    mockFetch.mockResolvedValueOnce(jsonResponse(updated));

    const result = await sdk.agents.update(1, { name: 'Beta' });

    expect(result.name).toBe('Beta');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/agents/1',
      expect.objectContaining({ method: 'PUT' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer test-jwt');
  });

  it('delete() sends DELETE /api/agents/:id with auth', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await sdk.agents.delete(1);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/agents/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
    const call = mockFetch.mock.calls[0]!;
    expect(call[1].headers.Authorization).toBe('Bearer test-jwt');
  });

  it('sdk factory includes agents sub-api', () => {
    expect(sdk.agents).toBeDefined();
  });
});
