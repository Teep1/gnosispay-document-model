import type { Action } from "document-model";
import type {
  ImportCsvTransactionsInput,
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
} from "../types.js";

export type ImportCsvTransactionsAction = Action & {
  type: "IMPORT_CSV_TRANSACTIONS";
  input: ImportCsvTransactionsInput;
};
export type AddTransactionAction = Action & {
  type: "ADD_TRANSACTION";
  input: AddTransactionInput;
};
export type UpdateTransactionAction = Action & {
  type: "UPDATE_TRANSACTION";
  input: UpdateTransactionInput;
};
export type DeleteTransactionAction = Action & {
  type: "DELETE_TRANSACTION";
  input: DeleteTransactionInput;
};

export type GnosispayAnalyticsTransactionManagementAction =
  | ImportCsvTransactionsAction
  | AddTransactionAction
  | UpdateTransactionAction
  | DeleteTransactionAction;
