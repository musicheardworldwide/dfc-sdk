import type { DfcClient } from './client.js';
import type { LeaderboardResponse, MatchListResponse, PlayerProfile } from './types.js';

export class PlayersApi {
  constructor(private readonly client: DfcClient) {}

  async getLeaderboard(limit = 50, offset = 0): Promise<LeaderboardResponse> {
    return this.client.get(`/api/leaderboard?limit=${limit}&offset=${offset}`);
  }

  async getProfile(playerId: number): Promise<PlayerProfile> {
    return this.client.get(`/api/players/${playerId}`);
  }

  async getMatches(
    playerId: number,
    limit = 20,
    offset = 0,
  ): Promise<MatchListResponse> {
    return this.client.get(`/api/players/${playerId}/matches?limit=${limit}&offset=${offset}`);
  }
}
