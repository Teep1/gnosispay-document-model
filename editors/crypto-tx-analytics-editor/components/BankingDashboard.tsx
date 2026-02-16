import React, { useState, useMemo } from "react";
import { AccountCard } from "./AccountCard.js";
import { QuickActions } from "./QuickActions.js";
import { TransactionFeed } from "./TransactionFeed.js";
import { TokenBalances } from "./TokenBalances.js";
import { BottomNavigation } from "./BottomNavigation.js";
import type { Transaction } from "../../../document-models/gnosispay-analytics/gen/types.js";

type TabId = "home" | "analytics" | "budget" | "settings";

interface BankingDashboardProps {
  transactions: Transaction[];
  baseCurrency: string;
  currencyCode: string;
  currentBalance: number;
  totalAdded: number;
  totalSpent: number;
  onImportClick?: () => void;
  onAnalyticsClick?: () => void;
}

interface TokenBalanceCalc {
  token: string;
  amount: number;
  currencyCode: string;
}

export function BankingDashboard({
  transactions,
  baseCurrency,
  currencyCode,
  currentBalance,
  totalAdded,
  totalSpent,
  onImportClick,
  onAnalyticsClick,
}: BankingDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showAllTokens, setShowAllTokens] = useState(false);

  // Calculate token balances from transactions
  const tokenBalances = useMemo((): TokenBalanceCalc[] => {
    const balances: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.valueIn?.token && tx.valueIn.amount) {
        balances[tx.valueIn.token] =
          (balances[tx.valueIn.token] || 0) + tx.valueIn.amount;
      }
      if (tx.valueOut?.token && tx.valueOut.amount) {
        balances[tx.valueOut.token] =
          (balances[tx.valueOut.token] || 0) - tx.valueOut.amount;
      }
    });

    // Ensure base currency is included even if balance is 0
    if (!balances[baseCurrency]) {
      balances[baseCurrency] = currentBalance;
    }

    return Object.entries(balances)
      .filter(([_, amount]) => amount !== 0)
      .map(([token, amount]) => ({
        token,
        amount: Math.max(0, amount), // Show positive only for display
        currencyCode:
          token === "GBPe" ? "GBP" : token === "EURe" ? "EUR" : "USD",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, baseCurrency, currentBalance]);

  const renderHomeView = () => (
    <div className="space-y-6 pb-24">
      {/* Account Card */}
      <div className="px-4 pt-6">
        <AccountCard
          balance={currentBalance}
          baseCurrency={baseCurrency}
          currencyCode={currencyCode}
          cardLastFour="••••"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onSend={() => alert("Send feature coming soon!")}
        onRequest={() => alert("Request feature coming soon!")}
        onAnalytics={onAnalyticsClick}
        onMore={onImportClick}
      />

      {/* Token Balances (if multiple) */}
      {tokenBalances.length > 1 && (
        <TokenBalances
          balances={tokenBalances}
          selectedToken={baseCurrency}
          onSelectToken={() => {}}
        />
      )}

      {/* Transaction Feed */}
      <div>
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <button
            onClick={onImportClick}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            Import
          </button>
        </div>
        <TransactionFeed
          transactions={transactions.slice(0, showAllTokens ? undefined : 10)}
          baseCurrency={baseCurrency}
        />
        {transactions.length > 10 && !showAllTokens && (
          <button
            onClick={() => setShowAllTokens(true)}
            className="w-full py-3 text-sm text-gray-500 font-medium hover:text-gray-700"
          >
            Show all {transactions.length} transactions
          </button>
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-white/80 text-sm">Total Spent</p>
        <p className="text-3xl font-bold mt-1">
          {new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currencyCode,
          }).format(totalSpent)}
        </p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <p className="text-white/80 text-sm">Total Added</p>
        <p className="text-3xl font-bold mt-1">
          {new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currencyCode,
          }).format(totalAdded)}
        </p>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Detailed analytics coming soon</p>
        <p className="text-gray-400 text-sm mt-1">
          Charts, categories, and insights
        </p>
      </div>
    </div>
  );

  const renderBudgetView = () => (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Budget</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-gray-500">Budgeting coming soon</p>
        <p className="text-gray-400 text-sm mt-1">
          Set spending limits and track goals
        </p>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <span className="font-medium text-gray-900">Base Currency</span>
          <span className="text-gray-500">{baseCurrency}</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <span className="font-medium text-gray-900">Transactions</span>
          <span className="text-gray-500">{transactions.length}</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <span className="font-medium text-gray-900">Version</span>
          <span className="text-gray-500">1.0.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      {activeTab === "home" && renderHomeView()}
      {activeTab === "analytics" && renderAnalyticsView()}
      {activeTab === "budget" && renderBudgetView()}
      {activeTab === "settings" && renderSettingsView()}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
