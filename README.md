# dfc-sdk

TypeScript client library and OpenAPI specification for the DFC Coordinator API.

## Install

```bash
npm install @dfc/sdk
```

## Usage

```typescript
import { createDfcSdk } from '@dfc/sdk';

const dfc = createDfcSdk({ baseUrl: 'https://api.dfc.gg' });

// Public endpoints (no auth required)
const leaderboard = await dfc.players.getLeaderboard(50, 0);
const profile = await dfc.players.getProfile(42);
const history = await dfc.matches.getHistory(20, 0);
const replay = await dfc.replays.getReplay(123);
const omega = await dfc.matches.getById(456);

// Authenticated endpoints
dfc.client.setToken('your-jwt-token');
const spectator = await dfc.matches.spectate(789);

// Node operator endpoints
const nonce = await dfc.nodes.requestNonce('SolanaWalletAddress...');
const reg = await dfc.nodes.register({
  walletAddress: '...',
  signature: '...',
  hardware: { cpuCores: 4, memoryGb: 16, storageGb: 100, gpuModel: null },
  region: 'us-east',
  publicIp: '1.2.3.4',
  stakeAmount: '0',
});

dfc.client.setToken(reg.token);
await dfc.nodes.heartbeat(reg.nodeId, {
  activeMatches: 0,
  cpuUsagePercent: 12.5,
  memoryUsagePercent: 45.0,
  diskUsagePercent: 30.0,
});

const { assignments } = await dfc.nodes.pollAssignments(reg.nodeId, 15);
```

## API Reference

### `createDfcSdk(options)`

Creates a fully-configured SDK instance.

| Option | Type | Required | Description |
|---|---|---|---|
| `baseUrl` | `string` | Yes | Coordinator API URL |
| `token` | `string` | No | Initial JWT token |
| `maxRetries` | `number` | No | Max retry attempts (default: 3) |
| `initialBackoffMs` | `number` | No | Initial backoff in ms (default: 1000) |

Returns an object with:

- **`client`** — underlying `DfcClient` (set/clear token, raw HTTP methods)
- **`players`** — `getLeaderboard()`, `getProfile()`, `getMatches()`
- **`matches`** — `getHistory()`, `getById()`, `spectate()`
- **`nodes`** — `requestNonce()`, `register()`, `heartbeat()`, `pollAssignments()`, `reportMatch()`
- **`replays`** — `getReplay()`

### Error Handling

```typescript
import { ApiError } from '@dfc/sdk';

try {
  await dfc.players.getProfile(999999);
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.status); // 404
    console.log(err.body);   // '{"error":"Player not found"}'
  }
}
```

Server errors (5xx) are automatically retried with exponential backoff. Client errors (4xx) throw immediately.

## OpenAPI Spec

The full API specification is in [`openapi/dfc-api.yaml`](./openapi/dfc-api.yaml) (OpenAPI 3.1).

Covers all 20+ coordinator endpoints including auth, matches, players, nodes, agents, challenges, and replays.

## Project Structure

```
dfc-sdk/
├── openapi/
│   └── dfc-api.yaml          OpenAPI 3.1 specification
└── typescript/
    ├── src/
    │   ├── index.ts           Entry point + createDfcSdk factory
    │   ├── client.ts          Base HTTP client with retry + backoff
    │   ├── types.ts           All API types
    │   ├── players.ts         Leaderboard, profiles, match history
    │   ├── matches.ts         Match endpoints
    │   ├── nodes.ts           Node registration, heartbeat, assignments
    │   └── replays.ts         Replay API
    └── __tests__/
        ├── client.test.ts     HTTP client tests (retry, auth, errors)
        └── sdk.test.ts        SDK integration tests
```

## Test

```bash
cd typescript
npm install
npm test              # 13 tests
```

## Related

- [dfc](https://github.com/your-org/dfc) — Coordinator API + frontend
- [dfc-node](https://github.com/your-org/dfc-node) — Rust node operator binary

## License

MIT
