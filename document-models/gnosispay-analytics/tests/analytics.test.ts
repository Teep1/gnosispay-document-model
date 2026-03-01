import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isGnosispayAnalyticsDocument,
  calculateAnalytics,
  CalculateAnalyticsInputSchema,
} from "@gnosispay-ph/analytics/document-models/gnosispay-analytics";

describe("AnalyticsOperations", () => {
  it("should handle calculateAnalytics operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CalculateAnalyticsInputSchema());

    const updatedDocument = reducer(document, calculateAnalytics(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
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
