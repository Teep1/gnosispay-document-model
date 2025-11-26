/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isCryptoTransactionAnalyticsDocument,
  calculateAnalytics,
  CalculateAnalyticsInputSchema,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

describe("Analytics Operations", () => {
  it("should handle calculateAnalytics operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CalculateAnalyticsInputSchema());

    const updatedDocument = reducer(document, calculateAnalytics(input));

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CALCULATE_ANALYTICS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
