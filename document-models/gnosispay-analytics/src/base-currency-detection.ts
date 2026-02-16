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
  // NOTE: txnFee is excluded - fee tokens (USD, ETH, XDAI) are not indicative
  // of the account's base currency and inflate counts artificially
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
  }

  // If no stablecoin transactions found
  const totalStablecoinTxs = Object.values(result.transactionCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (totalStablecoinTxs === 0) {
    result.reason = "No Gnosis Pay stablecoin transactions found";
    return result;
  }

  // Primary indicator: volume (can't be inflated by dust/fees)
  const volumeEntries = Object.entries(result.totalVolume) as [
    GnosisPayStablecoin,
    number,
  ][];
  const sortedByVolume = volumeEntries.sort((a, b) => b[1] - a[1]);
  const [topByVolume, topVolume] = sortedByVolume[0];
  const secondVolume = sortedByVolume[1]?.[1] || 0;

  // Set the detected stablecoin based on volume
  result.stablecoin = topByVolume;
  result.currencyCode = getStablecoinCurrencyCode(topByVolume);

  // Determine confidence based on volume dominance
  const volumeGap = topVolume - secondVolume;
  const confidenceFromVolume = Math.min(volumeGap / Math.max(topVolume, 1), 1);
  result.confidence = 0.6 * confidenceFromVolume + 0.4;

  // Tiebreaker: use transaction count when volumes are exactly equal
  if (topVolume === secondVolume && secondVolume > 0) {
    const countEntries = Object.entries(result.transactionCounts) as [
      GnosisPayStablecoin,
      number,
    ][];
    const sortedByCount = countEntries.sort((a, b) => b[1] - a[1]);
    if (sortedByCount[0][0] !== topByVolume) {
      result.stablecoin = sortedByCount[0][0];
      result.currencyCode = getStablecoinCurrencyCode(sortedByCount[0][0]);
      result.reason = `Selected ${sortedByCount[0][0]} based on transaction count (${sortedByCount[0][1]} transactions) due to volume tie`;
    } else {
      result.reason = `Selected ${topByVolume} based on volume (${topVolume.toFixed(2)}), confirmed by transaction count`;
    }
  } else if (topVolume > 0) {
    const totalVolume = volumeEntries.reduce((sum, [, vol]) => sum + vol, 0);
    result.reason = `Selected ${topByVolume} based on ${topVolume.toFixed(2)} volume (${Math.round((topVolume / totalVolume) * 100)}% of stablecoin volume)`;
  } else {
    // No volume at all, fall back to count
    const countEntries = Object.entries(result.transactionCounts) as [
      GnosisPayStablecoin,
      number,
    ][];
    const sortedByCount = countEntries.sort((a, b) => b[1] - a[1]);
    result.stablecoin = sortedByCount[0][0];
    result.currencyCode = getStablecoinCurrencyCode(sortedByCount[0][0]);
    result.reason = `Selected ${sortedByCount[0][0]} based on ${sortedByCount[0][1]} transactions (no volume data)`;
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
