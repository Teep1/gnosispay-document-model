import { useState } from "react";
import {
  EtherscanApiService,
  convertEtherscanToParseTransaction,
} from "../services/etherscanApi.js";
import type { ParsedTransaction } from "../services/etherscanApi.js";

interface EtherscanUploaderProps {
  onUploadSuccess: (
    transactions: ParsedTransaction[],
    address: string,
    lastBlockNumber: number,
  ) => void;
  trackedAddress?: string;
}

export function EtherscanUploader({
  onUploadSuccess,
  trackedAddress,
}: EtherscanUploaderProps) {
  const [contractAddress, setContractAddress] = useState(trackedAddress || "");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchData, setLastFetchData] = useState<{
    address: string;
    apiKey: string;
    lastBlockNumber: number;
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchTransactions = async (
    address: string,
    userApiKey: string,
    startBlock: number = 0,
    isRefresh: boolean = false,
  ) => {
    const etherscanService = new EtherscanApiService(userApiKey.trim(), 100);

    const etherscanTransactions = await etherscanService.fetchERC20Transactions(
      address.trim(),
      {
        startBlock,
        endBlock: "latest",
      },
    );

    const parsedTransactions: ParsedTransaction[] = etherscanTransactions.map(
      (tx) => convertEtherscanToParseTransaction(tx, address.trim()),
    );

    // Define excluded contracts
    const EXCLUDED_CONTRACTS = new Set([
      "0x5cb9073902f2035222b9749f8fb0c9bfe5527108".toLowerCase(),
    ]);

    // Filter out excluded contract addresses
    const validTransactions = parsedTransactions.filter((tx) => {
      if (
        tx.contractAddress &&
        EXCLUDED_CONTRACTS.has(tx.contractAddress.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    const filteredCount = parsedTransactions.length - validTransactions.length;

    if (validTransactions.length === 0) {
      if (isRefresh) {
        setUploadResult({
          type: "success",
          message:
            filteredCount > 0
              ? `No new transactions found (${filteredCount} excluded)`
              : "No new transactions found since last fetch",
        });
      } else {
        setUploadResult({
          type: "error",
          message:
            filteredCount > 0
              ? `No transactions to import (${filteredCount} excluded)`
              : "No ERC20 transactions found for this address",
        });
      }
      return {
        transactions: [] as ParsedTransaction[],
        lastBlockNumber: startBlock,
      };
    }

    // Find the highest block number
    const lastBlockNumber =
      etherscanTransactions.length > 0
        ? Math.max(
            ...etherscanTransactions.map((tx) => parseInt(tx.blockNumber)),
          )
        : startBlock;

    return { transactions: validTransactions, lastBlockNumber };
  };

  const handleAddressSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contractAddress.trim()) {
      setUploadResult({
        type: "error",
        message: "Please enter a contract address",
      });
      return;
    }

    if (!apiKey.trim()) {
      setUploadResult({
        type: "error",
        message: "Please enter your Etherscan API key",
      });
      return;
    }

    if (!EtherscanApiService.isValidEthereumAddress(contractAddress.trim())) {
      setUploadResult({
        type: "error",
        message: "Please enter a valid Ethereum address (0x...)",
      });
      return;
    }

    setIsLoading(true);
    setUploadResult(null);

    try {
      const result = await fetchTransactions(
        contractAddress.trim(),
        apiKey.trim(),
        0,
        false,
      );

      setLastFetchData({
        address: contractAddress.trim(),
        apiKey: apiKey.trim(),
        lastBlockNumber: result.lastBlockNumber,
      });

      if (result.transactions.length > 0) {
        onUploadSuccess(
          result.transactions,
          contractAddress.trim(),
          result.lastBlockNumber,
        );

        setUploadResult({
          type: "success",
          message: `Successfully fetched ${result.transactions.length} transactions`,
        });

        setContractAddress("");
        setApiKey("");
      }
    } catch (error) {
      console.error("Etherscan fetch error:", error);
      setUploadResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions from Etherscan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!lastFetchData) {
      setUploadResult({
        type: "error",
        message:
          "No previous fetch data available. Please fetch transactions first.",
      });
      return;
    }

    setIsRefreshing(true);
    setUploadResult(null);

    try {
      const result = await fetchTransactions(
        lastFetchData.address,
        lastFetchData.apiKey,
        lastFetchData.lastBlockNumber + 1,
        true,
      );

      setLastFetchData({
        ...lastFetchData,
        lastBlockNumber: Math.max(
          result.lastBlockNumber,
          lastFetchData.lastBlockNumber,
        ),
      });

      if (result.transactions.length > 0) {
        onUploadSuccess(
          result.transactions,
          lastFetchData.address,
          result.lastBlockNumber,
        );

        setUploadResult({
          type: "success",
          message: `Successfully fetched ${result.transactions.length} new transactions`,
        });
      }
    } catch (error) {
      console.error("Etherscan refresh error:", error);
      setUploadResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to refresh transactions from Etherscan",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">
            Fetch transactions from Etherscan
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Enter a Gnosis Chain address to automatically fetch ERC20
            transactions
          </p>
        </div>

        <form onSubmit={handleAddressSubmit} className="mt-6">
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="api-key"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Etherscan API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your Etherscan API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Get your free API key at{" "}
                <a
                  href="https://etherscan.io/apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  etherscan.io/apis
                </a>
              </p>
            </div>
            <div>
              <label
                htmlFor="contract-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gnosis Chain Address
              </label>
              <input
                id="contract-address"
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x1234...abcd"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isRefreshing}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Fetching transactions...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Fetch Transactions
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {uploadResult && (
        <div
          className={`mt-4 p-4 rounded-md ${
            uploadResult.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {uploadResult.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm ${
                  uploadResult.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {uploadResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Section */}
      {lastFetchData && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Refresh Transactions
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Fetch new transactions for{" "}
                {lastFetchData.address.substring(0, 6)}...
                {lastFetchData.address.substring(38)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isRefreshing}
              title={`Refresh from block ${lastFetchData.lastBlockNumber + 1}`}
            >
              {isRefreshing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-medium">How it works:</p>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Get a free API key from Etherscan</li>
          <li>Enter your Gnosis Chain address</li>
          <li>We fetch all ERC20 token transactions via Etherscan API V2</li>
          <li>Use the "Refresh" button to fetch only new transactions</li>
        </ul>
      </div>
    </div>
  );
}
