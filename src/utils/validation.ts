/**
 * Input validation schemas using Zod
 * Provides type-safe validation for all user inputs
 */

import { z } from "zod";

// ============================================================================
// Ethereum Address Validation
// ============================================================================

export const ethereumAddressSchema = z
  .string()
  .min(1, "Address is required")
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    "Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters",
  );

export type EthereumAddress = z.infer<typeof ethereumAddressSchema>;

// ============================================================================
// Etherscan API Validation
// ============================================================================

export const etherscanApiKeySchema = z
  .string()
  .min(1, "API key is required")
  .refine(
    (key) => key !== "YourEtherscanApiKeyHere" && !key.includes("Your"),
    "Please provide a valid API key, not a placeholder",
  );

export const blockNumberSchema = z.union([
  z.number().int().min(0, "Block number must be non-negative"),
  z.literal("latest"),
]);

export const etherscanFetchInputSchema = z.object({
  address: ethereumAddressSchema,
  apiKey: etherscanApiKeySchema,
  startBlock: z.number().int().min(0),
  endBlock: blockNumberSchema,
  page: z.number().int().min(1),
  offset: z.number().int().min(1).max(10000),
  sort: z.enum(["asc", "desc"]),
});

export type EtherscanFetchInput = z.infer<typeof etherscanFetchInputSchema>;

// ============================================================================
// CSV Validation
// ============================================================================

export const csvDataSchema = z
  .string()
  .min(1, "CSV data is required")
  .refine(
    (data) => data.includes("\n"),
    "CSV must contain a header row and at least one data row",
  );

export const csvRowSchema = z.object({
  transactionHash: z.string().min(1),
  timestamp: z.string().nullable(),
  rawTimestamp: z.string(),
  contractAddress: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  amountIn: z.number().nullable(),
  rawAmountIn: z.string(),
  amountOut: z.number().nullable(),
  rawAmountOut: z.string(),
  token: z.string().min(1),
  feeAmount: z.number().nullable(),
  rawFee: z.string(),
  feeToken: z.string(),
  status: z.string(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

// ============================================================================
// Transaction Validation
// ============================================================================

export const transactionStatusSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "PENDING",
  "UNKNOWN",
]);

export const tokenValueSchema = z.object({
  amount: z.number(),
  token: z.string().min(1),
  usdValue: z.number().nullable().optional(),
});

export const transactionInputSchema = z.object({
  id: z.string().min(1),
  txHash: z.string().min(1, "Transaction hash is required"),
  blockNumber: z.string().min(1, "Block number is required"),
  timestamp: z.string().datetime("Invalid timestamp format"),
  fromAddress: z.string().nullable().optional(),
  toAddress: z.string().nullable().optional(),
  contractAddress: z.string().nullable().optional(),
  valueIn: tokenValueSchema.nullable().optional(),
  valueOut: tokenValueSchema.nullable().optional(),
  txnFee: tokenValueSchema,
  status: transactionStatusSchema,
  errorCode: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;

// ============================================================================
// Filter Validation
// ============================================================================

export const transactionFiltersSchema = z.object({
  token: z.string().optional(),
  contractAddress: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  status: transactionStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;

// ============================================================================
// Environment Configuration Validation
// ============================================================================

export const envConfigSchema = z.object({
  VITE_TRACKED_ETH_ADDRESS: ethereumAddressSchema.default(
    "0x0000000000000000000000000000000000000000",
  ),
  VITE_EXCLUDED_CONTRACT_ADDRESS: ethereumAddressSchema.default(
    "0x0000000000000000000000000000000000000000",
  ),
  VITE_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .default("warn"),
  VITE_ENABLE_DEBUG: z.boolean().default(false),
  VITE_API_TIMEOUT: z.number().int().min(1000).max(60000).default(30000),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(
      `Validation error${context ? ` in ${context}` : ""}:`,
      result.error.errors,
    );
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

export function validateInputOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = context
      ? `Validation error in ${context}: ${result.error.errors.map((e) => e.message).join(", ")}`
      : `Validation error: ${result.error.errors.map((e) => e.message).join(", ")}`;
    throw new ValidationError(message, result.error);
  }
  return result.data;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError?: z.ZodError,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ============================================================================
// Sanitization Helpers
// ============================================================================

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .slice(0, 1000); // Limit length
}

export function sanitizeApiKey(key: string): string {
  return key.trim();
}

export function sanitizeEthereumAddress(address: string): string {
  const cleaned = address.trim().toLowerCase();
  // Basic validation before full schema validation
  if (!cleaned.startsWith("0x") || cleaned.length !== 42) {
    throw new Error("Invalid Ethereum address format");
  }
  return cleaned;
}
