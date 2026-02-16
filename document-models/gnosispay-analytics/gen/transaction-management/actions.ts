import type { Action } from "document-model";
import type {
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
  ImportTransactionsInput,
} from "../types.js";

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
export type ImportTransactionsAction = Action & {
  type: "IMPORT_TRANSACTIONS";
  input: ImportTransactionsInput;
};

export type GnosispayAnalyticsTransactionManagementAction =
  | AddTransactionAction
  | UpdateTransactionAction
  | DeleteTransactionAction
  | ImportTransactionsAction;
