// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { CryptoTransactionAnalyticsPHState } from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

import { cryptoTransactionAnalyticsTransactionManagementOperations } from "../src/reducers/transaction-management.js";
import { cryptoTransactionAnalyticsCurrencyManagementOperations } from "../src/reducers/currency-management.js";
import { cryptoTransactionAnalyticsAnalyticsOperations } from "../src/reducers/analytics.js";

import {
  ImportCsvTransactionsInputSchema,
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
  SetBaseCurrencyInputSchema,
  UpdateExchangeRatesInputSchema,
  ConvertTransactionValuesInputSchema,
  CalculateAnalyticsInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<CryptoTransactionAnalyticsPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }

  switch (action.type) {
    case "IMPORT_CSV_TRANSACTIONS":
      ImportCsvTransactionsInputSchema().parse(action.input);
      cryptoTransactionAnalyticsTransactionManagementOperations.importCsvTransactionsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "ADD_TRANSACTION":
      AddTransactionInputSchema().parse(action.input);
      cryptoTransactionAnalyticsTransactionManagementOperations.addTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "UPDATE_TRANSACTION":
      UpdateTransactionInputSchema().parse(action.input);
      cryptoTransactionAnalyticsTransactionManagementOperations.updateTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "DELETE_TRANSACTION":
      DeleteTransactionInputSchema().parse(action.input);
      cryptoTransactionAnalyticsTransactionManagementOperations.deleteTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "SET_BASE_CURRENCY":
      SetBaseCurrencyInputSchema().parse(action.input);
      cryptoTransactionAnalyticsCurrencyManagementOperations.setBaseCurrencyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "UPDATE_EXCHANGE_RATES":
      UpdateExchangeRatesInputSchema().parse(action.input);
      cryptoTransactionAnalyticsCurrencyManagementOperations.updateExchangeRatesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "CONVERT_TRANSACTION_VALUES":
      ConvertTransactionValuesInputSchema().parse(action.input);
      cryptoTransactionAnalyticsCurrencyManagementOperations.convertTransactionValuesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    case "CALCULATE_ANALYTICS":
      CalculateAnalyticsInputSchema().parse(action.input);
      cryptoTransactionAnalyticsAnalyticsOperations.calculateAnalyticsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );
      break;

    default:
      return state;
  }
};

export const reducer =
  createReducer<CryptoTransactionAnalyticsPHState>(stateReducer);
