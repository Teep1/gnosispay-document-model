import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isGnosispayAnalyticsDocument,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
  importTransactions,
} from "@gnosispay-ph/analytics/document-models/gnosispay-analytics";

describe("TransactionManagementOperations", () => {
  it("should handle addTransaction operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTransactionInputSchema());

    const updatedDocument = reducer(document, addTransaction(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_TRANSACTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateTransaction operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTransactionInputSchema());

    const updatedDocument = reducer(document, updateTransaction(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TRANSACTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteTransaction operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteTransactionInputSchema());

    const updatedDocument = reducer(document, deleteTransaction(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_TRANSACTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle importTransactions operation", () => {
    const document = utils.createDocument();
    const input = {
      transactions: [
        {
          id: "test-tx-1",
          txHash: "0xabc123",
          blockNumber: "100",
          timestamp: "2024-01-01T00:00:00.000Z",
          fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
          toAddress: "[REDACTED]",
          contractAddress: null,
          valueIn: { amount: 50, token: "GBPe", usdValue: null },
          valueOut: null,
          txnFee: { amount: 0.001, token: "XDAI", usdValue: null },
          historicalPrice: null,
          currentValue: null,
          convertedValue: null,
          status: "SUCCESS" as const,
          errorCode: null,
          method: null,
          transactionType: "INCOME" as const,
          signedAmount: 50,
        },
      ],
      timestamp: "2024-01-01T00:00:00.000Z",
      trackedAddress: "[REDACTED]",
    };

    const updatedDocument = reducer(document, importTransactions(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "IMPORT_TRANSACTIONS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
    expect(updatedDocument.state.global.transactions).toHaveLength(1);
    expect(updatedDocument.state.global.transactions[0].valueIn?.amount).toBe(
      50,
    );
  });
});
