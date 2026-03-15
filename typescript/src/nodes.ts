import type { DfcClient } from './client.js';
import type {
  NodeAssignment,
  NodeHeartbeatRequest,
  NodeMatchReport,
  NodeRegistrationRequest,
  NodeRegistrationResponse,
} from './types.js';

export class NodesApi {
  constructor(private readonly client: DfcClient) {}

  async requestNonce(walletAddress: string): Promise<{ nonce: string; message: string }> {
    return this.client.post('/api/nodes/auth/nonce', { walletAddress });
  }

  async register(req: NodeRegistrationRequest): Promise<NodeRegistrationResponse> {
    return this.client.post('/api/nodes/register', req);
  }

  async heartbeat(nodeId: number, req: NodeHeartbeatRequest): Promise<void> {
    await this.client.post(`/api/nodes/${nodeId}/heartbeat`, req, true);
  }

  async pollAssignments(
    nodeId: number,
    timeoutSeconds = 15,
  ): Promise<{ assignments: readonly NodeAssignment[] }> {
    return this.client.get(
      `/api/nodes/${nodeId}/assignments?timeout=${timeoutSeconds}`,
      true,
    );
  }

  async reportMatch(nodeId: number, report: NodeMatchReport): Promise<void> {
    await this.client.post(`/api/nodes/${nodeId}/report`, report, true);
  }
}
