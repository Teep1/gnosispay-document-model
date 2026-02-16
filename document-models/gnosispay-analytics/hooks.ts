import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  GnosispayAnalyticsAction,
  GnosispayAnalyticsDocument,
} from "gnosis-tx-analytics/document-models/gnosispay-analytics";
import {
  assertIsGnosispayAnalyticsDocument,
  isGnosispayAnalyticsDocument,
} from "./gen/document-schema.js";

/** Hook to get a GnosispayAnalytics document by its id */
export function useGnosispayAnalyticsDocumentById(
  documentId: string | null | undefined,
):
  | [GnosispayAnalyticsDocument, DocumentDispatch<GnosispayAnalyticsAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isGnosispayAnalyticsDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected GnosispayAnalytics document */
export function useSelectedGnosispayAnalyticsDocument(): [
  GnosispayAnalyticsDocument,
  DocumentDispatch<GnosispayAnalyticsAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsGnosispayAnalyticsDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all GnosispayAnalytics documents in the selected drive */
export function useGnosispayAnalyticsDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isGnosispayAnalyticsDocument);
}

/** Hook to get all GnosispayAnalytics documents in the selected folder */
export function useGnosispayAnalyticsDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isGnosispayAnalyticsDocument);
}
