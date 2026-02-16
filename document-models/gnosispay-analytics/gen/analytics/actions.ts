import type { Action } from "document-model";
import type { CalculateAnalyticsInput } from "../types.js";

export type CalculateAnalyticsAction = Action & {
  type: "CALCULATE_ANALYTICS";
  input: CalculateAnalyticsInput;
};

export type GnosispayAnalyticsAnalyticsAction = CalculateAnalyticsAction;
