import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the Todo List document type */
export const CryptoTxAnalyticsEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["crypto/transaction-analytics"],
  config: {
    id: "crypto-tx-analytics-editor",
    name: "crypto-tx-analytics-editor",
  },
};
