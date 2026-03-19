// DFC SDK Types — mirrors @dfc/common API types

export interface LeaderboardEntry {
  readonly rank: number;
  readonly id: number;
  readonly username: string;
  readonly wallet_address: string;
  readonly rank_points: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly total_matches: number;
  readonly win_rate: number;
}

export interface PlayerProfile {
  readonly id: number;
  readonly username: string;
  readonly wallet_address: string;
  readonly rank_points: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly total_matches: number;
  readonly win_rate: number;
  readonly recent_matches?: readonly MatchSummary[];
}

export type MatchStatus =
  | 'pending'
  | 'spawning'
  | 'active'
  | 'completing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface MatchSummary {
  readonly id: number;
  readonly player1_id: number;
  readonly player2_id: number;
  readonly winner_id: number | null;
  readonly game_mode: string;
  readonly status: MatchStatus;
  readonly wager_amount: string;
  readonly completed_at: string | null;
}

/** Generic paginated response using `entries` key (e.g. leaderboard). */
export interface LeaderboardResponse {
  readonly entries: readonly LeaderboardEntry[];
  readonly total: number;
}

/** Paginated match list response using `matches` key. */
export interface MatchListResponse {
  readonly matches: readonly MatchSummary[];
  readonly total: number;
}

/**
 * @deprecated Use `LeaderboardResponse` or `MatchListResponse` instead.
 * This type had ambiguous optional fields that TypeScript could not narrow.
 */
export interface PaginatedResponse<T> {
  readonly entries?: readonly T[];
  readonly matches?: readonly T[];
  readonly total: number;
}

export interface NodeHardwareSpecs {
  readonly cpuCores: number;
  readonly memoryGb: number;
  readonly storageGb: number;
  readonly gpuModel: string | null;
}

export interface NodeRegistrationRequest {
  readonly walletAddress: string;
  readonly signature: string;
  readonly hardware: NodeHardwareSpecs;
  readonly region: string;
  readonly publicIp: string;
  readonly stakeAmount: string;
}

export interface NodeRegistrationResponse {
  readonly nodeId: number;
  readonly token: string;
  readonly status: string;
}

export interface NodeHeartbeatRequest {
  readonly activeMatches: number;
  readonly cpuUsagePercent: number;
  readonly memoryUsagePercent: number;
  readonly diskUsagePercent: number;
}

export interface NodeAssignment {
  readonly id: number;
  readonly matchId: number;
  readonly status: string;
  readonly assignedAt: string;
  readonly expiresAt: string;
  readonly matchConfig: {
    readonly matchId: number;
    readonly player1Id: number;
    readonly player2Id: number;
    readonly gameMode: string;
    readonly wagerAmount: string;
    readonly timeoutSeconds: number;
  };
}

export type MatchEndReason = 'objective_complete' | 'timeout' | 'forfeit' | 'error';

/** Maximum bytes for containerLogs in a match report (64 KiB). */
export const CONTAINER_LOGS_MAX_BYTES = 65_536;

export interface NodeMatchReport {
  readonly matchId: number;
  readonly winnerId: number | null;
  readonly endReason: MatchEndReason;
  readonly durationSeconds: number;
  readonly recordingRef: string | null;
  readonly containerLogs: string | null;
}

/**
 * Truncate container logs to the last `maxBytes` bytes.
 * Use before submitting a `NodeMatchReport` to avoid sending oversized payloads.
 */
export function truncateContainerLogs(
  logs: string | null,
  maxBytes = CONTAINER_LOGS_MAX_BYTES,
): string | null {
  if (logs === null) return null;
  const encoded = new TextEncoder().encode(logs);
  if (encoded.byteLength <= maxBytes) return logs;
  const trimmed = encoded.slice(encoded.byteLength - maxBytes);
  return new TextDecoder().decode(trimmed);
}

export interface OmegaStatus {
  readonly available: boolean;
  readonly activeMatches: number;
  readonly maxConcurrent: number;
}
