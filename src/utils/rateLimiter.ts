/**
 * Rate limiter for API calls
 * Implements token bucket algorithm with configurable limits
 */

import { logger } from "./logger.js";

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional key for identifying different rate limit buckets */
  key?: string;
}

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private states = new Map<string, RateLimitState>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? 5,
      windowMs: config.windowMs ?? 1000,
      key: config.key,
    };
  }

  /**
   * Check if a request is allowed
   * @returns Object with allowed status and retry after time
   */
  checkLimit(key: string = "default"): {
    allowed: boolean;
    retryAfterMs: number;
  } {
    const now = Date.now();
    const state = this.getState(key);

    // Calculate tokens to add based on time elapsed
    const timeElapsed = now - state.lastRefill;
    const tokensToAdd =
      (timeElapsed / this.config.windowMs) * this.config.maxRequests;

    // Refill tokens
    state.tokens = Math.min(
      this.config.maxRequests,
      state.tokens + tokensToAdd,
    );
    state.lastRefill = now;

    if (state.tokens >= 1) {
      state.tokens -= 1;
      this.states.set(key, state);
      return { allowed: true, retryAfterMs: 0 };
    }

    // Calculate retry after time
    const retryAfterMs = Math.ceil(
      ((1 - state.tokens) / this.config.maxRequests) * this.config.windowMs,
    );

    logger.warn("Rate limit exceeded", { key, retryAfterMs });
    return { allowed: false, retryAfterMs };
  }

  /**
   * Check if a request is allowed and throw error if not
   */
  checkLimitOrThrow(key: string = "default"): void {
    const result = this.checkLimit(key);
    if (!result.allowed) {
      const seconds = Math.ceil(result.retryAfterMs / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${seconds} seconds.`,
      );
    }
  }

  /**
   * Wait until a request is allowed
   */
  async waitForAvailability(key: string = "default"): Promise<void> {
    let result = this.checkLimit(key);

    while (!result.allowed) {
      logger.debug(`Waiting for rate limit: ${result.retryAfterMs}ms`);
      await sleep(result.retryAfterMs);
      result = this.checkLimit(key);
    }
  }

  private getState(key: string): RateLimitState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
      });
    }
    return this.states.get(key)!;
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key?: string): void {
    if (key) {
      this.states.delete(key);
    } else {
      this.states.clear();
    }
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Default rate limiter for Etherscan API (5 calls/second for free tier)
export const etherscanRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 1000,
});

// Stricter rate limiter for expensive operations
export const strictRateLimiter = new RateLimiter({
  maxRequests: 1,
  windowMs: 2000,
});
