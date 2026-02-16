export * from "./base-currency-detection.js";

import type { Transaction } from "../gen/schema/types.js";

/**
 * Helper function to detect base currency from transactions
 * Used in reducers for auto-detection on transaction import
 */
export function detectBaseCurrencyFromTransactions(
  transactions: Transaction[],
): string | null {
  const counts: Record<string, number> = {};
  const volumes: Record<string, number> = {};

  // NOTE: txnFee is excluded - fee tokens (USD, ETH, XDAI) are not indicative
  // of the account's base currency and inflate counts artificially
  for (const tx of transactions) {
    // Check valueIn
    if (tx.valueIn?.token) {
      const token = normalizeTokenForDetection(tx.valueIn.token);
      if (isGnosisPayToken(token)) {
        counts[token] = (counts[token] || 0) + 1;
        volumes[token] = (volumes[token] || 0) + (tx.valueIn.amount || 0);
      }
    }

    // Check valueOut
    if (tx.valueOut?.token) {
      const token = normalizeTokenForDetection(tx.valueOut.token);
      if (isGnosisPayToken(token)) {
        counts[token] = (counts[token] || 0) + 1;
        volumes[token] = (volumes[token] || 0) + (tx.valueOut.amount || 0);
      }
    }
  }

  // Primary indicator: volume (can't be inflated by dust/fees)
  let maxVolume = 0;
  let detectedToken: string | null = null;

  for (const [token, volume] of Object.entries(volumes)) {
    if (volume > maxVolume) {
      maxVolume = volume;
      detectedToken = token;
    }
  }

  // Fallback to count if no volume data
  if (!detectedToken) {
    let maxCount = 0;
    for (const [token, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        detectedToken = token;
      }
    }
  }

  return detectedToken;
}

function normalizeTokenForDetection(token: string): string {
  const normalized = token.trim().toUpperCase();
  if (normalized === "GBP" || normalized === "GBPE") return "GBPe";
  if (normalized === "EUR" || normalized === "EURE") return "EURe";
  if (normalized === "USDC" || normalized === "USD") return "USDC";
  return token.trim();
}

function isGnosisPayToken(token: string): boolean {
  const normalized = token.trim().toUpperCase();
  return (
    normalized === "USDC" ||
    normalized === "GBPE" ||
    normalized === "EURE" ||
    normalized === "GBP" ||
    normalized === "EUR" ||
    normalized === "USD"
  );
}

/**
 * Recalculates all analytics from transactions.
 * This is a mirror of the reducer logic for client-side use.
 * The actual persistence happens in the document model reducers.
 */
export function recalculateAnalytics(
  transactions: Transaction[],
  baseCurrency: string,
  monthlyBudget: number | null | undefined,
  alertThreshold: number | undefined,
) {
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  let totalSpent = 0;
  let totalAdded = 0;
  let totalFees = 0;
  let currentMonthExpenses = 0;
  let currentMonthIncome = 0;
  let previousMonthExpenses = 0;
  let previousMonthIncome = 0;

  const monthlyDataMap = new Map();

  // Initialize current and previous month
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  monthlyDataMap.set(currentMonth, {
    month: String(currentMonthNum).padStart(2, "0"),
    year: currentYear,
    income: 0,
    expenses: 0,
    net: 0,
    transactionCount: 0,
  });

  monthlyDataMap.set(prevMonthKey, {
    month: String(prevMonthDate.getMonth() + 1).padStart(2, "0"),
    year: prevMonthDate.getFullYear(),
    income: 0,
    expenses: 0,
    net: 0,
    transactionCount: 0,
  });

  transactions.forEach((tx) => {
    const txDate = new Date(tx.timestamp);
    const txMonth = txDate.toISOString().substring(0, 7);
    const txMonthNum = txDate.getMonth() + 1;
    const txYear = txDate.getFullYear();

    // Initialize month data if not exists
    if (!monthlyDataMap.has(txMonth)) {
      monthlyDataMap.set(txMonth, {
        month: String(txMonthNum).padStart(2, "0"),
        year: txYear,
        income: 0,
        expenses: 0,
        net: 0,
        transactionCount: 0,
      });
    }

    const monthData = monthlyDataMap.get(txMonth);
    monthData.transactionCount++;

    // Calculate fees
    if (tx.txnFee && tx.txnFee.amount > 0) {
      totalFees += tx.txnFee.amount;
    }

    // Spending (outgoing / expenses)
    if (tx.valueOut && tx.valueOut.amount > 0) {
      let amount = tx.valueOut.amount;
      if (tx.convertedValue && tx.convertedValue.currency === baseCurrency) {
        amount = tx.convertedValue.amount;
      }

      totalSpent += amount;
      monthData.expenses += amount;

      if (txMonth === currentMonth) {
        currentMonthExpenses += amount;
      }
      if (txMonth === prevMonthKey) {
        previousMonthExpenses += amount;
      }
    }

    // Income (incoming)
    if (tx.valueIn && tx.valueIn.amount > 0) {
      let amount = tx.valueIn.amount;
      if (baseCurrency === "USD" && tx.valueIn.usdValue) {
        amount = tx.valueIn.usdValue;
      }

      totalAdded += amount;
      monthData.income += amount;

      if (txMonth === currentMonth) {
        currentMonthIncome += amount;
      }
      if (txMonth === prevMonthKey) {
        previousMonthIncome += amount;
      }
    }

    // Calculate net for the month
    monthData.net = monthData.income - monthData.expenses;
  });

  // Calculate averages
  const expenseTransactions = transactions.filter(
    (t) => t.valueOut && t.valueOut.amount > 0,
  );
  const averageTransaction =
    expenseTransactions.length > 0
      ? totalSpent / expenseTransactions.length
      : 0;
  const averageDailySpend =
    daysElapsed > 0 ? currentMonthExpenses / daysElapsed : 0;
  const projectedMonthSpend =
    daysElapsed > 0
      ? (currentMonthExpenses / daysElapsed) * daysInMonth
      : currentMonthExpenses;

  // Calculate spending alerts
  const alerts: string[] = [];
  const threshold = alertThreshold ?? 80;

  if (monthlyBudget && monthlyBudget > 0) {
    const percentUsed = (currentMonthExpenses / monthlyBudget) * 100;
    if (percentUsed >= threshold) {
      alerts.push(
        `Spending alert: You've used ${percentUsed.toFixed(1)}% of your monthly budget`,
      );
    }
    if (projectedMonthSpend > monthlyBudget) {
      alerts.push(
        `Projection alert: At current rate, you'll exceed your monthly budget by ${(projectedMonthSpend - monthlyBudget).toFixed(2)} ${baseCurrency}`,
      );
    }
  }

  if (previousMonthExpenses > 0) {
    const percentChange =
      ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) *
      100;
    if (percentChange > 20) {
      alerts.push(
        `Your spending is ${percentChange.toFixed(1)}% higher than last month`,
      );
    }
  }

  // Convert monthly data map to array
  const monthlyData = Array.from(monthlyDataMap.entries())
    .map(([key, data]) => data)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return parseInt(b.month) - parseInt(a.month);
    });

  return {
    totalSpent,
    totalAdded,
    netBalance: totalAdded - totalSpent,
    currentMonthIncome,
    currentMonthExpenses,
    previousMonthIncome,
    previousMonthExpenses,
    monthlyData,
    averageDailySpend,
    averageTransaction,
    daysUntilMonthEnd: daysRemaining,
    projectedMonthSpend,
    totalFees,
    spendingAlerts: alerts,
    lastCalculatedAt: now.toISOString(),
  };
}
