import { LRUCache } from 'lru-cache';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 30;

// Per-process cache — works within a single serverless instance.
// Across multiple warm instances, each enforces its own limit independently.
const ipCache = new LRUCache<string, number>({
  max: 10_000,
  ttl: WINDOW_MS,
});

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const count = (ipCache.get(ip) ?? 0) + 1;
  ipCache.set(ip, count);
  const remaining = Math.max(0, MAX_REQUESTS - count);
  return { allowed: count <= MAX_REQUESTS, remaining };
}
