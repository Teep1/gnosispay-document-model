import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the GnosispayAnalytics document type */
export const GnosispayAnalyticsEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["gnosispay/analytics"],
  config: {
    id: "gnosispay-analytics-editor",
    name: "gnosispay-analytics-editor",
  },
};
