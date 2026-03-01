import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isGnosispayAnalyticsDocument,
  setBaseCurrency,
  updateExchangeRates,
  convertTransactionValues,
  SetBaseCurrencyInputSchema,
  UpdateExchangeRatesInputSchema,
  ConvertTransactionValuesInputSchema,
} from "@gnosispay-ph/analytics/document-models/gnosispay-analytics";

describe("CurrencyManagementOperations", () => {
  it("should handle setBaseCurrency operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetBaseCurrencyInputSchema());

    const updatedDocument = reducer(document, setBaseCurrency(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_BASE_CURRENCY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateExchangeRates operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateExchangeRatesInputSchema());

    const updatedDocument = reducer(document, updateExchangeRates(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_EXCHANGE_RATES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle convertTransactionValues operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ConvertTransactionValuesInputSchema());

    const updatedDocument = reducer(document, convertTransactionValues(input));

    expect(isGnosispayAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CONVERT_TRANSACTION_VALUES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
