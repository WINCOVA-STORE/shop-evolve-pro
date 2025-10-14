/**
 * Rate Limiting Middleware for Edge Functions
 * Prevents abuse and DoS attacks
 */

interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (per function instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request is rate limited
 * @param identifier - User ID or IP address
 * @param config - Rate limit configuration
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (entry) {
    if (now < entry.resetTime) {
      if (entry.count >= config.requests) {
        return {
          limited: true,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        };
      }
      entry.count++;
    } else {
      // Window expired, reset
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    }
  } else {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
  }

  return { limited: false };
}

/**
 * Cleanup expired entries (run periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Predefined rate limit configs
 */
export const RATE_LIMITS = {
  GENERAL: { requests: 100, windowMs: 60000 }, // 100 req/min
  AUTH: { requests: 30, windowMs: 60000 }, // 30 req/min
  API: { requests: 50, windowMs: 60000 }, // 50 req/min
};
