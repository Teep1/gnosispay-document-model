import React from "react";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";

interface MonthlyDataItem {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

interface MonthlyBreakdownProps {
  monthlyData: MonthlyDataItem[];
  currencySymbol: string;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

export function MonthlyBreakdown({
  monthlyData,
  currencySymbol,
}: MonthlyBreakdownProps) {
  const totals = React.useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const m of monthlyData) {
      income += m.income;
      expenses += m.expenses;
    }
    return { income, expenses, net: income - expenses };
  }, [monthlyData]);

  // Find the max value across all months for bar scaling
  const maxValue = React.useMemo(() => {
    let max = 0;
    for (const m of monthlyData) {
      if (m.income > max) max = m.income;
      if (m.expenses > max) max = m.expenses;
    }
    return max || 1;
  }, [monthlyData]);

  if (monthlyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-gray-500">No monthly data yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Import transactions to see your cash flow
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Income"
          value={totals.income}
          currencySymbol={currencySymbol}
          color="emerald"
        />
        <SummaryCard
          label="Expenses"
          value={totals.expenses}
          currencySymbol={currencySymbol}
          color="purple"
        />
        <SummaryCard
          label="Net"
          value={totals.net}
          currencySymbol={currencySymbol}
          color={totals.net >= 0 ? "emerald" : "red"}
          showSign
        />
      </div>

      {/* Monthly Rows */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {monthlyData.map((m) => (
          <MonthRow
            key={`${m.year}-${m.month}`}
            data={m}
            maxValue={maxValue}
            currencySymbol={currencySymbol}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Summary Card ───────────────────────────────── */

function SummaryCard({
  label,
  value,
  currencySymbol,
  color,
  showSign,
}: {
  label: string;
  value: number;
  currencySymbol: string;
  color: string;
  showSign?: boolean;
}) {
  const colorMap: Record<string, { bg: string; text: string; accent: string }> =
    {
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        accent: "text-emerald-500",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        accent: "text-purple-500",
      },
      red: { bg: "bg-red-50", text: "text-red-700", accent: "text-red-500" },
    };

  const c = colorMap[color] || colorMap.purple;
  const sign = showSign ? (value >= 0 ? "+" : "") : "";

  return (
    <div className={`${c.bg} rounded-xl p-4`}>
      <p className={`text-xs font-medium uppercase tracking-wider ${c.accent}`}>
        {label}
      </p>
      <p className={`text-lg font-bold ${c.text} mt-1`}>
        {sign}
        {currencySymbol}
        <FormattedNumber value={Math.abs(value)} decimalScale={2} />
      </p>
    </div>
  );
}

/* ── Month Row ──────────────────────────────────── */

function MonthRow({
  data,
  maxValue,
  currencySymbol,
}: {
  data: MonthlyDataItem;
  maxValue: number;
  currencySymbol: string;
}) {
  const monthLabel = MONTH_LABELS[data.month] || data.month;
  const incomePercent = (data.income / maxValue) * 100;
  const expensePercent = (data.expenses / maxValue) * 100;
  const isPositive = data.net >= 0;

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      {/* Header: month label + net */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {monthLabel}
          </span>
          <span className="text-xs text-gray-400">{data.year}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {data.transactionCount} txns
          </span>
          <span
            className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {currencySymbol}
            <FormattedNumber value={Math.abs(data.net)} decimalScale={2} />
          </span>
        </div>
      </div>

      {/* Dual bars */}
      <div className="space-y-1.5">
        {/* Income bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-8 shrink-0">In</span>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded transition-all duration-500 flex items-center justify-end pr-1.5"
              style={{ width: `${Math.max(incomePercent, 2)}%` }}
            >
              {incomePercent > 25 && (
                <span className="text-white text-[10px] font-semibold whitespace-nowrap">
                  {currencySymbol}
                  {data.income.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              )}
            </div>
          </div>
          {incomePercent <= 25 && (
            <span className="text-xs text-gray-500 shrink-0">
              {currencySymbol}
              {data.income.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>

        {/* Expense bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-8 shrink-0">Out</span>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded transition-all duration-500 flex items-center justify-end pr-1.5"
              style={{ width: `${Math.max(expensePercent, 2)}%` }}
            >
              {expensePercent > 25 && (
                <span className="text-white text-[10px] font-semibold whitespace-nowrap">
                  {currencySymbol}
                  {data.expenses.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              )}
            </div>
          </div>
          {expensePercent <= 25 && (
            <span className="text-xs text-gray-500 shrink-0">
              {currencySymbol}
              {data.expenses.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
