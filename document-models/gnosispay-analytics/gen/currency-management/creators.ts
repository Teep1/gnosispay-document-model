import { createAction } from "document-model/core";
import {
  SetBaseCurrencyInputSchema,
  UpdateExchangeRatesInputSchema,
  ConvertTransactionValuesInputSchema,
} from "../schema/zod.js";
import type {
  SetBaseCurrencyInput,
  UpdateExchangeRatesInput,
  ConvertTransactionValuesInput,
} from "../types.js";
import type {
  SetBaseCurrencyAction,
  UpdateExchangeRatesAction,
  ConvertTransactionValuesAction,
} from "./actions.js";

export const setBaseCurrency = (input: SetBaseCurrencyInput) =>
  createAction<SetBaseCurrencyAction>(
    "SET_BASE_CURRENCY",
    { ...input },
    undefined,
    SetBaseCurrencyInputSchema,
    "global",
  );

export const updateExchangeRates = (input: UpdateExchangeRatesInput) =>
  createAction<UpdateExchangeRatesAction>(
    "UPDATE_EXCHANGE_RATES",
    { ...input },
    undefined,
    UpdateExchangeRatesInputSchema,
    "global",
  );

export const convertTransactionValues = (
  input: ConvertTransactionValuesInput,
) =>
  createAction<ConvertTransactionValuesAction>(
    "CONVERT_TRANSACTION_VALUES",
    { ...input },
    undefined,
    ConvertTransactionValuesInputSchema,
    "global",
  );
