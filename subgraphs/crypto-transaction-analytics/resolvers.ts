import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import { addFile } from "document-drive";
import { setName } from "document-model";
import {
  actions,
  cryptoTransactionAnalyticsDocumentType,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

import type {
  CryptoTransactionAnalyticsDocument,
  ImportCsvTransactionsInput,
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
  SetBaseCurrencyInput,
  UpdateExchangeRatesInput,
  ConvertTransactionValuesInput,
  CalculateAnalyticsInput,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => {
  const reactor = subgraph.reactor;

  return {
    Query: {
      CryptoTransactionAnalytics: async () => {
        return {
          getDocument: async (args: { docId: string; driveId: string }) => {
            const { docId, driveId } = args;

            if (!docId) {
              throw new Error("Document id is required");
            }

            if (driveId) {
              const docIds = await reactor.getDocuments(driveId);
              if (!docIds.includes(docId)) {
                throw new Error(
                  `Document with id ${docId} is not part of ${driveId}`,
                );
              }
            }

            const doc =
              await reactor.getDocument<CryptoTransactionAnalyticsDocument>(
                docId,
              );
            return {
              driveId: driveId,
              ...doc,
              ...doc.header,
              created: doc.header.createdAtUtcIso,
              lastModified: doc.header.lastModifiedAtUtcIso,
              state: doc.state.global,
              stateJSON: doc.state.global,
              revision: doc.header?.revision?.global ?? 0,
            };
          },
          getDocuments: async (args: { driveId: string }) => {
            const { driveId } = args;
            const docsIds = await reactor.getDocuments(driveId);
            const docs = await Promise.all(
              docsIds.map(async (docId) => {
                const doc =
                  await reactor.getDocument<CryptoTransactionAnalyticsDocument>(
                    docId,
                  );
                return {
                  driveId: driveId,
                  ...doc,
                  ...doc.header,
                  created: doc.header.createdAtUtcIso,
                  lastModified: doc.header.lastModifiedAtUtcIso,
                  state: doc.state.global,
                  stateJSON: doc.state.global,
                  revision: doc.header?.revision?.global ?? 0,
                };
              }),
            );

            return docs.filter(
              (doc) =>
                doc.header.documentType ===
                cryptoTransactionAnalyticsDocumentType,
            );
          },
        };
      },
    },
    Mutation: {
      CryptoTransactionAnalytics_createDocument: async (
        _: unknown,
        args: { name: string; driveId?: string },
      ) => {
        const { driveId, name } = args;
        const document = await reactor.addDocument(
          cryptoTransactionAnalyticsDocumentType,
        );

        if (driveId) {
          await reactor.addAction(
            driveId,
            addFile({
              name,
              id: document.header.id,
              documentType: cryptoTransactionAnalyticsDocumentType,
            }),
          );
        }

        if (name) {
          await reactor.addAction(document.header.id, setName(name));
        }

        return document.header.id;
      },

      CryptoTransactionAnalytics_importCsvTransactions: async (
        _: unknown,
        args: { docId: string; input: ImportCsvTransactionsInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.importCsvTransactions(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to importCsvTransactions",
          );
        }

        return true;
      },

      CryptoTransactionAnalytics_addTransaction: async (
        _: unknown,
        args: { docId: string; input: AddTransactionInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.addTransaction(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(result.error?.message ?? "Failed to addTransaction");
        }

        return true;
      },

      CryptoTransactionAnalytics_updateTransaction: async (
        _: unknown,
        args: { docId: string; input: UpdateTransactionInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.updateTransaction(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to updateTransaction",
          );
        }

        return true;
      },

      CryptoTransactionAnalytics_deleteTransaction: async (
        _: unknown,
        args: { docId: string; input: DeleteTransactionInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.deleteTransaction(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to deleteTransaction",
          );
        }

        return true;
      },

      CryptoTransactionAnalytics_setBaseCurrency: async (
        _: unknown,
        args: { docId: string; input: SetBaseCurrencyInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.setBaseCurrency(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(result.error?.message ?? "Failed to setBaseCurrency");
        }

        return true;
      },

      CryptoTransactionAnalytics_updateExchangeRates: async (
        _: unknown,
        args: { docId: string; input: UpdateExchangeRatesInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.updateExchangeRates(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to updateExchangeRates",
          );
        }

        return true;
      },

      CryptoTransactionAnalytics_convertTransactionValues: async (
        _: unknown,
        args: { docId: string; input: ConvertTransactionValuesInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.convertTransactionValues(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to convertTransactionValues",
          );
        }

        return true;
      },

      CryptoTransactionAnalytics_calculateAnalytics: async (
        _: unknown,
        args: { docId: string; input: CalculateAnalyticsInput },
      ) => {
        const { docId, input } = args;
        const doc =
          await reactor.getDocument<CryptoTransactionAnalyticsDocument>(docId);
        if (!doc) {
          throw new Error("Document not found");
        }

        const result = await reactor.addAction(
          docId,
          actions.calculateAnalytics(input),
        );

        if (result.status !== "SUCCESS") {
          throw new Error(
            result.error?.message ?? "Failed to calculateAnalytics",
          );
        }

        return true;
      },
    },
  };
};
