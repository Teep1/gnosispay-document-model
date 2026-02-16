import React, { useState } from "react";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";
import {
  detectCategory,
  type SpendingCategory,
  categoryConfig,
} from "../utils/categories.js";
import type { Transaction } from "../../../document-models/gnosispay-analytics/gen/types.js";

interface BudgetGoal {
  id: string;
  category: SpendingCategory;
  limit: number;
  spent: number;
  period: "monthly" | "weekly" | "yearly";
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

interface BudgetDashboardProps {
  transactions: Transaction[];
  baseCurrency: string;
  currencyCode: string;
}

export function BudgetDashboard({
  transactions,
  baseCurrency,
  currencyCode,
}: BudgetDashboardProps) {
  const [activeView, setActiveView] = useState<"budgets" | "savings">(
    "budgets",
  );

  // Calculate spending per category for current month
  const currentMonthSpending = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spending: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.valueOut && tx.valueOut.amount > 0) {
        const txDate = new Date(tx.timestamp);
        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          const category = detectCategory(tx.toAddress);
          spending[category] = (spending[category] || 0) + tx.valueOut.amount;
        }
      }
    });

    return spending;
  }, [transactions]);

  // Sample budgets (in real app, these would be stored in document state)
  const budgets: BudgetGoal[] = [
    {
      id: "1",
      category: "food",
      limit: 500,
      spent: currentMonthSpending["food"] || 0,
      period: "monthly",
    },
    {
      id: "2",
      category: "transport",
      limit: 200,
      spent: currentMonthSpending["transport"] || 0,
      period: "monthly",
    },
    {
      id: "3",
      category: "entertainment",
      limit: 150,
      spent: currentMonthSpending["entertainment"] || 0,
      period: "monthly",
    },
    {
      id: "4",
      category: "shopping",
      limit: 300,
      spent: currentMonthSpending["shopping"] || 0,
      period: "monthly",
    },
  ];

  // Sample savings goals
  const savingsGoals: SavingsGoal[] = [
    {
      id: "1",
      name: "Holiday Fund",
      target: 2000,
      current: 850,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      name: "Emergency Fund",
      target: 5000,
      current: 2100,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "3",
      name: "New Laptop",
      target: 1500,
      current: 400,
      color: "from-purple-500 to-violet-500",
    },
  ];

  const currencySymbol =
    currencyCode === "GBP" ? "£" : currencyCode === "EUR" ? "€" : "$";

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="bg-gray-100 p-1 rounded-xl flex">
        <button
          onClick={() => setActiveView("budgets")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeView === "budgets"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Budgets
        </button>
        <button
          onClick={() => setActiveView("savings")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeView === "savings"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Savings Goals
        </button>
      </div>

      {activeView === "budgets" && (
        <>
          {/* Budget Overview */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
              Total Budget
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {currencySymbol}
                <FormattedNumber
                  value={budgets.reduce((sum, b) => sum + b.spent, 0)}
                  decimalScale={2}
                />
              </span>
              <span className="text-white/60">
                / {currencySymbol}
                <FormattedNumber
                  value={budgets.reduce((sum, b) => sum + b.limit, 0)}
                  decimalScale={2}
                />
              </span>
            </div>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (budgets.reduce((sum, b) => sum + b.spent, 0) /
                      budgets.reduce((sum, b) => sum + b.limit, 0)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Category Budgets */}
          <div className="space-y-3">
            {budgets.map((budget) => {
              const config = categoryConfig[budget.category];
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80 && !isOverBudget;

              return (
                <div
                  key={budget.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center text-xl`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-500">{budget.period}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}
                      >
                        {currencySymbol}
                        <FormattedNumber
                          value={budget.spent}
                          decimalScale={2}
                        />
                      </p>
                      <p className="text-xs text-gray-400">
                        / {currencySymbol}
                        <FormattedNumber
                          value={budget.limit}
                          decimalScale={2}
                        />
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget
                            ? "bg-red-500"
                            : isNearLimit
                              ? "bg-amber-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    {isOverBudget && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">
                        ⚠️ Over budget by {currencySymbol}
                        <FormattedNumber
                          value={budget.spent - budget.limit}
                          decimalScale={2}
                        />
                      </p>
                    )}
                    {isNearLimit && (
                      <p className="text-xs text-amber-600 mt-1.5 font-medium">
                        ⚠️ {percentage.toFixed(0)}% used
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
            + Create New Budget
          </button>
        </>
      )}

      {activeView === "savings" && (
        <>
          {/* Savings Overview */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
              Total Saved
            </p>
            <p className="text-3xl font-bold">
              {currencySymbol}
              <FormattedNumber
                value={savingsGoals.reduce((sum, g) => sum + g.current, 0)}
                decimalScale={2}
              />
            </p>
            <p className="text-white/60 text-sm mt-1">
              of {currencySymbol}
              <FormattedNumber
                value={savingsGoals.reduce((sum, g) => sum + g.target, 0)}
                decimalScale={2}
              />{" "}
              goal
            </p>
          </div>

          {/* Savings Goals */}
          <div className="space-y-3">
            {savingsGoals.map((goal) => {
              const percentage = (goal.current / goal.target) * 100;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900">{goal.name}</p>
                    <span className="text-sm font-medium text-gray-600">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 font-medium">
                      {currencySymbol}
                      <FormattedNumber value={goal.current} decimalScale={2} />
                    </span>
                    <span className="text-gray-400">
                      {currencySymbol}
                      <FormattedNumber value={goal.target} decimalScale={2} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
            + Create New Goal
          </button>
        </>
      )}
    </div>
  );
}
