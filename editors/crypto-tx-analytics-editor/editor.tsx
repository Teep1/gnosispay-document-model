import { useState, useMemo, useEffect } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { AccountCard as AccountCardV2 } from "./components/AccountCardV2.js";
import { TransactionsTable } from "./components/TransactionsTable.js";
import { SpendingAnalytics } from "./components/SpendingAnalytics.js";
import { TransactionFilters } from "./components/TransactionFilters.js";
import { ExportModal } from "./components/ExportModal.js";
import { SettingsPanel } from "./components/SettingsPanel.js";
import { RealTimeSync } from "./components/RealTimeSync.js";
import { DebugPanel } from "./components/DebugPanel.js";
import { EtherscanUploader } from "./components/EtherscanUploader.js";
import { generateId } from "document-model/core";
import {
  useSelectedGnosispayAnalyticsDocument,
  importTransactions,
  calculateAnalytics,
} from "../../document-models/gnosispay-analytics/index.js";
import type { ParsedTransaction } from "./services/etherscanApi.js";
import type {
  AddTransactionInput,
  TransactionStatusInput,
  TransactionTypeInput,
} from "../../document-models/gnosispay-analytics/gen/schema/types.js";
import { recalculateAnalytics } from "../../document-models/gnosispay-analytics/src/utils.js";
import { detectBaseCurrency } from "../../document-models/gnosispay-analytics/src/base-currency-detection.js";

type ViewMode = "dashboard" | "import";

const TRACKED_ADDRESS =
  import.meta.env.VITE_TRACKED_ETH_ADDRESS?.toLowerCase() ||
  "[REDACTED]";

export default function Editor() {
  return (
    <ErrorBoundary>
      <DocumentToolbar />
      <EditorContent />
    </ErrorBoundary>
  );
}

function EditorContent() {
  const [document, dispatch] = useSelectedGnosispayAnalyticsDocument();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [activeTab, setActiveTab] = useState("transactions");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const transactions = document?.state?.global?.transactions || [];
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const detectedBaseCurrency = document?.state?.global?.detectedBaseCurrency;

  // Update filtered transactions when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  // Detect base currency
  const baseCurrency = useMemo(() => {
    if (detectedBaseCurrency?.stablecoin) {
      return detectedBaseCurrency.stablecoin;
    }
    const result = detectBaseCurrency(transactions);
    return result.stablecoin || "USDC";
  }, [detectedBaseCurrency, transactions]);

  const currencyCode =
    baseCurrency === "GBPe" ? "GBP" : baseCurrency === "EURe" ? "EUR" : "USD";

  // Calculate metrics
  const calculatedMetrics = useMemo(() => {
    return recalculateAnalytics(
      transactions,
      baseCurrency,
      undefined,
      undefined,
    );
  }, [transactions, baseCurrency]);

  const currentBalance =
    calculatedMetrics.totalAdded - calculatedMetrics.totalSpent;

  // Persist detected currency
  useEffect(() => {
    if (
      baseCurrency &&
      !detectedBaseCurrency &&
      dispatch &&
      transactions.length > 0
    ) {
      dispatch(calculateAnalytics({ baseCurrency }));
    }
  }, [baseCurrency, detectedBaseCurrency, dispatch, transactions.length]);

  // Normalize token symbols to GnosisPay format
  const normalizeToken = (token: string): string => {
    const upper = token.toUpperCase();
    if (upper === "GBP" || upper === "GBPE") return "GBPe";
    if (upper === "EUR" || upper === "EURE") return "EURe";
    if (upper === "USDC" || upper === "USDCE") return "USDC";
    return token;
  };

  // Handle Etherscan import — single dispatch path
  const handleEtherscanImport = (
    parsed: ParsedTransaction[],
    address: string,
  ) => {
    const structuredTxs: AddTransactionInput[] = parsed.map((t) => {
      const normalizedTk = normalizeToken(t.token);
      const isOutgoing = t.fromAddress?.toLowerCase() === address.toLowerCase();
      const txType: TransactionTypeInput = t.amountOut
        ? "EXPENSE"
        : t.amountIn
          ? "INCOME"
          : "NEUTRAL";
      const signedAmount = isOutgoing ? -(t.amountOut || 0) : t.amountIn || 0;

      return {
        id: generateId(),
        txHash: t.transactionHash,
        blockNumber: "",
        timestamp: t.rawTimestamp || new Date().toISOString(),
        fromAddress: t.fromAddress || null,
        toAddress: t.toAddress || null,
        contractAddress: null,
        valueIn: t.amountIn
          ? { amount: t.amountIn, token: normalizedTk, usdValue: null }
          : null,
        valueOut: t.amountOut
          ? { amount: t.amountOut, token: normalizedTk, usdValue: null }
          : null,
        txnFee: {
          amount: t.feeAmount || 0,
          token: t.feeToken || "XDAI",
          usdValue: null,
        },
        status: "SUCCESS" as TransactionStatusInput,
        transactionType: txType,
        signedAmount,
      };
    });

    dispatch?.(
      importTransactions({
        transactions: structuredTxs,
        timestamp: new Date().toISOString(),
        trackedAddress: address,
      }),
    );

    // Calculate analytics after import with detected base currency
    setTimeout(() => {
      const result = detectBaseCurrency(
        structuredTxs.map((t) => ({
          id: t.id,
          txHash: t.txHash,
          blockNumber: "",
          timestamp: t.timestamp,
          fromAddress: t.fromAddress || "",
          toAddress: t.toAddress || "",
          valueIn: t.valueIn
            ? {
                amount: t.valueIn.amount,
                token: t.valueIn.token,
                usdValue: null,
              }
            : null,
          valueOut: t.valueOut
            ? {
                amount: t.valueOut.amount,
                token: t.valueOut.token,
                usdValue: null,
              }
            : null,
          txnFee: {
            amount: t.txnFee.amount,
            token: t.txnFee.token,
            usdValue: null,
          },
          status: "SUCCESS" as const,
        })) as Parameters<typeof detectBaseCurrency>[0],
      );
      const detectedCurrency = result.stablecoin || "USDC";
      dispatch?.(calculateAnalytics({ baseCurrency: detectedCurrency }));
    }, 100);

    setViewMode("dashboard");
  };

  if (viewMode === "import") {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setViewMode("dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              Import Transactions
            </h1>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <EtherscanUploader
              trackedAddress={TRACKED_ADDRESS}
              onUploadSuccess={(parsed, address) => {
                handleEtherscanImport(parsed, address);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Account Card */}
      <div className="bg-gradient-to-b from-white to-gray-50 pb-6">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <AccountCardV2
            balance={currentBalance}
            baseCurrency={baseCurrency}
            currencyCode={currencyCode}
            cardLastFour="••••"
          />

          {/* Quick Actions */}
          <div className="flex justify-around mt-6">
            <QuickActionButton icon="↑" label="Send" color="bg-blue-500" />
            <QuickActionButton
              icon="↓"
              label="Receive"
              color="bg-emerald-500"
            />
            <QuickActionButton
              icon="📊"
              label="Analytics"
              color="bg-purple-500"
              onClick={() => setActiveTab("analytics")}
            />
            <QuickActionButton
              icon="＋"
              label="Import"
              color="bg-gray-600"
              onClick={() => setViewMode("import")}
            />
          </div>

          {/* Real-time Sync */}
          <div className="mt-6">
            <RealTimeSync transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          {[
            { id: "transactions", label: "Transactions" },
            { id: "analytics", label: "Analytics" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "transactions" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transactions ({filteredTransactions.length})
                </h2>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                </button>
              </div>
              <TransactionFilters
                transactions={transactions}
                onFilterChange={setFilteredTransactions}
              />
              <TransactionsTable
                transactions={filteredTransactions}
                baseCurrency={baseCurrency}
              />
            </>
          )}

          {activeTab === "analytics" && (
            <SpendingAnalytics
              transactions={transactions}
              baseCurrency={baseCurrency}
              currencyCode={currencyCode}
              monthlyData={calculatedMetrics.monthlyData}
            />
          )}

          {activeTab === "settings" && (
            <SettingsPanel
              baseCurrency={baseCurrency}
              onBaseCurrencyChange={(currency) => {
                dispatch?.(calculateAnalytics({ baseCurrency: currency }));
              }}
            />
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        baseCurrency={baseCurrency}
      />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}

interface QuickActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onClick?: () => void;
}

function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transform transition-all group-hover:scale-110 group-active:scale-95`}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </button>
  );
}
