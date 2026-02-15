import React from "react";
import { DashboardCard, MetricCard } from "./DashboardCard.js";
import { BudgetProgress, SpendingAlerts } from "./BudgetProgress.js";
import { BaseCurrencyBadge, WalletSummaryCard } from "./BaseCurrencyBadge.js";
import type { GnosisPayStablecoin } from "../../../document-models/crypto-transaction-analytics/src/base-currency-detection.js";

interface TokenValue {
  amount: number;
  token: string;
  usdValue?: number | null;
}

interface FeeAnalysis {
  totalFees: TokenValue | null;
  feesByToken: TokenValue[];
}

interface FinancialAnalyticsProps {
  // Base currency detection
  detectedCurrency: GnosisPayStablecoin | string | null;
  currencyConfidence?: number;
  currencyReason?: string;
  
  // Core metrics
  currentBalance: number;
  totalAdded: number;
  totalSpent: number;
  thisMonthSpending: number;
  previousMonthSpending: number;
  availableToSpend: number;
  
  // Budget
  monthlyBudget: number | null;
  alertThreshold: number;
  
  // Analytics
  averageDailySpend: number;
  averageTransaction: number;
  daysUntilMonthEnd: number;
  projectedMonthSpend: number;
  totalFees: number;
  spendingAlerts: string[];
  
  // Transaction breakdown
  topTokens: TokenValue[];
  monthlyBreakdown: TokenValue[];
  
  // Wallet info
  walletAddress: string;
  
  className?: string;
}

export function FinancialAnalytics({
  detectedCurrency,
  currencyConfidence,
  currencyReason,
  currentBalance,
  totalAdded,
  totalSpent,
  thisMonthSpending,
  previousMonthSpending,
  availableToSpend,
  monthlyBudget,
  alertThreshold,
  averageDailySpend,
  averageTransaction,
  daysUntilMonthEnd,
  projectedMonthSpend,
  totalFees,
  spendingAlerts,
  topTokens,
  walletAddress,
  className = "",
}: FinancialAnalyticsProps) {
  const currency = detectedCurrency || "USDC";
  const currencySymbol = getCurrencySymbol(currency);
  
  // Calculate month-over-month change
  const momChange = previousMonthSpending > 0
    ? ((thisMonthSpending - previousMonthSpending) / previousMonthSpending) * 100
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Currency Detection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Financial Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Track your Gnosis Pay card spending and budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Base Currency:</span>
          <BaseCurrencyBadge
            currency={detectedCurrency}
            confidence={currencyConfidence}
            reason={currencyReason}
          />
        </div>
      </div>

      {/* Alerts Section */}
      <SpendingAlerts alerts={spendingAlerts} />

      {/* Main Wallet Card */}
      <WalletSummaryCard
        address={walletAddress}
        currency={currency}
        balance={currentBalance}
        totalAdded={totalAdded}
        totalSpent={totalSpent}
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="This Month's Spending"
          value={`${currencySymbol}${thisMonthSpending.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${daysUntilMonthEnd} days until month end`}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="red"
          trend={
            previousMonthSpending > 0
              ? { value: momChange, isPositive: momChange < 0 }
              : undefined
          }
        />

        <DashboardCard
          title="Available to Spend"
          value={`${currencySymbol}${availableToSpend.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`Daily avg: ${currencySymbol}${averageDailySpend.toFixed(2)}`}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />

        <DashboardCard
          title="Projected Month-End"
          value={`${currencySymbol}${projectedMonthSpend.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`Based on current spending rate`}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          color={projectedMonthSpend > (monthlyBudget || 0) ? "red" : "blue"}
        />

        <DashboardCard
          title="Total Fees Paid"
          value={`${currencySymbol}${totalFees.toLocaleString(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}`}
          subtitle={`Avg tx: ${currencySymbol}${averageTransaction.toFixed(2)}`}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
          }
          color="amber"
        />
      </div>

      {/* Budget Progress */}
      <BudgetProgress
        current={thisMonthSpending}
        budget={monthlyBudget || 0}
        currency={currency}
        alertThreshold={alertThreshold}
      />

      {/* Top Spending Categories */}
      {topTokens.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Token
          </h3>
          <div className="space-y-3">
            {topTokens.slice(0, 5).map((token, index) => (
              <div key={token.token} className="flex items-center">
                <div className="w-8 text-sm font-medium text-gray-500">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {token.token}
                    </span>
                    <span className="text-sm text-gray-600">
                      {currencySymbol}
                      {token.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          topTokens[0]?.amount
                            ? (token.amount / topTokens[0].amount) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USDC: "$",
    USD: "$",
    EURe: "€",
    EUR: "€",
    GBPe: "£",
    GBP: "£",
  };
  return symbols[currency] || "$";
}

interface MonthlyComparisonProps {
  currentMonth: number;
  previousMonth: number;
  currency: string;
  className?: string;
}

export function MonthlyComparison({
  currentMonth,
  previousMonth,
  currency,
  className = "",
}: MonthlyComparisonProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const difference = currentMonth - previousMonth;
  const percentChange = previousMonth > 0 ? (difference / previousMonth) * 100 : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Month-over-Month Comparison
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Last Month"
          value={`${currencySymbol}${previousMonth.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
        <MetricCard
          label="This Month"
          value={`${currencySymbol}${currentMonth.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
        <MetricCard
          label="Change"
          value={`${difference >= 0 ? "+" : ""}${currencySymbol}${Math.abs(
            difference
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={{
            value: percentChange,
            label: "vs last month",
          }}
        />
      </div>
    </div>
  );
}
