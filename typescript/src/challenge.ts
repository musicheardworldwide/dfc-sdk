import type { DfcClient } from './client.js';
import type { OmegaStatus } from './types.js';

export interface ChallengeOmegaRequest {
  readonly agentId: number;
  readonly wager?: number | undefined;
}

export interface ChallengeOmegaResponse {
  readonly matchId: number;
  readonly status: string;
  readonly message: string;
}

export class ChallengeApi {
  constructor(private readonly client: DfcClient) {}

  /**
   * Challenge Omega (the house AI) with the authenticated player's agent.
   * Requires bearer auth.
   */
  async challengeOmega(req: ChallengeOmegaRequest): Promise<ChallengeOmegaResponse> {
    return this.client.post('/api/challenge/omega', req, true);
  }

  /** Get Omega availability and current load. No auth required. */
  async getOmegaStatus(): Promise<OmegaStatus> {
    return this.client.get('/api/challenge/omega/status');
  }
}
