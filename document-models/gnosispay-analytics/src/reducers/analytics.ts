import type { GnosispayAnalyticsAnalyticsOperations } from "gnosis-tx-analytics/document-models/gnosispay-analytics";

function normalizeToken(token: string | null | undefined): string {
  if (!token) return "";
  const normalized = token.trim().toUpperCase();
  if (normalized === "USDC" || normalized === "USD") return "USDC";
  if (normalized === "EUR" || normalized === "EURE") return "EURe";
  if (normalized === "GBP" || normalized === "GBPE") return "GBPe";
  return token.trim();
}

function isGnosisPayStablecoin(token: string | null | undefined): boolean {
  const normalized = normalizeToken(token);
  return (
    normalized === "USDC" || normalized === "EURe" || normalized === "GBPe"
  );
}

export const gnosispayAnalyticsAnalyticsOperations: GnosispayAnalyticsAnalyticsOperations =
  {
    calculateAnalyticsOperation(state, action) {
      const transactions = state.transactions;
      if (transactions.length === 0) {
        state.analytics = {
          totalSpent: null,
          averageTransaction: null,
          transactionsByToken: [],
          monthlyBreakdown: [],
          spendingByCategory: [],
        };
        state.detectedBaseCurrency = null;
        return;
      }

      let totalAmount = 0;
      const tokenAmounts: Record<string, number> = {};
      const monthlyAmounts: Record<string, number> = {};

      transactions.forEach((tx) => {
        let amount = 0;

        if (tx.convertedValue) {
          amount = tx.convertedValue.amount;
        } else if (
          tx.valueOut &&
          tx.valueOut.token === action.input.baseCurrency
        ) {
          amount = tx.valueOut.amount;
        } else if (
          tx.valueOut &&
          tx.valueOut.usdValue &&
          action.input.baseCurrency === "USD"
        ) {
          amount = tx.valueOut.usdValue;
        }

        if (amount > 0) {
          totalAmount += amount;

          const originalToken = tx.valueOut?.token || "Unknown";
          tokenAmounts[originalToken] =
            (tokenAmounts[originalToken] || 0) + (tx.valueOut?.amount || 0);

          const month = new Date(tx.timestamp).toISOString().substring(0, 7);
          monthlyAmounts[month] = (monthlyAmounts[month] || 0) + amount;
        }
      });

      state.analytics = {
        totalSpent:
          totalAmount > 0
            ? {
                amount: totalAmount,
                token: action.input.baseCurrency,
                usdValue:
                  action.input.baseCurrency === "USD" ? totalAmount : null,
              }
            : null,
        averageTransaction:
          totalAmount > 0
            ? {
                amount: totalAmount / transactions.length,
                token: action.input.baseCurrency,
                usdValue:
                  action.input.baseCurrency === "USD"
                    ? totalAmount / transactions.length
                    : null,
              }
            : null,
        transactionsByToken: Object.entries(tokenAmounts).map(
          ([token, amount]) => ({
            amount,
            token,
            usdValue: null,
          }),
        ),
        monthlyBreakdown: Object.entries(monthlyAmounts).map(
          ([month, amount]) => ({
            amount,
            token: action.input.baseCurrency,
            usdValue: action.input.baseCurrency === "USD" ? amount : null,
          }),
        ),
        spendingByCategory: [],
      };

      // Detect base currency based on transaction patterns
      const transactionCounts: { USDC: number; EURe: number; GBPe: number } = {
        USDC: 0,
        EURe: 0,
        GBPe: 0,
      };
      const totalVolume: { USDC: number; EURe: number; GBPe: number } = {
        USDC: 0,
        EURe: 0,
        GBPe: 0,
      };

      // NOTE: txnFee is excluded - fee tokens (USD, ETH, XDAI) are not indicative
      // of the account's base currency and inflate counts artificially
      transactions.forEach((tx) => {
        if (tx.valueIn?.token && isGnosisPayStablecoin(tx.valueIn.token)) {
          const normalized = normalizeToken(tx.valueIn.token);
          if (isGnosisPayStablecoin(normalized)) {
            const key = normalized as "USDC" | "EURe" | "GBPe";
            transactionCounts[key]++;
            totalVolume[key] += tx.valueIn.amount || 0;
          }
        }
        if (tx.valueOut?.token && isGnosisPayStablecoin(tx.valueOut.token)) {
          const normalized = normalizeToken(tx.valueOut.token);
          if (isGnosisPayStablecoin(normalized)) {
            const key = normalized as "USDC" | "EURe" | "GBPe";
            transactionCounts[key]++;
            totalVolume[key] += tx.valueOut.amount || 0;
          }
        }
      });

      type StablecoinKey = "USDC" | "EURe" | "GBPe";
      const totalStablecoinTxs = Object.values(transactionCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      if (totalStablecoinTxs > 0) {
        const currencyCodes: Record<StablecoinKey, string> = {
          USDC: "USD",
          EURe: "EUR",
          GBPe: "GBP",
        };

        // Primary indicator: volume (can't be inflated by dust/fees)
        const volumeEntries = Object.entries(totalVolume) as [
          StablecoinKey,
          number,
        ][];
        const sortedByVolume = volumeEntries.sort((a, b) => b[1] - a[1]);
        const [topByVolume, topVol] = sortedByVolume[0];
        const secondVol = sortedByVolume[1]?.[1] || 0;

        let detectedStablecoin: StablecoinKey = topByVolume;
        let reason: string;

        // Tiebreaker: use count when volumes are exactly equal
        if (topVol === secondVol && secondVol > 0) {
          const countEntries = Object.entries(transactionCounts) as [
            StablecoinKey,
            number,
          ][];
          const sortedByCount = countEntries.sort((a, b) => b[1] - a[1]);
          if (sortedByCount[0][0] !== topByVolume) {
            detectedStablecoin = sortedByCount[0][0];
            reason = `Selected ${sortedByCount[0][0]} based on transaction count (${sortedByCount[0][1]} transactions) due to volume tie`;
          } else {
            reason = `Selected ${topByVolume} based on volume (${topVol.toFixed(2)}), confirmed by transaction count`;
          }
        } else if (topVol > 0) {
          const totalVol = volumeEntries.reduce((sum, [, vol]) => sum + vol, 0);
          reason = `Selected ${topByVolume} based on ${topVol.toFixed(2)} volume (${Math.round((topVol / totalVol) * 100)}% of stablecoin volume)`;
        } else {
          // No volume, fall back to count
          const countEntries = Object.entries(transactionCounts) as [
            StablecoinKey,
            number,
          ][];
          const sortedByCount = countEntries.sort((a, b) => b[1] - a[1]);
          detectedStablecoin = sortedByCount[0][0];
          reason = `Selected ${sortedByCount[0][0]} based on ${sortedByCount[0][1]} transactions (no volume data)`;
        }

        const volumeGap = topVol - secondVol;
        const confidenceFromVolume = Math.min(
          volumeGap / Math.max(topVol, 1),
          1,
        );
        const confidence = 0.6 * confidenceFromVolume + 0.4;

        state.detectedBaseCurrency = {
          stablecoin: detectedStablecoin,
          currencyCode: currencyCodes[detectedStablecoin],
          confidence,
          transactionCounts,
          totalVolume,
          reason,
        };
      } else {
        state.detectedBaseCurrency = null;
      }
    },
  };
