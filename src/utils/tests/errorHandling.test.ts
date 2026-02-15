/**
 * Tests for error handling utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ErrorCategory,
  categorizeError,
  getErrorResult,
  handleError,
  withRetry,
  NetworkError,
  ApiError,
  TimeoutError,
  assert,
} from "../errorHandling.js";
import { logger } from "../logger.js";

// Mock logger
vi.mock("../logger.js", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("categorizeError", () => {
    it("should categorize network errors", () => {
      const error = new TypeError("Failed to fetch");
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.NETWORK);
      expect(categorized.recoverable).toBe(true);
      expect(categorized.retryable).toBe(true);
    });

    it("should categorize rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(categorized.recoverable).toBe(true);
      expect(categorized.retryable).toBe(true);
    });

    it("should categorize timeout errors", () => {
      const error = new Error("Request timeout");
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.TIMEOUT);
    });

    it("should categorize API key errors", () => {
      const error = new Error("Invalid API key");
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.API);
      expect(categorized.retryable).toBe(false);
    });

    it("should categorize validation errors", () => {
      const error = new Error("Validation failed: invalid input");
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.VALIDATION);
    });

    it("should handle unknown errors", () => {
      const error = "something went wrong";
      const categorized = categorizeError(error);

      expect(categorized.category).toBe(ErrorCategory.UNKNOWN);
    });
  });

  describe("getErrorResult", () => {
    it("should provide user-friendly message for network errors", () => {
      const error = new TypeError("Failed to fetch");
      const result = getErrorResult(error);

      expect(result.userMessage).toContain("Network connection failed");
      expect(result.action).toContain("Retry");
    });

    it("should provide action for API errors", () => {
      const error = new Error("Invalid API key");
      const result = getErrorResult(error);

      expect(result.action).toContain("verify your API key");
    });
  });

  describe("handleError", () => {
    it("should log error and return categorized error", () => {
      const error = new Error("Test error");
      const result = handleError(error, "test context");

      expect(logger.error).toHaveBeenCalled();
      expect(result.category).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it("should respect silent option", () => {
      const error = new Error("Test error");
      handleError(error, "test", { silent: true });

      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe("withRetry", () => {
    it("should return result on success", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await withRetry(fn, { maxRetries: 2 });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on recoverable errors", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValue("success");

      const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should not retry non-retryable errors", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Invalid API key"));

      await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow(
        "Invalid API key",
      );
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should throw after max retries", async () => {
      const fn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(
        withRetry(fn, { maxRetries: 2, baseDelayMs: 10 }),
      ).rejects.toThrow("Failed to fetch");
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe("assert", () => {
    it("should not throw when condition is true", () => {
      expect(() => assert(true, "message")).not.toThrow();
    });

    it("should throw when condition is false", () => {
      expect(() => assert(false, "message")).toThrow("message");
    });
  });

  describe("Custom Error Classes", () => {
    describe("NetworkError", () => {
      it("should have correct name", () => {
        const error = new NetworkError("test");
        expect(error.name).toBe("NetworkError");
      });
    });

    describe("ApiError", () => {
      it("should store status code", () => {
        const error = new ApiError("test", 404);
        expect(error.statusCode).toBe(404);
      });

      it("should store response data", () => {
        const data = { error: "details" };
        const error = new ApiError("test", 500, data);
        expect(error.responseData).toBe(data);
      });
    });

    describe("TimeoutError", () => {
      it("should have default message", () => {
        const error = new TimeoutError();
        expect(error.message).toBe("Request timed out");
      });
    });
  });
});
