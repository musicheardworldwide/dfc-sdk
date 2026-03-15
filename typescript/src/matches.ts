import type { DfcClient } from './client.js';
import type { MatchSummary, PaginatedResponse } from './types.js';

export class MatchesApi {
  constructor(private readonly client: DfcClient) {}

  async getHistory(limit = 20, offset = 0): Promise<PaginatedResponse<MatchSummary>> {
    return this.client.get(`/api/matches/history?limit=${limit}&offset=${offset}`);
  }

  async getById(matchId: number): Promise<MatchSummary> {
    return this.client.get(`/api/matches/${matchId}`);
  }

  async spectate(matchId: number): Promise<{ token: string; eventsUrl: string }> {
    return this.client.post(`/api/matches/${matchId}/spectate`);
  }
}
