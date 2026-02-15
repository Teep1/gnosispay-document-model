import type { CryptoTransactionAnalyticsAnalyticsOperations } from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";
import type { Transaction } from "../../gen/schema/types.js";

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
  return normalized === "USDC" || normalized === "EURe" || normalized === "GBPe";
}

export const cryptoTransactionAnalyticsAnalyticsOperations: CryptoTransactionAnalyticsAnalyticsOperations =
  {
    calculateAnalyticsOperation(state, action) {
      const transactions = state.transactions;
      if (transactions.length === 0) {
        state.analytics = {
          totalSpent: null,
          averageTransaction: null,
          transactionsByToken: [],
          monthlyBreakdown: [],
        };
        state.detectedBaseCurrency = null;
        return;
      }

      let totalAmount = 0;
      const tokenAmounts: Record<string, number> = {};
      const monthlyAmounts: Record<string, number> = {};

      transactions.forEach((tx) => {
        let amount = 0;
        const token = action.input.baseCurrency;

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
        if (tx.txnFee?.token && isGnosisPayStablecoin(tx.txnFee.token)) {
          const normalized = normalizeToken(tx.txnFee.token);
          if (isGnosisPayStablecoin(normalized)) {
            const key = normalized as "USDC" | "EURe" | "GBPe";
            transactionCounts[key]++;
            totalVolume[key] += tx.txnFee.amount || 0;
          }
        }
      });

      type StablecoinKey = "USDC" | "EURe" | "GBPe";
      const entries = Object.entries(transactionCounts) as [StablecoinKey, number][];
      const sortedByCount = entries.sort((a, b) => b[1] - a[1]);
      const [topByCount, topCount] = sortedByCount[0];
      const secondByCount = sortedByCount[1]?.[1] || 0;
      const totalStablecoinTxs = entries.reduce(
        (sum, [, count]) => sum + count,
        0,
      );

      if (totalStablecoinTxs > 0) {
        const currencyCodes: Record<StablecoinKey, string> = {
          USDC: "USD",
          EURe: "EUR",
          GBPe: "GBP",
        };
        let detectedStablecoin: StablecoinKey = topByCount;
        let reason = `Selected ${topByCount} based on ${topCount} transactions (${Math.round((topCount / totalStablecoinTxs) * 100)}% of stablecoin activity)`;

        if (topCount === secondByCount && secondByCount > 0) {
          const volumeEntries = Object.entries(totalVolume) as [StablecoinKey, number][];
          const sortedByVolume = volumeEntries.sort((a, b) => b[1] - a[1]);
          if (sortedByVolume[0][0] !== topByCount) {
            detectedStablecoin = sortedByVolume[0][0];
            reason = `Selected based on higher volume (${sortedByVolume[0][1].toFixed(2)} vs ${totalVolume[topByCount].toFixed(2)}) due to transaction count tie`;
          } else {
            reason = `Selected ${topByCount} based on transaction count (${topCount} transactions, tie broken by volume)`;
          }
        }

        const countGap = topCount - secondByCount;
        const confidenceFromCount = Math.min(
          countGap / Math.max(topCount, 1),
          1,
        );
        const confidence = 0.6 * confidenceFromCount + 0.4;

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
