import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  CryptoTransactionAnalyticsGlobalState,
  CryptoTransactionAnalyticsLocalState,
} from "./types.js";
import type { CryptoTransactionAnalyticsPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { cryptoTransactionAnalyticsDocumentType } from "./document-type.js";
import {
  isCryptoTransactionAnalyticsDocument,
  assertIsCryptoTransactionAnalyticsDocument,
  isCryptoTransactionAnalyticsState,
  assertIsCryptoTransactionAnalyticsState,
} from "./document-schema.js";

export const initialGlobalState: CryptoTransactionAnalyticsGlobalState = {
  transactions: [],
  analytics: null,
  metadata: null,
  detectedBaseCurrency: null,
  settings: {
    baseCurrency: "USD",
    lastForexUpdate: null,
    exchangeRates: [],
  },
};
export const initialLocalState: CryptoTransactionAnalyticsLocalState = {};

export const utils: DocumentModelUtils<CryptoTransactionAnalyticsPHState> = {
  fileExtension: "cta",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = cryptoTransactionAnalyticsDocumentType;

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
  isStateOfType(state) {
    return isCryptoTransactionAnalyticsState(state);
  },
  assertIsStateOfType(state) {
    return assertIsCryptoTransactionAnalyticsState(state);
  },
  isDocumentOfType(document) {
    return isCryptoTransactionAnalyticsDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsCryptoTransactionAnalyticsDocument(document);
  },
};

export const createDocument = utils.createDocument;
export const createState = utils.createState;
export const saveToFileHandle = utils.saveToFileHandle;
export const loadFromInput = utils.loadFromInput;
export const isStateOfType = utils.isStateOfType;
export const assertIsStateOfType = utils.assertIsStateOfType;
export const isDocumentOfType = utils.isDocumentOfType;
export const assertIsDocumentOfType = utils.assertIsDocumentOfType;
