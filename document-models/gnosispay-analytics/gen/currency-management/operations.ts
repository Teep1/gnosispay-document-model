import { type SignalDispatch } from "document-model";
import type {
  SetBaseCurrencyAction,
  UpdateExchangeRatesAction,
  ConvertTransactionValuesAction,
} from "./actions.js";
import type { GnosispayAnalyticsState } from "../types.js";

export interface GnosispayAnalyticsCurrencyManagementOperations {
  setBaseCurrencyOperation: (
    state: GnosispayAnalyticsState,
    action: SetBaseCurrencyAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateExchangeRatesOperation: (
    state: GnosispayAnalyticsState,
    action: UpdateExchangeRatesAction,
    dispatch?: SignalDispatch,
  ) => void;
  convertTransactionValuesOperation: (
    state: GnosispayAnalyticsState,
    action: ConvertTransactionValuesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
