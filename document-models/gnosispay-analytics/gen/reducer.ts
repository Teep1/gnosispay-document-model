// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { GnosispayAnalyticsPHState } from "gnosis-tx-analytics/document-models/gnosispay-analytics";

import { gnosispayAnalyticsTransactionManagementOperations } from "../src/reducers/transaction-management.js";
import { gnosispayAnalyticsCurrencyManagementOperations } from "../src/reducers/currency-management.js";
import { gnosispayAnalyticsAnalyticsOperations } from "../src/reducers/analytics.js";

import {
  AddTransactionInputSchema,
  UpdateTransactionInputSchema,
  DeleteTransactionInputSchema,
  ImportTransactionsInputSchema,
  SetBaseCurrencyInputSchema,
  UpdateExchangeRatesInputSchema,
  ConvertTransactionValuesInputSchema,
  CalculateAnalyticsInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<GnosispayAnalyticsPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "ADD_TRANSACTION": {
      AddTransactionInputSchema().parse(action.input);

      gnosispayAnalyticsTransactionManagementOperations.addTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TRANSACTION": {
      UpdateTransactionInputSchema().parse(action.input);

      gnosispayAnalyticsTransactionManagementOperations.updateTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_TRANSACTION": {
      DeleteTransactionInputSchema().parse(action.input);

      gnosispayAnalyticsTransactionManagementOperations.deleteTransactionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "IMPORT_TRANSACTIONS": {
      ImportTransactionsInputSchema().parse(action.input);

      gnosispayAnalyticsTransactionManagementOperations.importTransactionsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_BASE_CURRENCY": {
      SetBaseCurrencyInputSchema().parse(action.input);

      gnosispayAnalyticsCurrencyManagementOperations.setBaseCurrencyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_EXCHANGE_RATES": {
      UpdateExchangeRatesInputSchema().parse(action.input);

      gnosispayAnalyticsCurrencyManagementOperations.updateExchangeRatesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CONVERT_TRANSACTION_VALUES": {
      ConvertTransactionValuesInputSchema().parse(action.input);

      gnosispayAnalyticsCurrencyManagementOperations.convertTransactionValuesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CALCULATE_ANALYTICS": {
      CalculateAnalyticsInputSchema().parse(action.input);

      gnosispayAnalyticsAnalyticsOperations.calculateAnalyticsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer = createReducer<GnosispayAnalyticsPHState>(stateReducer);
