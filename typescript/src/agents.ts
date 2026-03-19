import type { DfcClient } from './client.js';

export interface AgentProfile {
  readonly id: number;
  readonly name: string;
  readonly ownerId: number;
  readonly gameMode: string;
  readonly status: string;
  readonly rankPoints: number;
  readonly wins: number;
  readonly losses: number;
  readonly createdAt: string;
}

export interface CreateAgentRequest {
  readonly name: string;
  readonly gameMode: string;
  readonly description?: string | undefined;
}

export interface UpdateAgentRequest {
  readonly name?: string | undefined;
  readonly description?: string | undefined;
}

export class AgentsApi {
  constructor(private readonly client: DfcClient) {}

  /** Create a new agent. Requires bearer auth. */
  async create(req: CreateAgentRequest): Promise<AgentProfile> {
    return this.client.post('/api/agents', req, true);
  }

  /** List agents belonging to the authenticated player. Requires bearer auth. */
  async listMine(): Promise<{ agents: readonly AgentProfile[] }> {
    return this.client.get('/api/agents/mine', true);
  }

  /** Get public agent profile by ID. */
  async getById(agentId: number): Promise<AgentProfile> {
    return this.client.get(`/api/agents/${agentId}`);
  }

  /** Update agent metadata. Requires bearer auth. */
  async update(agentId: number, req: UpdateAgentRequest): Promise<AgentProfile> {
    return this.client.put(`/api/agents/${agentId}`, req, true);
  }

  /** Deactivate an agent. Requires bearer auth. */
  async delete(agentId: number): Promise<void> {
    await this.client.del(`/api/agents/${agentId}`, true);
  }
}
