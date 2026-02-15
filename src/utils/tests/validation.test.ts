/**
 * Tests for validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  ethereumAddressSchema,
  etherscanApiKeySchema,
  csvDataSchema,
  validateInput,
  validateInputOrThrow,
  ValidationError,
  sanitizeInput,
  sanitizeApiKey,
  sanitizeEthereumAddress,
} from "../validation.js";

describe("Validation", () => {
  describe("ethereumAddressSchema", () => {
    it("should validate correct Ethereum addresses", () => {
      const valid = validateInput(
        ethereumAddressSchema,
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbd", // 40 hex chars after 0x
      );
      expect(valid.success).toBe(true);
    });

    it("should reject invalid addresses", () => {
      const invalid = [
        "",
        "0x",
        "not-an-address",
        "0xGGGG",
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bE", // too short (39 chars)
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbdd", // too long (41 chars)
      ];

      for (const addr of invalid) {
        const result = validateInput(ethereumAddressSchema, addr);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("etherscanApiKeySchema", () => {
    it("should validate non-placeholder API keys", () => {
      const valid = validateInput(etherscanApiKeySchema, "ABC123DEF456");
      expect(valid.success).toBe(true);
    });

    it("should reject placeholder keys", () => {
      const result = validateInput(
        etherscanApiKeySchema,
        "YourEtherscanApiKeyHere",
      );
      expect(result.success).toBe(false);
    });

    it("should reject empty keys", () => {
      const result = validateInput(etherscanApiKeySchema, "");
      expect(result.success).toBe(false);
    });
  });

  describe("csvDataSchema", () => {
    it("should validate CSV with headers and data", () => {
      const csv = "header1,header2\nvalue1,value2";
      const result = validateInput(csvDataSchema, csv);
      expect(result.success).toBe(true);
    });

    it("should reject empty CSV", () => {
      const result = validateInput(csvDataSchema, "");
      expect(result.success).toBe(false);
    });

    it("should reject CSV without newlines", () => {
      const result = validateInput(csvDataSchema, "header1,header2");
      expect(result.success).toBe(false);
    });
  });

  describe("validateInputOrThrow", () => {
    it("should return data on valid input", () => {
      const data = validateInputOrThrow(
        ethereumAddressSchema,
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbd",
      );
      expect(data).toBe("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbd");
    });

    it("should throw ValidationError on invalid input", () => {
      expect(() => {
        validateInputOrThrow(ethereumAddressSchema, "invalid");
      }).toThrow(ValidationError);
    });
  });

  describe("sanitization", () => {
    describe("sanitizeInput", () => {
      it("should remove HTML tags", () => {
        expect(sanitizeInput("<script>alert(1)</script>")).toBe(
          "scriptalert(1)/script",
        );
      });

      it("should trim whitespace", () => {
        expect(sanitizeInput("  hello  ")).toBe("hello");
      });

      it("should limit length", () => {
        const long = "a".repeat(2000);
        expect(sanitizeInput(long).length).toBe(1000);
      });
    });

    describe("sanitizeApiKey", () => {
      it("should trim whitespace", () => {
        expect(sanitizeApiKey("  key123  ")).toBe("key123");
      });
    });

    describe("sanitizeEthereumAddress", () => {
      it("should convert to lowercase", () => {
        const addr = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbd";
        expect(sanitizeEthereumAddress(addr)).toBe(addr.toLowerCase());
      });

      it("should throw on invalid format", () => {
        expect(() => sanitizeEthereumAddress("invalid")).toThrow();
      });
    });
  });
});
