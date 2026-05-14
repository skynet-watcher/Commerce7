export type FetchBackoffOptions = {
  /** Max attempts including the first request (default 4). */
  maxAttempts?: number;
  /** Initial delay in ms (default 200). */
  initialDelayMs?: number;
  /** Max delay cap (default 10_000). */
  maxDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(delay: number): number {
  return Math.floor(delay * (0.5 + Math.random()));
}

/**
 * Fetch with exponential backoff on **429** and **503** (Commerce7-style rate limits).
 * See `docs/STACK.md` for normative guidance; this is a minimal shared implementation.
 */
export async function fetchWithBackoff(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: FetchBackoffOptions = {},
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? 4;
  const initial = options.initialDelayMs ?? 200;
  const maxDelay = options.maxDelayMs ?? 10_000;

  let attempt = 0;
  let delay = initial;
  let last: Response | undefined;

  while (attempt < maxAttempts) {
    last = await fetch(input, init);
    if (last.status !== 429 && last.status !== 503) {
      return last;
    }
    attempt += 1;
    if (attempt >= maxAttempts) {
      return last;
    }
    const wait = jitter(Math.min(delay, maxDelay));
    await sleep(wait);
    delay = Math.min(delay * 2, maxDelay);
  }
  return last!;
}
