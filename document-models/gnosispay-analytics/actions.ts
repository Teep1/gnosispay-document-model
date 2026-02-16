import { baseActions } from "document-model";
import {
  transactionManagementActions,
  currencyManagementActions,
  analyticsActions,
} from "./gen/creators.js";

/** Actions for the GnosispayAnalytics document model */

export const actions = {
  ...baseActions,
  ...transactionManagementActions,
  ...currencyManagementActions,
  ...analyticsActions,
};
