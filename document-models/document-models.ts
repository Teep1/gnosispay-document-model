import type { DocumentModelModule } from "document-model";
import { GnosispayAnalytics } from "./gnosispay-analytics/module.js";

export const documentModels: DocumentModelModule<any>[] = [
  GnosispayAnalytics,
];
