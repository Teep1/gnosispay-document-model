import { type SignalDispatch } from "document-model";
import type {
  AddTransactionAction,
  UpdateTransactionAction,
  DeleteTransactionAction,
  ImportTransactionsAction,
} from "./actions.js";
import type { GnosispayAnalyticsState } from "../types.js";

export interface GnosispayAnalyticsTransactionManagementOperations {
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
  importTransactionsOperation: (
    state: GnosispayAnalyticsState,
    action: ImportTransactionsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
