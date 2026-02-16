import { type SignalDispatch } from "document-model";
import type { CalculateAnalyticsAction } from "./actions.js";
import type { GnosispayAnalyticsState } from "../types.js";

export interface GnosispayAnalyticsAnalyticsOperations {
  calculateAnalyticsOperation: (
    state: GnosispayAnalyticsState,
    action: CalculateAnalyticsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
