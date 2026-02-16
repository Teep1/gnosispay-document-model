import { createAction } from "document-model/core";
import {
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
  ImportTransactionsInputSchema,
} from "../schema/zod.js";
import type {
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
  ImportTransactionsInput,
} from "../types.js";
import type {
  AddTransactionAction,
  UpdateTransactionAction,
  DeleteTransactionAction,
  ImportTransactionsAction,
} from "./actions.js";

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

export const importTransactions = (input: ImportTransactionsInput) =>
  createAction<ImportTransactionsAction>(
    "IMPORT_TRANSACTIONS",
    { ...input },
    undefined,
    ImportTransactionsInputSchema,
    "global",
  );
