import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isGnosispayAnalyticsDocument,
  importCsvTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  ImportCsvTransactionsInputSchema,
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
} from "gnosis-tx-analytics/document-models/gnosispay-analytics";

describe("TransactionManagementOperations", () => {
  it("should handle importCsvTransactions operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ImportCsvTransactionsInputSchema());

    const updatedDocument = reducer(document, importCsvTransactions(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
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
});
