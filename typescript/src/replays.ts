import type { DfcClient } from './client.js';

export interface ReplayData {
  readonly matchId: number;
  readonly status: string;
  readonly recordings?: readonly {
    readonly slot: number;
    readonly url: string;
  }[];
  readonly highlights?: readonly {
    readonly type: string;
    readonly timestamp: number;
    readonly data: Record<string, unknown>;
  }[];
}

export class ReplaysApi {
  constructor(private readonly client: DfcClient) {}

  async getReplay(matchId: number): Promise<ReplayData> {
    return this.client.get(`/api/matches/${matchId}/replay`);
  }
}
