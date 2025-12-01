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
  result: EtherscanTransaction[];
}

export interface EtherscanApiError {
  status: string;
  message: string;
  result?: string;
}

export class EtherscanApiService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.etherscan.io/v2/api";
  private readonly chainId: number;

  constructor(apiKey: string, chainId: number = 100) {
    if (!apiKey || apiKey === "YourEtherscanApiKeyHere") {
      throw new Error("Valid Etherscan API key is required");
    }
    this.apiKey = apiKey;
    this.chainId = chainId; // Default to Gnosis Chain (100)
  }

  /**
   * Fetch ERC20 token transactions for a given address using Etherscan API V2
   * @param address - The blockchain address to fetch transactions for (supports multiple chains)
   * @param startBlock - Starting block number (optional)
   * @param endBlock - Ending block number (optional, defaults to 'latest')
   * @param page - Page number for pagination (optional, defaults to 1)
   * @param offset - Number of transactions per page (optional, defaults to 10000, max 10000)
   * @param sort - Sort order 'asc' or 'desc' (optional, defaults to 'desc')
   */
  async fetchERC20Transactions(
    address: string,
    startBlock = 0,
    endBlock = "latest",
    page = 1,
    offset = 10000,
    sort: "asc" | "desc" = "desc",
  ): Promise<EtherscanTransaction[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("chainid", this.chainId.toString());
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "tokentx");
    url.searchParams.set("address", address);
    url.searchParams.set("startblock", startBlock.toString());
    url.searchParams.set("endblock", endBlock.toString());
    url.searchParams.set("page", page.toString());
    url.searchParams.set("offset", offset.toString());
    url.searchParams.set("sort", sort);
    url.searchParams.set("apikey", this.apiKey);

    try {
      console.log(`Fetching ERC20 transactions for address: ${address}`);
      console.log(`API URL: ${url.toString()}`);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as EtherscanResponse;

      console.log("Etherscan API Response:", data);

      if (data.status === "0") {
        if (data.message === "No transactions found") {
          console.log("No transactions found for this address");
          return [];
        }

        // Provide more specific error messages
        let errorMessage = `Etherscan API error: ${data.message}`;
        if (data.result) {
          errorMessage += ` (${data.result})`;
        }

        // Common error cases
        if (data.message.includes("Invalid API Key")) {
          errorMessage = "Invalid Etherscan API key. Please check your API key in the .env file.";
        } else if (data.message.includes("rate limit")) {
          errorMessage = "Etherscan API rate limit exceeded. Please wait a moment and try again.";
        } else if (data.message.includes("Invalid address")) {
          errorMessage = "Invalid Ethereum address format. Please check the address and try again.";
        }

        throw new Error(errorMessage);
      }

      console.log(`Successfully fetched ${data.result.length} transactions`);
      return data.result;
    } catch (error) {
      console.error("Error fetching ERC20 transactions:", error);
      throw error;
    }
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
