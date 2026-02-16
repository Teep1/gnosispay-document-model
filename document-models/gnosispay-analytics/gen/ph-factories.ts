/**
 * Factory methods for creating GnosispayAnalyticsDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  GnosispayAnalyticsDocument,
  GnosispayAnalyticsLocalState,
  GnosispayAnalyticsGlobalState,
  GnosispayAnalyticsPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): GnosispayAnalyticsGlobalState {
  return {
    transactions: [],
    analytics: null,
    metadata: null,
    settings: {
      baseCurrency: "USD",
      lastForexUpdate: null,
      exchangeRates: [],
    },
  };
}

export function defaultLocalState(): GnosispayAnalyticsLocalState {
  return {};
}

export function defaultPHState(): GnosispayAnalyticsPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<GnosispayAnalyticsGlobalState>,
): GnosispayAnalyticsGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as GnosispayAnalyticsGlobalState;
}

export function createLocalState(
  state?: Partial<GnosispayAnalyticsLocalState>,
): GnosispayAnalyticsLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as GnosispayAnalyticsLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<GnosispayAnalyticsGlobalState>,
  localState?: Partial<GnosispayAnalyticsLocalState>,
): GnosispayAnalyticsPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a GnosispayAnalyticsDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createGnosispayAnalyticsDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<GnosispayAnalyticsGlobalState>;
    local?: Partial<GnosispayAnalyticsLocalState>;
  }>,
): GnosispayAnalyticsDocument {
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
