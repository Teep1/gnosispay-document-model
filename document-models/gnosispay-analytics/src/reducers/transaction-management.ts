import type { TransactionStatus } from "../../gen/schema/types.js";
import { EmptyTransactionsError } from "../../gen/transaction-management/error.js";
import type { GnosispayAnalyticsTransactionManagementOperations } from "gnosis-tx-analytics/document-models/gnosispay-analytics";

export const gnosispayAnalyticsTransactionManagementOperations: GnosispayAnalyticsTransactionManagementOperations =
  {
    addTransactionOperation(state, action) {
      // Filter out excluded contract addresses
      const EXCLUDED_CONTRACTS = new Set([
        "0x5cb9073902f2035222b9749f8fb0c9bfe5527108".toLowerCase(),
      ]);

      if (
        action.input.contractAddress &&
        EXCLUDED_CONTRACTS.has(action.input.contractAddress.toLowerCase())
      ) {
        // Skip adding transaction with excluded contract address
        return;
      }

      const transaction = {
        id: action.input.id,
        txHash: action.input.txHash,
        blockNumber: action.input.blockNumber,
        timestamp: action.input.timestamp,
        fromAddress: action.input.fromAddress || null,
        toAddress: action.input.toAddress || null,
        contractAddress: action.input.contractAddress || null,
        category: null as string | null,
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
        transactionType: action.input.transactionType,
        signedAmount: action.input.signedAmount,
      };

      state.transactions.push(transaction);

      state.metadata = {
        importedAt: state.metadata?.importedAt || action.input.timestamp,
        totalTransactions: state.transactions.length,
        dateRange: state.metadata?.dateRange || {
          startDate: action.input.timestamp,
          endDate: action.input.timestamp,
        },
        trackedAddress: state.metadata?.trackedAddress || null,
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
        trackedAddress: state.metadata?.trackedAddress || null,
      };
    },
    importTransactionsOperation(state, action) {
      if (
        !action.input.transactions ||
        action.input.transactions.length === 0
      ) {
        throw new EmptyTransactionsError(
          "At least one transaction is required",
        );
      }

      if (!state.transactions) {
        state.transactions = [];
      }

      const EXCLUDED_CONTRACTS = new Set([
        "0x5cb9073902f2035222b9749f8fb0c9bfe5527108",
      ]);

      const existingHashes = new Set(state.transactions.map((t) => t.txHash));
      const newTransactions: typeof state.transactions = [];

      for (const input of action.input.transactions) {
        if (existingHashes.has(input.txHash)) continue;
        if (
          input.contractAddress &&
          EXCLUDED_CONTRACTS.has(input.contractAddress.toLowerCase())
        )
          continue;

        newTransactions.push({
          id: input.id,
          txHash: input.txHash,
          blockNumber: input.blockNumber,
          timestamp: input.timestamp,
          fromAddress: input.fromAddress || null,
          toAddress: input.toAddress || null,
          contractAddress: input.contractAddress || null,
          category: null,
          valueIn: input.valueIn
            ? {
                amount: input.valueIn.amount,
                token: input.valueIn.token,
                usdValue: input.valueIn.usdValue ?? null,
              }
            : null,
          valueOut: input.valueOut
            ? {
                amount: input.valueOut.amount,
                token: input.valueOut.token,
                usdValue: input.valueOut.usdValue ?? null,
              }
            : null,
          txnFee: {
            amount: input.txnFee.amount,
            token: input.txnFee.token,
            usdValue: input.txnFee.usdValue ?? null,
          },
          historicalPrice: input.historicalPrice || null,
          currentValue: input.currentValue || null,
          convertedValue: input.convertedValue || null,
          status: input.status as TransactionStatus,
          errorCode: input.errorCode || null,
          method: input.method || null,
          transactionType: input.transactionType,
          signedAmount: input.signedAmount,
        });
        existingHashes.add(input.txHash);
      }

      state.transactions.push(...newTransactions);

      if (newTransactions.length > 0) {
        const timestamps = newTransactions
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
              : state.metadata?.dateRange || null,
          trackedAddress: action.input.trackedAddress,
        };
      } else {
        state.metadata = {
          importedAt: action.input.timestamp,
          totalTransactions: state.transactions.length,
          dateRange: state.metadata?.dateRange || null,
          trackedAddress: action.input.trackedAddress,
        };
      }
    },
  };
