import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useDocumentById,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  CryptoTransactionAnalyticsDocument,
  CryptoTransactionAnalyticsAction,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";
import { isCryptoTransactionAnalyticsDocument } from "./gen/document-schema.js";

/** Hook to get a CryptoTransactionAnalytics document by its id */
export function useCryptoTransactionAnalyticsDocumentById(
  documentId: string | null | undefined,
):
  | [
      CryptoTransactionAnalyticsDocument,
      DocumentDispatch<CryptoTransactionAnalyticsAction>,
    ]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isCryptoTransactionAnalyticsDocument(document))
    return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected CryptoTransactionAnalytics document */
export function useSelectedCryptoTransactionAnalyticsDocument():
  | [
      CryptoTransactionAnalyticsDocument,
      DocumentDispatch<CryptoTransactionAnalyticsAction>,
    ]
  | [undefined, undefined] {
  const [document, dispatch] = useSelectedDocument();
  if (!isCryptoTransactionAnalyticsDocument(document))
    return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get all CryptoTransactionAnalytics documents in the selected drive */
export function useCryptoTransactionAnalyticsDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isCryptoTransactionAnalyticsDocument);
}

/** Hook to get all CryptoTransactionAnalytics documents in the selected folder */
export function useCryptoTransactionAnalyticsDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(
    isCryptoTransactionAnalyticsDocument,
  );
}
