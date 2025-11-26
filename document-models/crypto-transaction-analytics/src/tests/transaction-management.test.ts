/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isCryptoTransactionAnalyticsDocument,
  importCsvTransactions,
  ImportCsvTransactionsInputSchema,
  addTransaction,
  AddTransactionInputSchema,
  updateTransaction,
  UpdateTransactionInputSchema,
  deleteTransaction,
  DeleteTransactionInputSchema,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

describe("TransactionManagement Operations", () => {
  it("should handle importCsvTransactions operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ImportCsvTransactionsInputSchema());

    const updatedDocument = reducer(document, importCsvTransactions(input));

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "IMPORT_CSV_TRANSACTIONS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle addTransaction operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTransactionInputSchema());

    const updatedDocument = reducer(document, addTransaction(input));

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
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

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
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

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_TRANSACTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
