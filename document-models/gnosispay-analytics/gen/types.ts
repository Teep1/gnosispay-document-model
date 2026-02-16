import type { PHDocument, PHBaseState } from "document-model";
import type { GnosispayAnalyticsAction } from "./actions.js";
import type { GnosispayAnalyticsState as GnosispayAnalyticsGlobalState } from "./schema/types.js";

type GnosispayAnalyticsLocalState = Record<PropertyKey, never>;

type GnosispayAnalyticsPHState = PHBaseState & {
  global: GnosispayAnalyticsGlobalState;
  local: GnosispayAnalyticsLocalState;
};
type GnosispayAnalyticsDocument = PHDocument<GnosispayAnalyticsPHState>;

export * from "./schema/types.js";

export type {
  GnosispayAnalyticsGlobalState,
  GnosispayAnalyticsLocalState,
  GnosispayAnalyticsPHState,
  GnosispayAnalyticsAction,
  GnosispayAnalyticsDocument,
};
