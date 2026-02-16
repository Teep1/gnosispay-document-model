import type { Transaction } from "../gen/schema/types.js";

/**
 * Gnosis Pay supported stablecoins
 */
export const GNOSIS_PAY_STABLECOINS = {
  USDC: "USDC",
  EURE: "EURe",
  GBPE: "GBPe",
} as const;

export type GnosisPayStablecoin =
  (typeof GNOSIS_PAY_STABLECOINS)[keyof typeof GNOSIS_PAY_STABLECOINS];

/**
 * Currency codes for the stablecoins
 */
export const STABLECOIN_CURRENCY_CODES = {
  USDC: "USD",
  EURe: "EUR",
  GBPe: "GBP",
} as const;

/**
 * Normalizes token symbols to handle variations (case-insensitive)
 * Maps common variations to standard Gnosis Pay stablecoin symbols
 */
export function normalizeTokenSymbol(token: string | null | undefined): string {
  if (!token) return "";
  const normalized = token.trim().toUpperCase();

  // Handle USDC variations
  if (normalized === "USDC" || normalized === "USD") return "USDC";

  // Handle EUR/EURe variations
  if (normalized === "EUR" || normalized === "EURE") return "EURe";

  // Handle GBP/GBPe variations
  if (normalized === "GBP" || normalized === "GBPE") return "GBPe";

  return token.trim();
}

/**
 * Checks if a token is a Gnosis Pay supported stablecoin
 */
export function isGnosisPayStablecoin(
  token: string | null | undefined,
): boolean {
  const normalized = normalizeTokenSymbol(token);
  return (
    normalized === GNOSIS_PAY_STABLECOINS.USDC ||
    normalized === GNOSIS_PAY_STABLECOINS.EURE ||
    normalized === GNOSIS_PAY_STABLECOINS.GBPE
  );
}

/**
 * Gets the currency code for a stablecoin
 */
export function getStablecoinCurrencyCode(
  stablecoin: GnosisPayStablecoin,
): string {
  return STABLECOIN_CURRENCY_CODES[stablecoin];
}

/**
 * Result of base currency detection
 */
export interface BaseCurrencyDetectionResult {
  stablecoin: GnosisPayStablecoin | null;
  currencyCode: string | null;
  confidence: number; // 0-1, higher means more confident
  transactionCounts: Record<GnosisPayStablecoin, number>;
  totalVolume: Record<GnosisPayStablecoin, number>;
  reason: string;
}

/**
 * Detects the base currency (primary stablecoin) for a Gnosis Pay address
 * based on transaction patterns.
 *
 * The detection algorithm considers:
 * 1. Number of transactions per stablecoin (primary factor)
 * 2. Total volume per stablecoin (secondary factor)
 * 3. Most recent transaction activity (tiebreaker)
 *
 * @param transactions - Array of transactions to analyze
 * @returns Detection result with the detected base currency and confidence
 */
export function detectBaseCurrency(
  transactions: Transaction[],
): BaseCurrencyDetectionResult {
  const result: BaseCurrencyDetectionResult = {
    stablecoin: null,
    currencyCode: null,
    confidence: 0,
    transactionCounts: {
      USDC: 0,
      EURe: 0,
      GBPe: 0,
    },
    totalVolume: {
      USDC: 0,
      EURe: 0,
      GBPe: 0,
    },
    reason: "",
  };

  if (!transactions || transactions.length === 0) {
    result.reason = "No transactions to analyze";
    return result;
  }

  // Count transactions and volumes for each stablecoin
  for (const tx of transactions) {
    // Check valueIn
    if (tx.valueIn?.token && isGnosisPayStablecoin(tx.valueIn.token)) {
      const normalized = normalizeTokenSymbol(tx.valueIn.token);
      if (isGnosisPayStablecoin(normalized)) {
        result.transactionCounts[normalized as GnosisPayStablecoin]++;
        result.totalVolume[normalized as GnosisPayStablecoin] +=
          tx.valueIn.amount || 0;
      }
    }

    // Check valueOut
    if (tx.valueOut?.token && isGnosisPayStablecoin(tx.valueOut.token)) {
      const normalized = normalizeTokenSymbol(tx.valueOut.token);
      if (isGnosisPayStablecoin(normalized)) {
        result.transactionCounts[normalized as GnosisPayStablecoin]++;
        result.totalVolume[normalized as GnosisPayStablecoin] +=
          tx.valueOut.amount || 0;
      }
    }

    // Check txnFee token (sometimes fees are paid in stablecoins)
    if (tx.txnFee?.token && isGnosisPayStablecoin(tx.txnFee.token)) {
      const normalized = normalizeTokenSymbol(tx.txnFee.token);
      if (isGnosisPayStablecoin(normalized)) {
        result.transactionCounts[normalized as GnosisPayStablecoin]++;
        result.totalVolume[normalized as GnosisPayStablecoin] +=
          tx.txnFee.amount || 0;
      }
    }
  }

  // Find the stablecoin with the most transactions
  const entries = Object.entries(result.transactionCounts) as [
    GnosisPayStablecoin,
    number,
  ][];

  const sortedByCount = entries.sort((a, b) => b[1] - a[1]);
  const [topByCount, topCount] = sortedByCount[0];
  const secondByCount = sortedByCount[1]?.[1] || 0;

  // If no stablecoin transactions found
  const totalStablecoinTxs = entries.reduce((sum, [, count]) => sum + count, 0);
  if (totalStablecoinTxs === 0) {
    result.reason = "No Gnosis Pay stablecoin transactions found";
    return result;
  }

  // Determine confidence based on the gap between top and second
  const countGap = topCount - secondByCount;
  const confidenceFromCount = Math.min(countGap / Math.max(topCount, 1), 1);

  // Set the detected stablecoin
  result.stablecoin = topByCount;
  result.currencyCode = getStablecoinCurrencyCode(topByCount);

  // Calculate overall confidence (primarily based on transaction count dominance)
  result.confidence = 0.6 * confidenceFromCount + 0.4; // Base confidence of 0.4

  // Set reason based on detection method
  if (countGap === 0 && secondByCount > 0) {
    // Tie-breaker: check volume
    const sortedByVolume = (
      Object.entries(result.totalVolume) as [GnosisPayStablecoin, number][]
    ).sort((a, b) => b[1] - a[1]);

    if (sortedByVolume[0][0] !== topByCount) {
      result.stablecoin = sortedByVolume[0][0];
      result.currencyCode = getStablecoinCurrencyCode(sortedByVolume[0][0]);
      result.reason = `Selected based on higher volume (${sortedByVolume[0][1].toFixed(2)} vs ${result.totalVolume[topByCount].toFixed(2)}) due to transaction count tie`;
    } else {
      result.reason = `Selected ${topByCount} based on transaction count (${topCount} transactions, tie broken by volume)`;
    }
  } else {
    result.reason = `Selected ${topByCount} based on ${topCount} transactions (${Math.round(
      (topCount / totalStablecoinTxs) * 100,
    )}% of stablecoin activity)`;
  }

  return result;
}

/**
 * Formats the base currency detection result for display
 */
export function formatBaseCurrencyDisplay(
  result: BaseCurrencyDetectionResult,
): string {
  if (!result.stablecoin) {
    return "Unknown - No Gnosis Pay stablecoin transactions detected";
  }

  return `${result.stablecoin} (${result.currencyCode}) - ${result.reason}`;
}
