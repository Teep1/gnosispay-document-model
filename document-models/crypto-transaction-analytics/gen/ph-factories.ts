/**
 * Factory methods for creating CryptoTransactionAnalyticsDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  CryptoTransactionAnalyticsDocument,
  CryptoTransactionAnalyticsLocalState,
  CryptoTransactionAnalyticsGlobalState,
  CryptoTransactionAnalyticsPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): CryptoTransactionAnalyticsGlobalState {
  return {
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
}

export function defaultLocalState(): CryptoTransactionAnalyticsLocalState {
  return {};
}

export function defaultPHState(): CryptoTransactionAnalyticsPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<CryptoTransactionAnalyticsGlobalState>,
): CryptoTransactionAnalyticsGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as CryptoTransactionAnalyticsGlobalState;
}

export function createLocalState(
  state?: Partial<CryptoTransactionAnalyticsLocalState>,
): CryptoTransactionAnalyticsLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as CryptoTransactionAnalyticsLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<CryptoTransactionAnalyticsGlobalState>,
  localState?: Partial<CryptoTransactionAnalyticsLocalState>,
): CryptoTransactionAnalyticsPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a CryptoTransactionAnalyticsDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createCryptoTransactionAnalyticsDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<CryptoTransactionAnalyticsGlobalState>;
    local?: Partial<CryptoTransactionAnalyticsLocalState>;
  }>,
): CryptoTransactionAnalyticsDocument {
  const document = createDocument(
    state
      ? createState(
          createBaseState(state.auth, state.document),
          state.global,
          state.local,
        )
      : undefined,
  );

  return document;
}
