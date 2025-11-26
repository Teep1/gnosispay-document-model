/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import {
  utils,
  initialGlobalState,
  initialLocalState,
  cryptoTransactionAnalyticsDocumentType,
  isCryptoTransactionAnalyticsDocument,
  assertIsCryptoTransactionAnalyticsDocument,
  isCryptoTransactionAnalyticsState,
  assertIsCryptoTransactionAnalyticsState,
} from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";
import { ZodError } from "zod";

describe("CryptoTransactionAnalytics Document Model", () => {
  it("should create a new CryptoTransactionAnalytics document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(
      cryptoTransactionAnalyticsDocumentType,
    );
  });

  it("should create a new CryptoTransactionAnalytics document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isCryptoTransactionAnalyticsDocument(document)).toBe(true);
    expect(isCryptoTransactionAnalyticsState(document.state)).toBe(true);
  });
  it("should reject a document that is not a CryptoTransactionAnalytics document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(
        assertIsCryptoTransactionAnalyticsDocument(wrongDocumentType),
      ).toThrow();
      expect(isCryptoTransactionAnalyticsDocument(wrongDocumentType)).toBe(
        false,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isCryptoTransactionAnalyticsState(wrongState.state)).toBe(false);
    expect(assertIsCryptoTransactionAnalyticsState(wrongState.state)).toThrow();
    expect(isCryptoTransactionAnalyticsDocument(wrongState)).toBe(false);
    expect(assertIsCryptoTransactionAnalyticsDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isCryptoTransactionAnalyticsState(wrongInitialState.state)).toBe(
      false,
    );
    expect(
      assertIsCryptoTransactionAnalyticsState(wrongInitialState.state),
    ).toThrow();
    expect(isCryptoTransactionAnalyticsDocument(wrongInitialState)).toBe(false);
    expect(
      assertIsCryptoTransactionAnalyticsDocument(wrongInitialState),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isCryptoTransactionAnalyticsDocument(missingIdInHeader)).toBe(false);
    expect(
      assertIsCryptoTransactionAnalyticsDocument(missingIdInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isCryptoTransactionAnalyticsDocument(missingNameInHeader)).toBe(
      false,
    );
    expect(
      assertIsCryptoTransactionAnalyticsDocument(missingNameInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(
      isCryptoTransactionAnalyticsDocument(missingCreatedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsCryptoTransactionAnalyticsDocument(
        missingCreatedAtUtcIsoInHeader,
      ),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isCryptoTransactionAnalyticsDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsCryptoTransactionAnalyticsDocument(
        missingLastModifiedAtUtcIsoInHeader,
      ),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
