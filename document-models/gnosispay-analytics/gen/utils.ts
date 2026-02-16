import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  GnosispayAnalyticsGlobalState,
  GnosispayAnalyticsLocalState,
} from "./types.js";
import type { GnosispayAnalyticsPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { gnosispayAnalyticsDocumentType } from "./document-type.js";
import {
  isGnosispayAnalyticsDocument,
  assertIsGnosispayAnalyticsDocument,
  isGnosispayAnalyticsState,
  assertIsGnosispayAnalyticsState,
} from "./document-schema.js";

export const initialGlobalState: GnosispayAnalyticsGlobalState = {
  transactions: [],
  analytics: null,
  metadata: null,
  settings: {
    baseCurrency: "USD",
    lastForexUpdate: null,
    exchangeRates: [],
  },
};
export const initialLocalState: GnosispayAnalyticsLocalState = {};

export const utils: DocumentModelUtils<GnosispayAnalyticsPHState> = {
  fileExtension: "gpa",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = gnosispayAnalyticsDocumentType;

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
    return isGnosispayAnalyticsState(state);
  },
  assertIsStateOfType(state) {
    return assertIsGnosispayAnalyticsState(state);
  },
  isDocumentOfType(document) {
    return isGnosispayAnalyticsDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsGnosispayAnalyticsDocument(document);
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
