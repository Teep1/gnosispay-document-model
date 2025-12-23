import { useState } from "react";
import { generateId } from "document-model/core";
import {
  useSelectedCryptoTransactionAnalyticsDocument,
  importCsvTransactions,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

const CONTRACTS_TO_EXCLUDE = new Set([
  import.meta.env.VITE_EXCLUDED_CONTRACT_ADDRESS?.toLowerCase() ||
    "0x0000000000000000000000000000000000000000",
  "0x5cb9073902f2035222b9749f8fb0c9bfe5527108".toLowerCase(),
]);

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

interface CsvUploaderProps {
  onUploadSuccess?: (data: {
    transactionCount: number;
    documentId: string;
    transactions: ParsedTransaction[];
  }) => void;
}

export function CsvUploader({ onUploadSuccess }: CsvUploaderProps) {
  const [document, dispatch] = useSelectedCryptoTransactionAnalyticsDocument();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  console.log("CsvUploader render - document:", document);
  console.log("CsvUploader - document exists:", !!document);

  if (!document) {
    console.log("CsvUploader - No document, returning null");
    return null;
  }

  if (!dispatch) {
    console.log("CsvUploader - No dispatch function available");
    return null;
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log("Reading CSV file...", file.name);
      const csvData = await file.text();
      console.log("CSV data length:", csvData.length);

      const lines = csvData.trim().split(/\r?\n/);
      const dataRows = lines.length - 1; // excluding header
      console.log("CSV lines:", lines.length, "Data rows:", dataRows);

      if (dataRows <= 0) {
        throw new Error("CSV file must contain at least one data row");
      }

      const [headerLine, ...rowLines] = lines;
      const rawHeaders = splitCsvLine(headerLine);
      const headers = rawHeaders.map(normalizeHeader);

      const transactions: ParsedTransaction[] = rowLines
        .map((row) => splitCsvLine(row))
        .filter((values) => values.some((value) => value.trim().length > 0))
        .map((values, index) => {
          const usedHeaderIndices = new Set<number>();

          const getField = (
            keyVariants: string[],
            options?: { markUsed?: boolean; disallow?: string[] },
          ) => {
            const normalizedKeyVariants = keyVariants.map(normalizeHeader);
            const normalizedDisallow =
              options?.disallow?.map(normalizeHeader) ?? [];
            const idx = findHeaderIndex(
              headers,
              normalizedKeyVariants,
              usedHeaderIndices,
              normalizedDisallow,
            );
            if (idx === -1 || idx >= values.length) {
              return { value: "", header: "", index: -1 };
            }
            if (options?.markUsed !== false) {
              usedHeaderIndices.add(idx);
            }
            return {
              value: cleanValue(values[idx]),
              header: rawHeaders[idx],
              index: idx,
            };
          };

          const transactionHashField = getField([
            "transactionhash",
            "txhash",
            "hash",
          ]);
          const transactionHash =
            transactionHashField.value || `row-${index + 1}`;

          const timestampField = getField([
            "datetimeutc",
            "datetime",
            "timestamp",
            "date",
            "time",
          ]);
          const rawTimestamp = timestampField.value;
          const timestamp =
            rawTimestamp && !Number.isNaN(Date.parse(rawTimestamp))
              ? new Date(rawTimestamp).toISOString()
              : null;

          const amountInField = getField(["valuein", "amountin"], {
            markUsed: false,
          });
          const rawAmountIn = amountInField.value;
          const amountIn = toNumber(rawAmountIn);

          const amountField = getField([
            "valueout",
            "amountout",
            "value",
            "amount",
          ]);
          const rawAmountOut = amountField.value;
          const amountOut = toNumber(rawAmountOut);

          const tokenField = getField(
            ["tokensymbol", "token", "symbol", "asset", "currency"],
            {
              disallow: ["valueout", "valuein", "amount", "fee"],
            },
          );
          const inferredToken =
            tokenField.value ||
            extractTokenFromHeader(amountField.header) ||
            extractTokenFromValue(rawAmountOut);
          const token =
            inferredToken && !isNumericString(inferredToken)
              ? inferredToken
              : "UNKNOWN";

          const rawFee = getField(["txnfee", "fee", "gasfee"]).value;
          const feeAmount = toNumber(rawFee);
          const feeToken =
            getField(["feetoken", "feeasset", "feecurrency"]).value ||
            extractTokenFromValue(rawFee) ||
            token;

          const rawStatus = getField(["status", "state", "result"]).value;
          const status = rawStatus ? rawStatus.toUpperCase() : "UNKNOWN";

          const contractAddress =
            getField(["contractaddress", "tokenaddress"]).value || "";
          const fromAddress = getField(["from", "fromaddress", "sender"]).value;
          const toAddress = getField(["to", "toaddress", "recipient"]).value;

          const transaction: ParsedTransaction = {
            transactionHash,
            timestamp,
            rawTimestamp,
            contractAddress,
            fromAddress,
            toAddress,
            amountIn,
            rawAmountIn,
            amountOut,
            rawAmountOut,
            token,
            feeAmount,
            rawFee,
            feeToken,
            status,
          };

          return transaction;
        })
        .filter(
          (tx) =>
            !tx.contractAddress ||
            !CONTRACTS_TO_EXCLUDE.has(tx.contractAddress.toLowerCase()),
        );

      // Generate unique IDs for each transaction
      const transactionIds = transactions.map(() => generateId());

      // Dispatch the importCsvTransactions action to store data in document state
      console.log("Dispatching importCsvTransactions action...");
      dispatch(
        importCsvTransactions({
          csvData,
          timestamp: new Date().toISOString(),
          transactionIds,
        }),
      );
      console.log("CSV data stored in document state");

      if (onUploadSuccess) {
        onUploadSuccess({
          transactionCount: transactions.length,
          documentId: document?.header?.id || "unknown",
          transactions,
        });
      }

      setUploadResult({
        type: "success",
        message: `Successfully imported ${transactions.length} transactions`,
      });
    } catch (error) {
      console.error("CSV Upload Error:", error);
      setUploadResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to process CSV file",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload CSV file with transaction data
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Supports common formats from exchanges and wallets
            </span>
          </label>
          <input
            id="csv-upload"
            name="csv-upload"
            type="file"
            accept=".csv,.txt"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={() => {
              const element = window.document.getElementById(
                "csv-upload",
              ) as HTMLInputElement;
              element?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? (
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Choose CSV File"
            )}
          </button>
        </div>
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
        <p className="font-medium">Expected CSV format:</p>
        <p>
          Headers should include: Transaction Hash, DateTime (UTC), Value_IN(x),
          Value_OUT(x), TxnFee, TokenSymbol, Status, etc.
        </p>
      </div>
    </div>
  );
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderIndex(
  headers: string[],
  variants: string[],
  usedIndices: Set<number>,
  disallowPatterns: string[] = [],
): number {
  const passesFilters = (header: string, idx: number) => {
    if (usedIndices.has(idx)) return false;
    if (
      disallowPatterns.some((pattern) => pattern && header.includes(pattern))
    ) {
      return false;
    }
    return true;
  };

  const exactMatchIndex = headers.findIndex(
    (header, idx) =>
      passesFilters(header, idx) &&
      variants.some((variant) => variant && header === variant),
  );
  if (exactMatchIndex !== -1) {
    return exactMatchIndex;
  }

  return headers.findIndex(
    (header, idx) =>
      passesFilters(header, idx) &&
      variants.some((variant) => variant && header.includes(variant)),
  );
}

function cleanValue(value: string): string {
  return value.replace(/^"(.*)"$/, "$1").trim();
}

function toNumber(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractTokenFromValue(value: string): string {
  if (!value) return "";
  const parts = value.trim().split(/\s+/);
  if (parts.length <= 1) return "";
  const maybeAmount = toNumber(parts[0]);
  if (maybeAmount !== null) {
    return parts.slice(1).join(" ");
  }
  return parts.slice(1).join(" ");
}

function extractTokenFromHeader(header: string): string {
  if (!header) return "";
  const parenMatch = header.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const candidate = parenMatch[1].trim();
    if (candidate && !isNumericString(candidate)) {
      return candidate;
    }
  }
  return "";
}

function isNumericString(value: string): boolean {
  if (!value) return false;
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}
