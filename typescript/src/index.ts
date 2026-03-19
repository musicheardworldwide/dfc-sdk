export { DfcClient, ApiError, type ClientOptions } from './client.js';
export { PlayersApi } from './players.js';
export { MatchesApi } from './matches.js';
export { NodesApi } from './nodes.js';
export { ReplaysApi, type ReplayData } from './replays.js';
export { AgentsApi, type AgentProfile, type CreateAgentRequest, type UpdateAgentRequest } from './agents.js';
export { ChallengeApi, type ChallengeOmegaRequest, type ChallengeOmegaResponse } from './challenge.js';
export { AuthApi, type AuthNonceResponse, type AuthVerifyRequest, type AuthVerifyResponse } from './auth.js';
export type {
  LeaderboardEntry,
  LeaderboardResponse,
  MatchSummary,
  MatchListResponse,
  MatchStatus,
  NodeAssignment,
  NodeHardwareSpecs,
  NodeHeartbeatRequest,
  NodeMatchReport,
  NodeRegistrationRequest,
  NodeRegistrationResponse,
  OmegaStatus,
  PaginatedResponse,
  PlayerProfile,
  MatchEndReason,
} from './types.js';
export { truncateContainerLogs, CONTAINER_LOGS_MAX_BYTES } from './types.js';

import { DfcClient, type ClientOptions } from './client.js';
import { PlayersApi } from './players.js';
import { MatchesApi } from './matches.js';
import { NodesApi } from './nodes.js';
import { ReplaysApi } from './replays.js';
import { AgentsApi } from './agents.js';
import { ChallengeApi } from './challenge.js';
import { AuthApi } from './auth.js';

/**
 * Create a fully-configured DFC SDK instance.
 *
 * ```ts
 * const dfc = createDfcSdk({ baseUrl: 'https://api.dfc.gg' });
 * const leaderboard = await dfc.players.getLeaderboard();
 * ```
 */
export function createDfcSdk(opts: ClientOptions) {
  const client = new DfcClient(opts);
  return {
    client,
    players: new PlayersApi(client),
    matches: new MatchesApi(client),
    nodes: new NodesApi(client),
    replays: new ReplaysApi(client),
    agents: new AgentsApi(client),
    challenge: new ChallengeApi(client),
    auth: new AuthApi(client),
  };
}
