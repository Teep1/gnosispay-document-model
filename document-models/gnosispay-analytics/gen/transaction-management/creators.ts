import { createAction } from "document-model/core";
import {
  ImportCsvTransactionsInputSchema,
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
} from "../schema/zod.js";
import type {
  ImportCsvTransactionsInput,
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
} from "../types.js";
import type {
  ImportCsvTransactionsAction,
  AddTransactionAction,
  UpdateTransactionAction,
  DeleteTransactionAction,
} from "./actions.js";

export const importCsvTransactions = (input: ImportCsvTransactionsInput) =>
  createAction<ImportCsvTransactionsAction>(
    "IMPORT_CSV_TRANSACTIONS",
    { ...input },
    undefined,
    ImportCsvTransactionsInputSchema,
    "global",
  );

export const addTransaction = (input: AddTransactionInput) =>
  createAction<AddTransactionAction>(
    "ADD_TRANSACTION",
    { ...input },
    undefined,
    AddTransactionInputSchema,
    "global",
  );

export const updateTransaction = (input: UpdateTransactionInput) =>
  createAction<UpdateTransactionAction>(
    "UPDATE_TRANSACTION",
    { ...input },
    undefined,
    UpdateTransactionInputSchema,
    "global",
  );

export const deleteTransaction = (input: DeleteTransactionInput) =>
  createAction<DeleteTransactionAction>(
    "DELETE_TRANSACTION",
    { ...input },
    undefined,
    DeleteTransactionInputSchema,
    "global",
  );
