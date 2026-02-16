import { createAction } from "document-model/core";
import { CalculateAnalyticsInputSchema } from "../schema/zod.js";
import type { CalculateAnalyticsInput } from "../types.js";
import type { CalculateAnalyticsAction } from "./actions.js";

export const calculateAnalytics = (input: CalculateAnalyticsInput) =>
  createAction<CalculateAnalyticsAction>(
    "CALCULATE_ANALYTICS",
    { ...input },
    undefined,
    CalculateAnalyticsInputSchema,
    "global",
  );
