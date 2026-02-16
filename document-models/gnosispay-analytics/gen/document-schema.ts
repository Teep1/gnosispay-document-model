import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { gnosispayAnalyticsDocumentType } from "./document-type.js";
import { GnosispayAnalyticsStateSchema } from "./schema/zod.js";
import type {
  GnosispayAnalyticsDocument,
  GnosispayAnalyticsPHState,
} from "./types.js";

/** Schema for validating the header object of a GnosispayAnalytics document */
export const GnosispayAnalyticsDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(gnosispayAnalyticsDocumentType),
  });

/** Schema for validating the state object of a GnosispayAnalytics document */
export const GnosispayAnalyticsPHStateSchema = BaseDocumentStateSchema.extend({
  global: GnosispayAnalyticsStateSchema(),
});

export const GnosispayAnalyticsDocumentSchema = z.object({
  header: GnosispayAnalyticsDocumentHeaderSchema,
  state: GnosispayAnalyticsPHStateSchema,
  initialState: GnosispayAnalyticsPHStateSchema,
});

/** Simple helper function to check if a state object is a GnosispayAnalytics document state object */
export function isGnosispayAnalyticsState(
  state: unknown,
): state is GnosispayAnalyticsPHState {
  return GnosispayAnalyticsPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a GnosispayAnalytics document state object */
export function assertIsGnosispayAnalyticsState(
  state: unknown,
): asserts state is GnosispayAnalyticsPHState {
  GnosispayAnalyticsPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a GnosispayAnalytics document */
export function isGnosispayAnalyticsDocument(
  document: unknown,
): document is GnosispayAnalyticsDocument {
  return GnosispayAnalyticsDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a GnosispayAnalytics document */
export function assertIsGnosispayAnalyticsDocument(
  document: unknown,
): asserts document is GnosispayAnalyticsDocument {
  GnosispayAnalyticsDocumentSchema.parse(document);
}
