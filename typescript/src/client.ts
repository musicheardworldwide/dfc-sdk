// Base HTTP client with retry + exponential backoff.

export interface ClientOptions {
  readonly baseUrl: string;
  readonly token?: string | undefined;
  readonly maxRetries?: number | undefined;
  readonly initialBackoffMs?: number | undefined;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`API error (${status}): ${body}`);
    this.name = 'ApiError';
  }
}

export class DfcClient {
  private readonly baseUrl: string;
  private token: string | undefined;
  private readonly maxRetries: number;
  private readonly initialBackoffMs: number;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.token = opts.token;
    this.maxRetries = opts.maxRetries ?? 3;
    this.initialBackoffMs = opts.initialBackoffMs ?? 1000;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = undefined;
  }

  async get<T>(path: string, auth = false): Promise<T> {
    return this.request<T>('GET', path, undefined, auth);
  }

  async post<T>(path: string, body?: unknown, auth = false): Promise<T> {
    return this.request<T>('POST', path, body, auth);
  }

  async put<T>(path: string, body?: unknown, auth = false): Promise<T> {
    return this.request<T>('PUT', path, body, auth);
  }

  async del<T>(path: string, auth = false): Promise<T> {
    return this.request<T>('DELETE', path, undefined, auth);
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown | undefined,
    auth: boolean,
  ): Promise<T> {
    let backoff = this.initialBackoffMs;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (auth && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const resp = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        ...(body !== undefined && { body: JSON.stringify(body) }),
      });

      if (resp.ok) {
        const text = await resp.text();
        return text ? (JSON.parse(text) as T) : ({} as T);
      }

      // Don't retry client errors (4xx)
      if (resp.status >= 400 && resp.status < 500) {
        const text = await resp.text();
        throw new ApiError(resp.status, text);
      }

      // Retry server errors (5xx)
      if (attempt < this.maxRetries - 1) {
        await new Promise((r) => setTimeout(r, backoff));
        backoff *= 2;
      } else {
        const text = await resp.text();
        throw new ApiError(resp.status, text);
      }
    }

    throw new Error('Max retries exceeded');
  }
}
