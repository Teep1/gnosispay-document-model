import type { GnosispayAnalyticsTransactionManagementAction } from "./transaction-management/actions.js";
import type { GnosispayAnalyticsCurrencyManagementAction } from "./currency-management/actions.js";
import type { GnosispayAnalyticsAnalyticsAction } from "./analytics/actions.js";

export * from "./transaction-management/actions.js";
export * from "./currency-management/actions.js";
export * from "./analytics/actions.js";

export type GnosispayAnalyticsAction =
  | GnosispayAnalyticsTransactionManagementAction
  | GnosispayAnalyticsCurrencyManagementAction
  | GnosispayAnalyticsAnalyticsAction;
