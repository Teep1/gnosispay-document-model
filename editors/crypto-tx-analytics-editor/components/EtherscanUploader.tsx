import { useState } from "react";
import { generateId } from "document-model/core";
import {
  useSelectedCryptoTransactionAnalyticsDocument,
  importCsvTransactions,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";
import {
  EtherscanApiService,
  convertEtherscanToParseTransaction,
} from "../services/etherscanApi.js";
import type { ParsedTransaction } from "./CsvUploader.js";

interface EtherscanUploaderProps {
  onUploadSuccess?: (data: {
    transactionCount: number;
    documentId: string;
    transactions: ParsedTransaction[];
  }) => void;
}

export function EtherscanUploader({ onUploadSuccess }: EtherscanUploaderProps) {
  const [document, dispatch] = useSelectedCryptoTransactionAnalyticsDocument();
  const [contractAddress, setContractAddress] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  console.log("EtherscanUploader render - document:", document);
  console.log("EtherscanUploader - document exists:", !!document);

  if (!document) {
    console.log("EtherscanUploader - No document, returning null");
    return null;
  }

  if (!dispatch) {
    console.log("EtherscanUploader - No dispatch function available");
    return null;
  }

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
      console.log("Initializing Etherscan API service for Gnosis Chain...");
      const etherscanService = new EtherscanApiService(apiKey.trim(), 100); // 100 = Gnosis Chain

      console.log(
        `Fetching transactions for address: ${contractAddress.trim()}`,
      );
      const etherscanTransactions =
        await etherscanService.fetchERC20Transactions(contractAddress.trim());

      if (etherscanTransactions.length === 0) {
        setUploadResult({
          type: "error",
          message: "No ERC20 transactions found for this address",
        });
        return;
      }

      console.log(
        `Converting ${etherscanTransactions.length} Etherscan transactions...`,
      );

      // Convert Etherscan transactions to ParsedTransaction format
      const parsedTransactions: ParsedTransaction[] = etherscanTransactions.map(
        (tx) => convertEtherscanToParseTransaction(tx, contractAddress.trim()),
      );

      // Filter out any problematic transactions (same as CSV upload)
      const validTransactions = parsedTransactions.filter((_tx) => {
        // Add any filtering logic similar to CSV upload if needed
        return true; // For now, include all transactions
      });

      console.log(
        `Processing ${validTransactions.length} valid transactions...`,
      );

      // Generate unique IDs for each transaction
      const transactionIds = validTransactions.map(() => generateId());

      // Create a CSV-like representation for the document model
      // This maintains compatibility with the existing importCsvTransactions action
      const csvHeader =
        "Transaction Hash,DateTime (UTC),Value_IN(Token),Value_OUT(Token),TxnFee(ETH),TokenSymbol,From,To,ContractAddress,Status";
      const csvRows = validTransactions.map((tx) => {
        const values = [
          tx.transactionHash,
          tx.timestamp || tx.rawTimestamp,
          tx.amountIn?.toString() || "",
          tx.amountOut?.toString() || "",
          tx.feeAmount?.toString() || "",
          tx.token,
          tx.fromAddress,
          tx.toAddress,
          tx.contractAddress,
          tx.status,
        ];
        // Properly escape CSV values that contain commas or quotes
        return values
          .map((value) => {
            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",");
      });

      const csvData = [csvHeader, ...csvRows].join("\n");

      // Dispatch the importCsvTransactions action to store data in document state
      console.log("Dispatching importCsvTransactions action...");
      dispatch(
        importCsvTransactions({
          csvData,
          timestamp: new Date().toISOString(),
          transactionIds,
        }),
      );
      console.log("Etherscan data stored in document state");

      if (onUploadSuccess) {
        onUploadSuccess({
          transactionCount: validTransactions.length,
          documentId: document?.header?.id || "unknown",
          transactions: validTransactions,
        });
      }

      setUploadResult({
        type: "success",
        message: `Successfully uploaded ${validTransactions.length} transactions`,
      });

      // Clear the form
      setContractAddress("");
      setApiKey("");
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
            Enter a Gnosis Chain address to automatically fetch ERC20 transactions
          </p>
        </div>

        <form onSubmit={handleAddressSubmit} className="mt-6">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
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
                <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                  etherscan.io/apis
                </a>
              </p>
            </div>
            <div>
              <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
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

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-medium">How it works:</p>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Get a free API key from Etherscan</li>
          <li>Enter your Gnosis Chain address</li>
          <li>We fetch all ERC20 token transactions via Etherscan API V2</li>
          <li>Data is processed and formatted the same as CSV uploads</li>
        </ul>
      </div>
    </div>
  );
}
