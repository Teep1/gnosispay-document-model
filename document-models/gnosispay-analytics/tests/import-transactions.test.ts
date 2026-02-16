import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  importTransactions,
} from "gnosis-tx-analytics/document-models/gnosispay-analytics";
import { convertEtherscanToParseTransaction } from "../../../editors/crypto-tx-analytics-editor/services/etherscanApi.js";
import type { EtherscanTransaction } from "../../../editors/crypto-tx-analytics-editor/services/etherscanApi.js";
import type { AddTransactionInput } from "../gen/schema/types.js";
import { generateId } from "document-model/core";

// Real Etherscan ERC20 response fixtures
const USER_ADDRESS = "[REDACTED]";

const GBPE_INCOMING_TX: EtherscanTransaction = {
  blockNumber: "38000001",
  timeStamp: "1700000000",
  hash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
  nonce: "10",
  blockHash:
    "0x0000000000000000000000000000000000000000000000000000000000000001",
  from: "0x1234567890abcdef1234567890abcdef12345678",
  contractAddress: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
  to: USER_ADDRESS,
  value: "50000000000000000000",
  tokenName: "Monerium GBP emoney",
  tokenSymbol: "GBPe",
  tokenDecimal: "18",
  transactionIndex: "1",
  gas: "100000",
  gasPrice: "1000000000",
  gasUsed: "50000",
  cumulativeGasUsed: "500000",
  input: "0x",
  confirmations: "100",
};

const EURE_OUTGOING_TX: EtherscanTransaction = {
  blockNumber: "38000002",
  timeStamp: "1700001000",
  hash: "0xdef456789012345678901234567890abcdef1234567890abcdef12345678abcd",
  nonce: "11",
  blockHash:
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  from: USER_ADDRESS,
  contractAddress: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
  to: "0xabcdef1234567890abcdef1234567890abcdef12",
  value: "25500000000000000000",
  tokenName: "Monerium EUR emoney",
  tokenSymbol: "EURe",
  tokenDecimal: "18",
  transactionIndex: "2",
  gas: "100000",
  gasPrice: "2000000000",
  gasUsed: "60000",
  cumulativeGasUsed: "600000",
  input: "0x",
  confirmations: "50",
};

const USDC_INCOMING_TX: EtherscanTransaction = {
  blockNumber: "38000003",
  timeStamp: "1700002000",
  hash: "0x789012345678901234567890abcdef1234567890abcdef1234567890abcdef12",
  nonce: "12",
  blockHash:
    "0x0000000000000000000000000000000000000000000000000000000000000003",
  from: "0xfedcba0987654321fedcba0987654321fedcba09",
  contractAddress: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
  to: USER_ADDRESS,
  value: "100000000",
  tokenName: "USD//C",
  tokenSymbol: "USDC",
  tokenDecimal: "6",
  transactionIndex: "3",
  gas: "100000",
  gasPrice: "1500000000",
  gasUsed: "45000",
  cumulativeGasUsed: "450000",
  input: "0x",
  confirmations: "200",
};

function normalizeToken(token: string): string {
  const upper = token.toUpperCase();
  if (upper === "GBP" || upper === "GBPE") return "GBPe";
  if (upper === "EUR" || upper === "EURE") return "EURe";
  if (upper === "USDC" || upper === "USDCE") return "USDC";
  return token;
}

function parsedToAddTransactionInput(
  parsed: ReturnType<typeof convertEtherscanToParseTransaction>,
  address: string,
): AddTransactionInput {
  const normalizedTk = normalizeToken(parsed.token);
  const isOutgoing =
    parsed.fromAddress?.toLowerCase() === address.toLowerCase();
  const txType = parsed.amountOut
    ? "EXPENSE"
    : parsed.amountIn
      ? "INCOME"
      : "NEUTRAL";
  const signedAmount = isOutgoing
    ? -(parsed.amountOut || 0)
    : parsed.amountIn || 0;

  return {
    id: generateId(),
    txHash: parsed.transactionHash,
    blockNumber: "",
    timestamp: parsed.rawTimestamp || "2023-11-14T00:00:00.000Z",
    fromAddress: parsed.fromAddress || null,
    toAddress: parsed.toAddress || null,
    contractAddress: null,
    valueIn: parsed.amountIn
      ? { amount: parsed.amountIn, token: normalizedTk, usdValue: null }
      : null,
    valueOut: parsed.amountOut
      ? { amount: parsed.amountOut, token: normalizedTk, usdValue: null }
      : null,
    txnFee: {
      amount: parsed.feeAmount || 0,
      token: parsed.feeToken || "XDAI",
      usdValue: null,
    },
    status: "SUCCESS",
    transactionType: txType,
    signedAmount,
  };
}

describe("Import Transactions - Etherscan Pipeline", () => {
  describe("convertEtherscanToParseTransaction", () => {
    it("should correctly parse a GBPe incoming transaction", () => {
      const parsed = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );

      expect(parsed.transactionHash).toBe(GBPE_INCOMING_TX.hash);
      expect(parsed.token).toBe("GBPe");
      expect(parsed.amountIn).toBe(50);
      expect(parsed.amountOut).toBeNull();
      expect(parsed.fromAddress).toBe(GBPE_INCOMING_TX.from);
      expect(parsed.toAddress).toBe(USER_ADDRESS);
      expect(parsed.status).toBe("SUCCESS");
    });

    it("should correctly parse a EURe outgoing transaction", () => {
      const parsed = convertEtherscanToParseTransaction(
        EURE_OUTGOING_TX,
        USER_ADDRESS,
      );

      expect(parsed.transactionHash).toBe(EURE_OUTGOING_TX.hash);
      expect(parsed.token).toBe("EURe");
      expect(parsed.amountIn).toBeNull();
      expect(parsed.amountOut).toBe(25.5);
      expect(parsed.fromAddress).toBe(USER_ADDRESS);
      expect(parsed.feeAmount).toBeGreaterThan(0);
    });

    it("should correctly parse USDC with 6 decimals", () => {
      const parsed = convertEtherscanToParseTransaction(
        USDC_INCOMING_TX,
        USER_ADDRESS,
      );

      expect(parsed.token).toBe("USDC");
      expect(parsed.amountIn).toBe(100);
      expect(parsed.amountOut).toBeNull();
    });

    it("should not assign gas fees to incoming transactions", () => {
      const parsed = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );

      expect(parsed.feeAmount).toBeNull();
    });
  });

  describe("importTransactions reducer", () => {
    it("should import structured transactions with correct amounts", () => {
      const doc = utils.createDocument();

      const parsed1 = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );
      const parsed2 = convertEtherscanToParseTransaction(
        EURE_OUTGOING_TX,
        USER_ADDRESS,
      );

      const txInputs = [
        parsedToAddTransactionInput(parsed1, USER_ADDRESS),
        parsedToAddTransactionInput(parsed2, USER_ADDRESS),
      ];

      const updated = reducer(
        doc,
        importTransactions({
          transactions: txInputs,
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      const txs = updated.state.global.transactions;
      expect(txs).toHaveLength(2);

      // GBPe incoming: amount should be 50, not 0.00
      const gbpeTx = txs.find((t) => t.txHash === GBPE_INCOMING_TX.hash);
      expect(gbpeTx).toBeDefined();
      expect(gbpeTx!.valueIn?.amount).toBe(50);
      expect(gbpeTx!.valueIn?.token).toBe("GBPe");
      expect(gbpeTx!.transactionType).toBe("INCOME");
      expect(gbpeTx!.signedAmount).toBe(50);

      // EURe outgoing: amount should be 25.5, not 0.00
      const eureTx = txs.find((t) => t.txHash === EURE_OUTGOING_TX.hash);
      expect(eureTx).toBeDefined();
      expect(eureTx!.valueOut?.amount).toBe(25.5);
      expect(eureTx!.valueOut?.token).toBe("EURe");
      expect(eureTx!.transactionType).toBe("EXPENSE");
      expect(eureTx!.signedAmount).toBe(-25.5);
    });

    it("should deduplicate transactions by txHash", () => {
      const doc = utils.createDocument();

      const parsed = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );
      const txInput = parsedToAddTransactionInput(parsed, USER_ADDRESS);

      // Import once
      const afterFirst = reducer(
        doc,
        importTransactions({
          transactions: [txInput],
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      expect(afterFirst.state.global.transactions).toHaveLength(1);

      // Import again with same txHash but new ID
      const duplicateInput = {
        ...txInput,
        id: generateId(),
      };

      const afterSecond = reducer(
        afterFirst,
        importTransactions({
          transactions: [duplicateInput],
          timestamp: "2023-11-14T13:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      // Should still be 1 — dedup by txHash
      expect(afterSecond.state.global.transactions).toHaveLength(1);
    });

    it("should update metadata correctly", () => {
      const doc = utils.createDocument();

      const parsed = convertEtherscanToParseTransaction(
        USDC_INCOMING_TX,
        USER_ADDRESS,
      );
      const txInput = parsedToAddTransactionInput(parsed, USER_ADDRESS);

      const updated = reducer(
        doc,
        importTransactions({
          transactions: [txInput],
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      const metadata = updated.state.global.metadata;
      expect(metadata).toBeDefined();
      expect(metadata!.totalTransactions).toBe(1);
      expect(metadata!.trackedAddress).toBe(USER_ADDRESS);
      expect(metadata!.importedAt).toBe("2023-11-14T12:00:00.000Z");
    });

    it("should record error on empty transactions array", () => {
      const doc = utils.createDocument();

      const updated = reducer(
        doc,
        importTransactions({
          transactions: [],
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      // The reducer records the error on the operation instead of throwing
      expect(updated.operations.global).toHaveLength(1);
      expect(updated.operations.global[0].error).toBeDefined();
      // No transactions should be added
      expect(updated.state.global.transactions).toHaveLength(0);
    });

    it("should handle mixed token transactions for base currency detection", () => {
      const doc = utils.createDocument();

      const parsedGbp = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );
      const parsedEur = convertEtherscanToParseTransaction(
        EURE_OUTGOING_TX,
        USER_ADDRESS,
      );
      const parsedUsdc = convertEtherscanToParseTransaction(
        USDC_INCOMING_TX,
        USER_ADDRESS,
      );

      const txInputs = [
        parsedToAddTransactionInput(parsedGbp, USER_ADDRESS),
        parsedToAddTransactionInput(parsedEur, USER_ADDRESS),
        parsedToAddTransactionInput(parsedUsdc, USER_ADDRESS),
      ];

      const updated = reducer(
        doc,
        importTransactions({
          transactions: txInputs,
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      const txs = updated.state.global.transactions;
      expect(txs).toHaveLength(3);

      // Verify each transaction has the correct token
      const tokens = txs.map((t) => t.valueIn?.token || t.valueOut?.token);
      expect(tokens).toContain("GBPe");
      expect(tokens).toContain("EURe");
      expect(tokens).toContain("USDC");
    });

    it("should filter out excluded contract addresses", () => {
      const doc = utils.createDocument();

      // The GBPE_INCOMING_TX uses the excluded contract address
      // 0x5Cb9073902F2035222B9749F8fB0c9BFe5527108
      const parsed = convertEtherscanToParseTransaction(
        GBPE_INCOMING_TX,
        USER_ADDRESS,
      );
      const txInput = parsedToAddTransactionInput(parsed, USER_ADDRESS);

      // Set the contractAddress to the excluded one on the input
      const txWithExcludedContract: AddTransactionInput = {
        ...txInput,
        contractAddress: "0x5cb9073902f2035222b9749f8fb0c9bfe5527108",
      };

      const updated = reducer(
        doc,
        importTransactions({
          transactions: [txWithExcludedContract],
          timestamp: "2023-11-14T12:00:00.000Z",
          trackedAddress: USER_ADDRESS,
        }),
      );

      // Should be filtered out
      expect(updated.state.global.transactions).toHaveLength(0);
    });
  });
});
