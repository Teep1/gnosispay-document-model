/**
 * Environment configuration management
 * Validates and provides type-safe access to environment variables
 */

import {
  envConfigSchema,
  type EnvConfig,
  ValidationError,
} from "./validation.js";
import { logger } from "./logger.js";

// Cache for validated config
let validatedConfig: EnvConfig | null = null;

/**
 * Get environment configuration with validation
 * Caches result for subsequent calls
 */
export function getEnvConfig(): EnvConfig {
  if (validatedConfig) {
    return validatedConfig;
  }

  // Build raw config with defaults for missing values
  const rawConfig = {
    VITE_TRACKED_ETH_ADDRESS:
      import.meta.env["VITE_TRACKED_ETH_ADDRESS"] ||
      "0x0000000000000000000000000000000000000000",
    VITE_EXCLUDED_CONTRACT_ADDRESS:
      import.meta.env["VITE_EXCLUDED_CONTRACT_ADDRESS"] ||
      "0x0000000000000000000000000000000000000000",
    VITE_LOG_LEVEL: import.meta.env["VITE_LOG_LEVEL"] || "warn",
    VITE_ENABLE_DEBUG: import.meta.env["VITE_ENABLE_DEBUG"] === "true",
    VITE_API_TIMEOUT: import.meta.env["VITE_API_TIMEOUT"]
      ? parseInt(import.meta.env["VITE_API_TIMEOUT"], 10)
      : 30000,
  };

  try {
    const result = envConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      throw new ValidationError(
        `Invalid environment configuration: ${result.error.errors.map((e) => e.message).join(", ")}`,
      );
    }
    validatedConfig = result.data;
    logger.debug("Environment config validated successfully");
    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error("Environment configuration error", error);
      throw new Error(
        `Invalid environment configuration: ${error.message}. Please check your .env file.`,
      );
    }
    throw error;
  }
}

/**
 * Reset the cached config (useful for testing)
 */
export function resetEnvConfig(): void {
  validatedConfig = null;
  logger.debug("Environment config cache reset");
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true;
}

/**
 * Get the current app version
 */
export function getAppVersion(): string {
  return import.meta.env["VITE_APP_VERSION"] || "1.0.0";
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  try {
    return getEnvConfig().VITE_ENABLE_DEBUG;
  } catch {
    return false;
  }
}

/**
 * Feature flags
 */
export const features = {
  /** Enable Etherscan API integration */
  enableEtherscan: true,
  /** Enable CSV import */
  enableCsvImport: true,
  /** Enable refresh functionality */
  enableRefresh: true,
  /** Maximum transactions to display in UI */
  maxDisplayTransactions: 1000,
  /** Maximum file size for CSV uploads (5MB) */
  maxCsvFileSize: 5 * 1024 * 1024,
} as const;

// Excluded contracts (Gnosis Pay specific)
export const EXCLUDED_CONTRACTS = new Set([
  "0x5cb9073902f2035222b9749f8fb0c9bfe5527108".toLowerCase(),
  // Add other excluded contracts here
]);

// Gnosis Pay supported tokens
export const GNOSIS_PAY_TOKENS = ["USDC", "GBPe", "EURe"] as const;
export type GnosisPayToken = (typeof GNOSIS_PAY_TOKENS)[number];

/**
 * Get tracked ETH address from config or default
 */
export function getTrackedAddress(): string {
  try {
    return getEnvConfig().VITE_TRACKED_ETH_ADDRESS.toLowerCase();
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}

/**
 * Get excluded contract address from config
 */
export function getExcludedContractAddress(): string {
  try {
    return getEnvConfig().VITE_EXCLUDED_CONTRACT_ADDRESS.toLowerCase();
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}
