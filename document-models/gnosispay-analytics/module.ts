import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { GnosispayAnalyticsPHState } from "gnosis-tx-analytics/document-models/gnosispay-analytics";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "gnosis-tx-analytics/document-models/gnosispay-analytics";

/** Document model module for the GnosispayAnalytics document type */
export const GnosispayAnalytics: DocumentModelModule<GnosispayAnalyticsPHState> =
  {
    version: 1,
    reducer,
    actions,
    utils,
    documentModel: createState(defaultBaseState(), documentModel),
  };
