import React, { useState } from "react";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";
import { detectCategory, categoryConfig, type SpendingCategory } from "../utils/categories.js";

interface SpendingAnalyticsProps {
  transactions: Transaction[];
  baseCurrency: string;
  currencyCode: string;
}

interface CategoryTotal {
  category: SpendingCategory;
  amount: number;
  count: number;
  percentage: number;
}

export function SpendingAnalytics({ transactions, baseCurrency, currencyCode }: SpendingAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "merchants" | "trends">("categories");

  // Calculate spending by category
  const categoryTotals = React.useMemo((): CategoryTotal[] => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    let totalSpent = 0;

    transactions.forEach((tx) => {
      if (tx.valueOut && tx.valueOut.amount > 0) {
        const category = detectCategory(tx.toAddress);
        totals[category] = (totals[category] || 0) + tx.valueOut.amount;
        counts[category] = (counts[category] || 0) + 1;
        totalSpent += tx.valueOut.amount;
      }
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category: category as SpendingCategory,
        amount,
        count: counts[category] || 0,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Calculate monthly stats
  const monthlyStats = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      if (tx.valueOut && tx.valueOut.amount > 0) {
        if (txMonth === currentMonth && txYear === currentYear) {
          thisMonthTotal += tx.valueOut.amount;
        } else if (
          (txMonth === currentMonth - 1 && txYear === currentYear) ||
          (currentMonth === 0 && txMonth === 11 && txYear === currentYear - 1)
        ) {
          lastMonthTotal += tx.valueOut.amount;
        }
      }
    });

    const change = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return { thisMonthTotal, lastMonthTotal, change };
  }, [transactions]);

  const currencySymbol = currencyCode === "GBP" ? "£" : currencyCode === "EUR" ? "€" : "$";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">This Month</p>
          <p className="text-2xl font-bold">
            {currencySymbol}
            <FormattedNumber value={monthlyStats.thisMonthTotal} decimalScale={2} />
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${monthlyStats.change > 0 ? "text-red-300" : "text-green-300"}`}>
              {monthlyStats.change > 0 ? "↑" : "↓"} {Math.abs(monthlyStats.change).toFixed(1)}%
            </span>
            <span className="text-white/50 text-xs">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">
            {currencySymbol}
            <FormattedNumber value={categoryTotals.reduce((sum, cat) => sum + cat.amount, 0)} decimalScale={2} />
          </p>
          <p className="text-gray-400 text-xs mt-2">{transactions.length} transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {(["categories", "merchants", "trends"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "categories" ? "By Category" : tab === "merchants" ? "By Merchant" : "Trends"}
          </button>
        ))}
      </div>

      {/* Category Breakdown */}
      {activeTab === "categories" && (
        <div className="space-y-3">
          {categoryTotals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No spending data available
            </div>
          ) : (
            categoryTotals.map((cat) => {
              const config = categoryConfig[cat.category];
              return (
                <div
                  key={cat.category}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{config.label}</span>
                      <span className="font-bold text-gray-900">
                        {currencySymbol}
                        <FormattedNumber value={cat.amount} decimalScale={2} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{cat.count} transactions</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "merchants" && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-gray-500">Merchant analytics coming soon</p>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📈</div>
          <p className="text-gray-500">Spending trends coming soon</p>
        </div>
      )}
    </div>
  );
}
