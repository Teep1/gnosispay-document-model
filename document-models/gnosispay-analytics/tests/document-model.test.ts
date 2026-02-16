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
  gnosispayAnalyticsDocumentType,
  isGnosispayAnalyticsDocument,
  assertIsGnosispayAnalyticsDocument,
  isGnosispayAnalyticsState,
  assertIsGnosispayAnalyticsState,
} from "gnosis-tx-analytics/document-models/gnosispay-analytics";
import { ZodError } from "zod";

describe("GnosispayAnalytics Document Model", () => {
  it("should create a new GnosispayAnalytics document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(gnosispayAnalyticsDocumentType);
  });

  it("should create a new GnosispayAnalytics document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isGnosispayAnalyticsDocument(document)).toBe(true);
    expect(isGnosispayAnalyticsState(document.state)).toBe(true);
  });
  it("should reject a document that is not a GnosispayAnalytics document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsGnosispayAnalyticsDocument(wrongDocumentType)).toThrow();
      expect(isGnosispayAnalyticsDocument(wrongDocumentType)).toBe(false);
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
    expect(isGnosispayAnalyticsState(wrongState.state)).toBe(false);
    expect(assertIsGnosispayAnalyticsState(wrongState.state)).toThrow();
    expect(isGnosispayAnalyticsDocument(wrongState)).toBe(false);
    expect(assertIsGnosispayAnalyticsDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isGnosispayAnalyticsState(wrongInitialState.state)).toBe(false);
    expect(assertIsGnosispayAnalyticsState(wrongInitialState.state)).toThrow();
    expect(isGnosispayAnalyticsDocument(wrongInitialState)).toBe(false);
    expect(assertIsGnosispayAnalyticsDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isGnosispayAnalyticsDocument(missingIdInHeader)).toBe(false);
    expect(assertIsGnosispayAnalyticsDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isGnosispayAnalyticsDocument(missingNameInHeader)).toBe(false);
    expect(assertIsGnosispayAnalyticsDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isGnosispayAnalyticsDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsGnosispayAnalyticsDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isGnosispayAnalyticsDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsGnosispayAnalyticsDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
