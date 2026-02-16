import { logger } from "../../../src/utils/logger.js";
import {
  etherscanRateLimiter,
  RateLimitError,
} from "../../../src/utils/rateLimiter.js";
import {
  validateInputOrThrow,
  etherscanFetchInputSchema,
  sanitizeEthereumAddress,
  sanitizeApiKey,
  type EtherscanFetchInput,
} from "../../../src/utils/validation.js";
import {
  handleError,
  withRetry,
  ErrorCategory,
  ApiError,
  TimeoutError,
} from "../../../src/utils/errorHandling.js";
import { getEnvConfig } from "../../../src/utils/config.js";

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[] | string;
}

export interface EtherscanApiError {
  status: string;
  message: string;
  result?: string;
}

export interface FetchTransactionsOptions {
  startBlock?: number;
  endBlock?: number | "latest";
  page?: number;
  offset?: number;
  sort?: "asc" | "desc";
}

export class EtherscanApiService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.etherscan.io/v2/api";
  private readonly chainId: number;
  private readonly timeoutMs: number;

  constructor(apiKey: string, chainId: number = 100) {
    const sanitizedKey = sanitizeApiKey(apiKey);

    // Validate API key
    if (!sanitizedKey || sanitizedKey === "YourEtherscanApiKeyHere") {
      throw new Error("Valid Etherscan API key is required");
    }

    this.apiKey = sanitizedKey;
    this.chainId = chainId; // Default to Gnosis Chain (100)

    // Get timeout from config
    try {
      this.timeoutMs = getEnvConfig().VITE_API_TIMEOUT;
    } catch {
      this.timeoutMs = 30000; // Default 30s
    }

    logger.debug("EtherscanApiService initialized", {
      chainId,
      baseUrl: this.baseUrl,
      timeoutMs: this.timeoutMs,
    });
  }

  /**
   * Fetch ERC20 token transactions for a given address using Etherscan API V2
   * Includes rate limiting and retry logic
   */
  async fetchERC20Transactions(
    address: string,
    options: FetchTransactionsOptions = {},
  ): Promise<EtherscanTransaction[]> {
    // Validate inputs with defaults
    const inputData = {
      address: sanitizeEthereumAddress(address),
      apiKey: this.apiKey,
      startBlock: options.startBlock ?? 0,
      endBlock: options.endBlock ?? ("latest" as const),
      page: options.page ?? 1,
      offset: options.offset ?? 10000,
      sort: options.sort ?? ("desc" as const),
    };

    const validatedInput = validateInputOrThrow(
      etherscanFetchInputSchema,
      inputData,
      "Etherscan fetch input",
    );

    // Check rate limit
    const rateLimitResult = etherscanRateLimiter.checkLimit(address);
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Please wait ${Math.ceil(rateLimitResult.retryAfterMs / 1000)} seconds.`,
      );
    }

    // Build URL with validated parameters
    const url = this.buildApiUrl(validatedInput);

    logger.info(`Fetching ERC20 transactions for address: ${address}`);
    logger.debug("API request details", {
      chainId: this.chainId,
      startBlock: validatedInput.startBlock,
      endBlock: validatedInput.endBlock,
    });

    // Execute request with retry logic
    const fetchWithRetry = async (): Promise<EtherscanTransaction[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status,
          );
        }

        const data = (await response.json()) as EtherscanResponse;

        logger.debug("Etherscan API response received", {
          status: data.status,
          message: data.message,
          resultCount: Array.isArray(data.result) ? data.result.length : 0,
        });

        return this.parseResponse(data, address);
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof Error && error.name === "AbortError") {
          throw new TimeoutError(`Request timed out after ${this.timeoutMs}ms`);
        }

        throw error;
      }
    };

    try {
      const transactions = await withRetry(fetchWithRetry, {
        maxRetries: 3,
        baseDelayMs: 1000,
        retryableCategories: [
          ErrorCategory.NETWORK,
          ErrorCategory.TIMEOUT,
          ErrorCategory.RATE_LIMIT,
        ],
      });

      logger.info(`Successfully fetched ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      const appError = handleError(
        error,
        "EtherscanApiService.fetchERC20Transactions",
      );
      throw new Error(appError.message);
    }
  }

  private buildApiUrl(input: EtherscanFetchInput): URL {
    const url = new URL(this.baseUrl);
    url.searchParams.set("chainid", this.chainId.toString());
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "tokentx");
    url.searchParams.set("address", input.address);
    url.searchParams.set("startblock", input.startBlock.toString());
    url.searchParams.set("endblock", input.endBlock.toString());
    url.searchParams.set("page", input.page.toString());
    url.searchParams.set("offset", input.offset.toString());
    url.searchParams.set("sort", input.sort);
    url.searchParams.set("apikey", input.apiKey);
    return url;
  }

  private parseResponse(
    data: EtherscanResponse,
    address: string,
  ): EtherscanTransaction[] {
    if (data.status === "0") {
      if (data.message === "No transactions found") {
        logger.info("No transactions found for this address", { address });
        return [];
      }

      // Provide more specific error messages
      let errorMessage = `Etherscan API error: ${data.message}`;

      if (typeof data.result === "string") {
        errorMessage += ` (${data.result})`;
      } else if (data.result) {
        const resultStr = JSON.stringify(data.result);
        errorMessage += ` (${resultStr})`;
      }

      // Common error cases
      if (data.message.includes("Invalid API Key")) {
        errorMessage =
          "Invalid Etherscan API key. Please check your API key in the .env file.";
      } else if (data.message.includes("rate limit")) {
        errorMessage =
          "Etherscan API rate limit exceeded. Please wait a moment and try again.";
      } else if (data.message.includes("Invalid address")) {
        errorMessage =
          "Invalid Ethereum address format. Please check the address and try again.";
      }

      throw new ApiError(errorMessage);
    }

    if (!Array.isArray(data.result)) {
      throw new ApiError("Unexpected response format from Etherscan API");
    }

    return data.result;
  }

  /**
   * Validate if the provided address is a valid Ethereum address
   */
  static isValidEthereumAddress(address: string): boolean {
    // Basic validation for Ethereum address format
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get the current rate limit status (returns estimated calls remaining)
   * Note: Etherscan API V2 free tier allows 5 calls/sec and 100,000 calls/day
   */
  static getRateLimitInfo() {
    return {
      apiVersion: "V2",
      freeRateLimit: "5 calls/second",
      dailyLimit: "100,000 calls/day",
      recommendation:
        "For production use, consider upgrading to a paid plan for higher limits",
    };
  }
}

export interface ParsedTransaction {
  transactionHash: string;
  timestamp: string | null;
  rawTimestamp: string;
  contractAddress: string;
  fromAddress: string;
  toAddress: string;
  amountIn: number | null;
  rawAmountIn: string;
  amountOut: number | null;
  rawAmountOut: string;
  token: string;
  feeAmount: number | null;
  rawFee: string;
  feeToken: string;
  status: string;
}

/**
 * Convert Etherscan transaction to the ParsedTransaction format used by the app
 */
export function convertEtherscanToParseTransaction(
  etherscanTx: EtherscanTransaction,
  userAddress: string,
): {
  transactionHash: string;
  timestamp: string | null;
  rawTimestamp: string;
  contractAddress: string;
  fromAddress: string;
  toAddress: string;
  amountIn: number | null;
  rawAmountIn: string;
  amountOut: number | null;
  rawAmountOut: string;
  token: string;
  feeAmount: number | null;
  rawFee: string;
  feeToken: string;
  status: string;
} {
  const isIncoming = etherscanTx.to.toLowerCase() === userAddress.toLowerCase();
  const isOutgoing =
    etherscanTx.from.toLowerCase() === userAddress.toLowerCase();

  // Convert timestamp to ISO string
  const timestamp = new Date(
    parseInt(etherscanTx.timeStamp) * 1000,
  ).toISOString();

  // Convert value from wei to token units using decimal places
  const decimals = parseInt(etherscanTx.tokenDecimal) || 18;
  const rawValue = etherscanTx.value;
  const tokenAmount = parseFloat(rawValue) / Math.pow(10, decimals);

  // Calculate gas fee in ETH
  const gasUsed = parseFloat(etherscanTx.gasUsed);
  const gasPrice = parseFloat(etherscanTx.gasPrice);
  const gasFeeWei = gasUsed * gasPrice;
  const gasFeeEth = gasFeeWei / Math.pow(10, 18); // Convert wei to ETH

  return {
    transactionHash: etherscanTx.hash,
    timestamp,
    rawTimestamp: timestamp,
    contractAddress: etherscanTx.contractAddress,
    fromAddress: etherscanTx.from,
    toAddress: etherscanTx.to,
    amountIn: isIncoming ? tokenAmount : null,
    rawAmountIn: isIncoming ? tokenAmount.toString() : "",
    amountOut: isOutgoing ? tokenAmount : null,
    rawAmountOut: isOutgoing ? tokenAmount.toString() : "",
    token: etherscanTx.tokenSymbol || etherscanTx.tokenName || "UNKNOWN",
    feeAmount: isOutgoing ? gasFeeEth : null, // Only the sender pays gas fees
    rawFee: isOutgoing ? gasFeeEth.toString() : "",
    feeToken: "ETH",
    status: "SUCCESS", // Etherscan only returns successful transactions
  };
}
