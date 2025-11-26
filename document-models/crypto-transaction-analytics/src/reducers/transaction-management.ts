import type { TransactionStatus } from "../../gen/schema/types.js";
import type { CryptoTransactionAnalyticsTransactionManagementOperations } from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

export const cryptoTransactionAnalyticsTransactionManagementOperations: CryptoTransactionAnalyticsTransactionManagementOperations =
  {
    importCsvTransactionsOperation(state, action) {
      if (!action.input.csvData || action.input.csvData.trim().length === 0) {
        throw new Error("CSV data is required");
      }

      if (!state.transactions) {
        state.transactions = [];
      }

      const transactions = [];
      const csvLines = action.input.csvData.trim().split("\n");

      if (csvLines.length < 2) {
        throw new Error(
          "CSV must contain header row and at least one data row",
        );
      }

      const headers = csvLines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      let transactionIndex = 0;

      // Helper function to convert CSV timestamp to ISO 8601 format
      const toISOTimestamp = (
        rawTimestamp: string,
        fallback: string,
      ): string => {
        if (!rawTimestamp) return fallback;
        const parsed = Date.parse(rawTimestamp);
        if (isNaN(parsed)) return fallback;
        return new Date(parsed).toISOString();
      };

      // Helper function to normalize header names for comparison
      const normalizeHeader = (header: string): string => {
        return header
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
      };

      // Helper function to get field value with multiple possible header names (case-insensitive)
      // Uses "includes" matching to handle headers like "Value_IN(EURe)" matching "valuein"
      const getField = (
        txData: Record<string, string>,
        variants: string[],
      ): string => {
        const normalizedVariants = variants.map(normalizeHeader);
        for (const variant of variants) {
          // Try exact match first
          if (txData[variant]) return txData[variant];
        }
        // Try case-insensitive includes match
        const key = Object.keys(txData).find((k) => {
          const normalizedKey = normalizeHeader(k);
          return normalizedVariants.some(
            (nv) => normalizedKey.includes(nv) || nv.includes(normalizedKey),
          );
        });
        if (key && txData[key]) return txData[key];
        return "";
      };

      // Helper function to extract token symbol from header like "Value_IN(EURe)" -> "EURe"
      const extractTokenFromHeader = (header: string): string => {
        const match = header.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          const candidate = match[1].trim();
          // Ignore generic placeholders like "x"
          if (candidate && candidate.toLowerCase() !== "x") {
            return candidate;
          }
        }
        return "";
      };

      // Helper function to find header matching a pattern and get its value + extracted token
      const getFieldWithToken = (
        txData: Record<string, string>,
        variants: string[],
      ): { value: string; token: string; header: string } => {
        const normalizedVariants = variants.map(normalizeHeader);
        for (const variant of variants) {
          if (txData[variant]) {
            return {
              value: txData[variant],
              token: extractTokenFromHeader(variant),
              header: variant,
            };
          }
        }
        const key = Object.keys(txData).find((k) => {
          const normalizedKey = normalizeHeader(k);
          return normalizedVariants.some(
            (nv) => normalizedKey.includes(nv) || nv.includes(normalizedKey),
          );
        });
        if (key && txData[key]) {
          return {
            value: txData[key],
            token: extractTokenFromHeader(key),
            header: key,
          };
        }
        return { value: "", token: "", header: "" };
      };

      for (let i = 1; i < csvLines.length; i++) {
        const line = csvLines[i].trim();
        if (!line) continue;

        if (transactionIndex >= action.input.transactionIds.length) {
          throw new Error("Not enough transaction IDs provided for CSV data");
        }

        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        if (values.length !== headers.length) continue;

        const txData: Record<string, string> = {};
        headers.forEach((header, index) => {
          txData[header] = values[index];
        });

        const rawTimestamp = getField(txData, [
          "DateTime (UTC)",
          "DateTime",
          "timestamp",
          "date",
        ]);
        const txHash = getField(txData, ["Transaction Hash", "TxHash", "hash"]);
        const blockNumber = getField(txData, [
          "Blockno",
          "Block Number",
          "blockNumber",
        ]);
        const fromAddress = getField(txData, ["From", "fromAddress", "sender"]);
        const toAddress = getField(txData, ["To", "toAddress", "recipient"]);
        const contractAddress = getField(txData, [
          "ContractAddress",
          "tokenAddress",
          "contract",
        ]);

        // Use getFieldWithToken to extract both value and token from headers like "Value_IN(EURe)"
        const valueInResult = getFieldWithToken(txData, [
          "Value_IN",
          "valueIn",
          "amountIn",
        ]);
        const valueOutResult = getFieldWithToken(txData, [
          "Value_OUT",
          "valueOut",
          "amountOut",
          "value",
          "amount",
        ]);

        const tokenSymbol = getField(txData, [
          "TokenSymbol",
          "token",
          "symbol",
          "asset",
        ]);
        const txnFeeRaw = getField(txData, [
          "TxnFee(DAI)",
          "TxnFee(USD)",
          "TxnFee",
          "fee",
          "gasFee",
        ]);
        const historicalPriceRaw = getField(txData, [
          "Historical $P",
          "historicalPrice",
        ]);
        const currentValueRaw = getField(txData, [
          "CurrentValue TxnFee(x)",
          "currentValue",
        ]);
        const statusRaw = getField(txData, ["Status", "status", "state"]);
        const errorCode = getField(txData, ["ErrCode", "errorCode", "error"]);
        const method = getField(txData, ["Method", "method", "function"]);

        // Determine token: prefer explicit TokenSymbol, then extracted from header, then contract, then default
        const valueInToken =
          tokenSymbol || valueInResult.token || contractAddress || "ETH";
        const valueOutToken =
          tokenSymbol || valueOutResult.token || contractAddress || "ETH";

        const transaction = {
          id: action.input.transactionIds[transactionIndex],
          txHash: txHash || "",
          blockNumber: blockNumber || "",
          timestamp: toISOTimestamp(rawTimestamp, action.input.timestamp),
          fromAddress: fromAddress || null,
          toAddress: toAddress || null,
          contractAddress: contractAddress || null,
          valueIn:
            valueInResult.value && parseFloat(valueInResult.value) > 0
              ? {
                  amount: parseFloat(valueInResult.value),
                  token: valueInToken,
                  usdValue: null,
                }
              : null,
          valueOut:
            valueOutResult.value && parseFloat(valueOutResult.value) > 0
              ? {
                  amount: parseFloat(valueOutResult.value),
                  token: valueOutToken,
                  usdValue: null,
                }
              : null,
          txnFee: {
            amount: parseFloat(txnFeeRaw) || 0,
            token: txnFeeRaw && txnFeeRaw.includes("DAI") ? "DAI" : "USD",
            usdValue: null,
          },
          historicalPrice:
            historicalPriceRaw && parseFloat(historicalPriceRaw) > 0
              ? {
                  amount: parseFloat(historicalPriceRaw),
                  currency: "USD",
                }
              : null,
          currentValue:
            currentValueRaw && parseFloat(currentValueRaw) > 0
              ? {
                  amount: parseFloat(currentValueRaw),
                  currency: "USD",
                }
              : null,
          convertedValue: null,
          status: (statusRaw === "1" || statusRaw?.toLowerCase() === "success"
            ? "SUCCESS"
            : "FAILED") as TransactionStatus,
          errorCode: errorCode || null,
          method: method || null,
        };

        transactions.push(transaction);
        transactionIndex++;
      }

      state.transactions.push(...transactions);

      if (transactions.length > 0) {
        const timestamps = transactions
          .map((t) => new Date(t.timestamp).getTime())
          .filter((t) => !isNaN(t));
        state.metadata = {
          importedAt: action.input.timestamp,
          totalTransactions: state.transactions.length,
          dateRange:
            timestamps.length > 0
              ? {
                  startDate: new Date(Math.min(...timestamps)).toISOString(),
                  endDate: new Date(Math.max(...timestamps)).toISOString(),
                }
              : null,
        };
      } else {
        state.metadata = {
          importedAt: action.input.timestamp,
          totalTransactions: state.transactions.length,
          dateRange: null,
        };
      }
    },
    addTransactionOperation(state, action) {
      const transaction = {
        id: action.input.id,
        txHash: action.input.txHash,
        blockNumber: action.input.blockNumber,
        timestamp: action.input.timestamp,
        fromAddress: action.input.fromAddress || null,
        toAddress: action.input.toAddress || null,
        contractAddress: action.input.contractAddress || null,
        valueIn: action.input.valueIn
          ? {
              amount: action.input.valueIn.amount,
              token: action.input.valueIn.token,
              usdValue: action.input.valueIn.usdValue ?? null,
            }
          : null,
        valueOut: action.input.valueOut
          ? {
              amount: action.input.valueOut.amount,
              token: action.input.valueOut.token,
              usdValue: action.input.valueOut.usdValue ?? null,
            }
          : null,
        txnFee: {
          amount: action.input.txnFee.amount,
          token: action.input.txnFee.token,
          usdValue: action.input.txnFee.usdValue ?? null,
        },
        historicalPrice: action.input.historicalPrice || null,
        currentValue: action.input.currentValue || null,
        convertedValue: action.input.convertedValue || null,
        status: action.input.status,
        errorCode: action.input.errorCode || null,
        method: action.input.method || null,
      };

      state.transactions.push(transaction);

      state.metadata = {
        importedAt: state.metadata?.importedAt || action.input.timestamp,
        totalTransactions: state.transactions.length,
        dateRange: state.metadata?.dateRange || {
          startDate: action.input.timestamp,
          endDate: action.input.timestamp,
        },
      };
    },
    updateTransactionOperation(state, action) {
      const transactionIndex = state.transactions.findIndex(
        (t) => t.id === action.input.id,
      );
      if (transactionIndex === -1) {
        throw new Error(`Transaction with ID ${action.input.id} not found`);
      }

      const transaction = state.transactions[transactionIndex];
      if (action.input.txHash) transaction.txHash = action.input.txHash;
      if (action.input.blockNumber)
        transaction.blockNumber = action.input.blockNumber;
      if (action.input.timestamp)
        transaction.timestamp = action.input.timestamp;
      if (action.input.fromAddress !== undefined)
        transaction.fromAddress = action.input.fromAddress;
      if (action.input.toAddress !== undefined)
        transaction.toAddress = action.input.toAddress;
      if (action.input.contractAddress !== undefined)
        transaction.contractAddress = action.input.contractAddress;
      if (action.input.valueIn !== undefined)
        transaction.valueIn = action.input.valueIn
          ? {
              amount: action.input.valueIn.amount,
              token: action.input.valueIn.token,
              usdValue: action.input.valueIn.usdValue ?? null,
            }
          : null;
      if (action.input.valueOut !== undefined)
        transaction.valueOut = action.input.valueOut
          ? {
              amount: action.input.valueOut.amount,
              token: action.input.valueOut.token,
              usdValue: action.input.valueOut.usdValue ?? null,
            }
          : null;
      if (action.input.txnFee)
        transaction.txnFee = {
          amount: action.input.txnFee.amount,
          token: action.input.txnFee.token,
          usdValue: action.input.txnFee.usdValue ?? null,
        };
      if (action.input.historicalPrice !== undefined)
        transaction.historicalPrice = action.input.historicalPrice;
      if (action.input.currentValue !== undefined)
        transaction.currentValue = action.input.currentValue;
      if (action.input.convertedValue !== undefined)
        transaction.convertedValue = action.input.convertedValue;
      if (action.input.status) transaction.status = action.input.status;
      if (action.input.errorCode !== undefined)
        transaction.errorCode = action.input.errorCode;
      if (action.input.method !== undefined)
        transaction.method = action.input.method;
    },
    deleteTransactionOperation(state, action) {
      const transactionIndex = state.transactions.findIndex(
        (t) => t.id === action.input.id,
      );
      if (transactionIndex === -1) {
        throw new Error(`Transaction with ID ${action.input.id} not found`);
      }

      state.transactions.splice(transactionIndex, 1);

      state.metadata = {
        importedAt: state.metadata?.importedAt || new Date().toISOString(),
        totalTransactions: state.transactions.length,
        dateRange: state.metadata?.dateRange || null,
      };
    },
  };
