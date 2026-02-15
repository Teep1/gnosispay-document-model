/**
 * Production-ready logging utility
 * Provides structured logging with log levels and environment-based configuration
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

class Logger {
  private config: LogConfig;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      level: this.getEnvLogLevel(),
      enableConsole: true,
      prefix: "[GnosisTxAnalytics]",
      ...config,
    };
  }

  private getEnvLogLevel(): LogLevel {
    const envLevel = import.meta.env["VITE_LOG_LEVEL"] as LogLevel | undefined;
    if (envLevel && envLevel in LOG_LEVELS) {
      return envLevel;
    }
    // Default to warn in production, debug in development
    return import.meta.env.PROD ? "warn" : "debug";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${this.config.prefix} [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("debug") && this.config.enableConsole) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("info") && this.config.enableConsole) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("warn") && this.config.enableConsole) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>,
  ): void {
    if (this.shouldLog("error") && this.config.enableConsole) {
      const errorMeta =
        error instanceof Error
          ? {
              ...meta,
              errorName: error.name,
              errorMessage: error.message,
              stack: error.stack,
            }
          : meta;
      console.error(this.formatMessage("error", message, errorMeta));
    }
  }

  // Group related logs
  group(label: string): void {
    if (this.config.enableConsole) {
      console.group(this.formatMessage("debug", label));
    }
  }

  groupEnd(): void {
    if (this.config.enableConsole) {
      console.groupEnd();
    }
  }

  // Performance timing
  time(label: string): void {
    if (this.shouldLog("debug") && this.config.enableConsole) {
      console.time(`${this.config.prefix} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog("debug") && this.config.enableConsole) {
      console.timeEnd(`${this.config.prefix} ${label}`);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for testing and custom instances
export { Logger };
