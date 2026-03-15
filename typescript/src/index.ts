export { DfcClient, ApiError, type ClientOptions } from './client.js';
export { PlayersApi } from './players.js';
export { MatchesApi } from './matches.js';
export { NodesApi } from './nodes.js';
export { ReplaysApi, type ReplayData } from './replays.js';
export type {
  LeaderboardEntry,
  MatchSummary,
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

import { DfcClient, type ClientOptions } from './client.js';
import { PlayersApi } from './players.js';
import { MatchesApi } from './matches.js';
import { NodesApi } from './nodes.js';
import { ReplaysApi } from './replays.js';

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
  };
}
