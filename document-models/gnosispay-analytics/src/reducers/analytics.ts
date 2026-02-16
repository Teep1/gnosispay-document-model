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
      const monthlyData: Record<
        string,
        { income: number; expenses: number; count: number }
      > = {};

      transactions.forEach((tx) => {
        const monthKey = new Date(tx.timestamp).toISOString().substring(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, count: 0 };
        }
        monthlyData[monthKey].count++;

        // Resolve the amount in base currency for outflows (expenses)
        let expenseAmount = 0;
        if (tx.valueOut) {
          if (tx.convertedValue) {
            expenseAmount = tx.convertedValue.amount;
          } else if (tx.valueOut.token === action.input.baseCurrency) {
            expenseAmount = tx.valueOut.amount;
          } else if (
            tx.valueOut.usdValue &&
            action.input.baseCurrency === "USD"
          ) {
            expenseAmount = tx.valueOut.usdValue;
          }
        }

        // Resolve the amount in base currency for inflows (income)
        let incomeAmount = 0;
        if (tx.valueIn) {
          if (tx.valueIn.token === action.input.baseCurrency) {
            incomeAmount = tx.valueIn.amount;
          } else if (
            tx.valueIn.usdValue &&
            action.input.baseCurrency === "USD"
          ) {
            incomeAmount = tx.valueIn.usdValue;
          }
        }

        if (expenseAmount > 0) {
          totalAmount += expenseAmount;
          monthlyData[monthKey].expenses += expenseAmount;

          const originalToken = tx.valueOut?.token || "Unknown";
          tokenAmounts[originalToken] =
            (tokenAmounts[originalToken] || 0) + (tx.valueOut?.amount || 0);
        }

        if (incomeAmount > 0) {
          monthlyData[monthKey].income += incomeAmount;
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
        monthlyBreakdown: Object.entries(monthlyData).map(
          ([monthKey, data]) => ({
            month: monthKey.substring(5, 7),
            year: parseInt(monthKey.substring(0, 4), 10),
            income: data.income,
            expenses: data.expenses,
            net: data.income - data.expenses,
            transactionCount: data.count,
            token: action.input.baseCurrency,
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
