/**
 * Tests for rate limiter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  RateLimiter,
  RateLimitError,
  etherscanRateLimiter,
} from "../rateLimiter.js";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkLimit", () => {
    it("should allow requests within limit", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      for (let i = 0; i < 5; i++) {
        const result = limiter.checkLimit();
        expect(result.allowed).toBe(true);
      }
    });

    it("should block requests over limit", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      // Use up all tokens
      limiter.checkLimit();
      limiter.checkLimit();

      // Third request should be blocked
      const result = limiter.checkLimit();
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it("should refill tokens after window", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });

      // Use the token
      limiter.checkLimit();

      // Move time forward
      vi.advanceTimersByTime(1000);

      // Should be allowed again
      const result = limiter.checkLimit();
      expect(result.allowed).toBe(true);
    });

    it("should track different keys separately", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });

      const result1 = limiter.checkLimit("key1");
      const result2 = limiter.checkLimit("key2");

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe("checkLimitOrThrow", () => {
    it("should not throw when allowed", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      expect(() => limiter.checkLimitOrThrow()).not.toThrow();
    });

    it("should throw RateLimitError when blocked", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      limiter.checkLimit(); // Use the token

      expect(() => limiter.checkLimitOrThrow()).toThrow(RateLimitError);
    });
  });

  describe("waitForAvailability", () => {
    it("should resolve immediately when allowed", async () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      await expect(limiter.waitForAvailability()).resolves.toBeUndefined();
    });

    it("should wait for token refill", async () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      limiter.checkLimit(); // Use the token

      const promise = limiter.waitForAvailability();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("reset", () => {
    it("should reset specific key", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      limiter.checkLimit("key1");
      limiter.checkLimit("key2");

      limiter.reset("key1");

      // key1 should be allowed again
      expect(limiter.checkLimit("key1").allowed).toBe(true);
      // key2 should still be blocked
      expect(limiter.checkLimit("key2").allowed).toBe(false);
    });

    it("should reset all keys when no key specified", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      limiter.checkLimit("key1");
      limiter.checkLimit("key2");

      limiter.reset();

      expect(limiter.checkLimit("key1").allowed).toBe(true);
      expect(limiter.checkLimit("key2").allowed).toBe(true);
    });
  });
});

describe("etherscanRateLimiter", () => {
  beforeEach(() => {
    etherscanRateLimiter.reset();
  });

  it("should have correct default limits (5 req/s)", () => {
    // Should allow 5 requests
    for (let i = 0; i < 5; i++) {
      expect(etherscanRateLimiter.checkLimit().allowed).toBe(true);
    }
    // 6th should be blocked
    expect(etherscanRateLimiter.checkLimit().allowed).toBe(false);
  });
});
