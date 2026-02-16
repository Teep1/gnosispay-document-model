/**
 * Utility exports
 * Centralized exports for all utility modules
 */

// Logging
export { logger, Logger, type LogLevel } from "./logger.js";

// Rate Limiting
export {
  RateLimiter,
  RateLimitError,
  etherscanRateLimiter,
  strictRateLimiter,
  type RateLimitConfig,
} from "./rateLimiter.js";

// Validation
export {
  ethereumAddressSchema,
  etherscanApiKeySchema,
  etherscanFetchInputSchema,
  csvDataSchema,
  csvRowSchema,
  transactionInputSchema,
  transactionFiltersSchema,
  envConfigSchema,
  validateInput,
  validateInputOrThrow,
  ValidationError,
  sanitizeInput,
  sanitizeApiKey,
  sanitizeEthereumAddress,
  type EthereumAddress,
  type EtherscanFetchInput,
  type CsvRow,
  type TransactionInput,
  type TransactionFilters,
  type EnvConfig,
} from "./validation.js";

// Configuration
export {
  getEnvConfig,
  resetEnvConfig,
  isProduction,
  isDevelopment,
  getAppVersion,
  isDebugEnabled,
  features,
  EXCLUDED_CONTRACTS,
  GNOSIS_PAY_TOKENS,
  getTrackedAddress,
  getExcludedContractAddress,
  type GnosisPayToken,
} from "./config.js";

// Error Handling
export {
  ErrorCategory,
  categorizeError,
  getErrorResult,
  handleError,
  withErrorHandling,
  withRetry,
  assert,
  NetworkError,
  ApiError,
  TimeoutError,
  type AppError,
  type ErrorResult,
} from "./errorHandling.js";
