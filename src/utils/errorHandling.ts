/**
 * Enhanced error handling utilities
 * Provides structured error handling with categorization and user-friendly messages
 */

import { logger } from "./logger.js";

export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  API = "API",
  RATE_LIMIT = "RATE_LIMIT",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  category: ErrorCategory;
  message: string;
  technicalDetails?: string;
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorResult {
  userMessage: string;
  technicalMessage?: string;
  action?: string;
}

/**
 * Categorize an error and provide user-friendly information
 */
export function categorizeError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      category: ErrorCategory.NETWORK,
      message:
        "Network connection failed. Please check your internet connection.",
      technicalDetails: error.message,
      recoverable: true,
      retryable: true,
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        message: "Too many requests. Please wait a moment and try again.",
        technicalDetails: error.message,
        recoverable: true,
        retryable: true,
      };
    }

    if (message.includes("timeout") || message.includes("abort")) {
      return {
        category: ErrorCategory.TIMEOUT,
        message: "Request timed out. The server may be busy. Please try again.",
        technicalDetails: error.message,
        recoverable: true,
        retryable: true,
      };
    }

    if (message.includes("validation")) {
      return {
        category: ErrorCategory.VALIDATION,
        message: "Invalid input. Please check your data and try again.",
        technicalDetails: error.message,
        recoverable: true,
        retryable: false,
      };
    }

    if (message.includes("api key") || message.includes("unauthorized")) {
      return {
        category: ErrorCategory.API,
        message: "API authentication failed. Please check your API key.",
        technicalDetails: error.message,
        recoverable: true,
        retryable: false,
      };
    }

    if (message.includes("not found") || message.includes("404")) {
      return {
        category: ErrorCategory.API,
        message: "The requested resource was not found.",
        technicalDetails: error.message,
        recoverable: false,
        retryable: false,
      };
    }

    if (message.includes("invalid")) {
      return {
        category: ErrorCategory.VALIDATION,
        message: "Invalid input. Please check your data and try again.",
        technicalDetails: error.message,
        recoverable: true,
        retryable: false,
      };
    }
  }

  return {
    category: ErrorCategory.UNKNOWN,
    message: "An unexpected error occurred. Please try again later.",
    technicalDetails: error instanceof Error ? error.message : String(error),
    recoverable: false,
    retryable: false,
  };
}

/**
 * Get user-friendly error message and action
 */
export function getErrorResult(error: unknown): ErrorResult {
  const appError = categorizeError(error);

  let action: string | undefined;
  if (appError.retryable) {
    action = "Click 'Retry' to try again.";
  } else if (appError.category === ErrorCategory.API) {
    action = "Please verify your API key and try again.";
  } else if (appError.category === ErrorCategory.VALIDATION) {
    action = "Please check your input and try again.";
  }

  return {
    userMessage: appError.message,
    technicalMessage: appError.technicalDetails,
    action,
  };
}

/**
 * Handle error with logging
 */
export function handleError(
  error: unknown,
  context: string,
  options: { silent?: boolean; logLevel?: "error" | "warn" } = {},
): AppError {
  const { silent = false, logLevel = "error" } = options;
  const appError = categorizeError(error);

  if (!silent) {
    const logMethod = logLevel === "error" ? logger.error : logger.warn;
    logMethod(
      `Error in ${context}`,
      error instanceof Error ? error : undefined,
      {
        category: appError.category,
        recoverable: appError.recoverable,
        retryable: appError.retryable,
      },
    );
  }

  return appError;
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  context: string,
  options?: { silent?: boolean; logLevel?: "error" | "warn" },
): (
  ...args: Args
) => Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  return async (...args: Args) => {
    try {
      const data = await fn(...args);
      return { success: true, data };
    } catch (error) {
      const appError = handleError(error, context, options);
      return { success: false, error: appError };
    }
  };
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    retryableCategories?: ErrorCategory[];
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.RATE_LIMIT,
    ],
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const appError = categorizeError(error);

      if (
        !retryableCategories.includes(appError.category) ||
        attempt === maxRetries
      ) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs,
      );

      logger.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
        {
          category: appError.category,
          context: fn.name,
        },
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert that a condition is true, throw otherwise
 */
export function assert(
  condition: boolean,
  message: string,
  category: ErrorCategory = ErrorCategory.VALIDATION,
): asserts condition {
  if (!condition) {
    const error = new Error(message);
    (error as unknown as Record<string, unknown>)["category"] = category;
    throw error;
  }
}

/**
 * Custom error classes
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseData?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}
