import type { Action } from "document-model";
import type {
  SetBaseCurrencyInput,
  UpdateExchangeRatesInput,
  ConvertTransactionValuesInput,
} from "../types.js";

export type SetBaseCurrencyAction = Action & {
  type: "SET_BASE_CURRENCY";
  input: SetBaseCurrencyInput;
};
export type UpdateExchangeRatesAction = Action & {
  type: "UPDATE_EXCHANGE_RATES";
  input: UpdateExchangeRatesInput;
};
export type ConvertTransactionValuesAction = Action & {
  type: "CONVERT_TRANSACTION_VALUES";
  input: ConvertTransactionValuesInput;
};

export type GnosispayAnalyticsCurrencyManagementAction =
  | SetBaseCurrencyAction
  | UpdateExchangeRatesAction
  | ConvertTransactionValuesAction;
