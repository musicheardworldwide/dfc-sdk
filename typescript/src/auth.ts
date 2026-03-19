import type { DfcClient } from './client.js';
import type { PlayerProfile } from './types.js';

export interface AuthNonceResponse {
  readonly nonce: string;
  readonly message: string;
}

export interface AuthVerifyRequest {
  readonly walletAddress: string;
  readonly signature: string;
}

export interface AuthVerifyResponse {
  readonly token: string;
  readonly player: PlayerProfile;
  readonly isNewPlayer: boolean;
}

export class AuthApi {
  constructor(private readonly client: DfcClient) {}

  /**
   * Request a nonce for wallet-signature authentication.
   * Sign the `message` field with your wallet and pass the signature to `verify()`.
   */
  async getNonce(walletAddress: string): Promise<AuthNonceResponse> {
    return this.client.post('/api/auth/nonce', { walletAddress });
  }

  /**
   * Verify a wallet signature and receive a JWT token.
   * Store the returned `token` via `dfc.client.setToken(token)`.
   */
  async verify(req: AuthVerifyRequest): Promise<AuthVerifyResponse> {
    return this.client.post('/api/auth/verify', req);
  }
}
