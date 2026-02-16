import { type SignalDispatch } from "document-model";
import type {
  ImportCsvTransactionsAction,
  AddTransactionAction,
  UpdateTransactionAction,
  DeleteTransactionAction,
} from "./actions.js";
import type { GnosispayAnalyticsState } from "../types.js";

export interface GnosispayAnalyticsTransactionManagementOperations {
  importCsvTransactionsOperation: (
    state: GnosispayAnalyticsState,
    action: ImportCsvTransactionsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addTransactionOperation: (
    state: GnosispayAnalyticsState,
    action: AddTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTransactionOperation: (
    state: GnosispayAnalyticsState,
    action: UpdateTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteTransactionOperation: (
    state: GnosispayAnalyticsState,
    action: DeleteTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
