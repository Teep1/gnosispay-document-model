import { useState, useMemo, useEffect } from "react";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { AccountCard as AccountCardV2 } from "./components/AccountCardV2.js";
import { TransactionsTable } from "./components/TransactionsTable.js";
import { SpendingAnalytics } from "./components/SpendingAnalytics.js";
import { BudgetDashboard } from "./components/BudgetDashboard.js";
import { TransactionFilters } from "./components/TransactionFilters.js";
import { ExportModal } from "./components/ExportModal.js";
import { CardManagement } from "./components/CardManagement.js";
import { SettingsPanel } from "./components/SettingsPanel.js";
import { RealTimeSync } from "./components/RealTimeSync.js";
import { DebugPanel } from "./components/DebugPanel.js";
import { CsvUploader } from "./components/CsvUploader.js";
import { EtherscanUploader } from "./components/EtherscanUploader.js";
import {
  useSelectedCryptoTransactionAnalyticsDocument,
  importCsvTransactions,
  calculateAnalytics,
} from "../../document-models/crypto-transaction-analytics/index.js";
import type { ParsedTransaction } from "./components/CsvUploader.js";
import {
  EtherscanApiService,
  convertEtherscanToParseTransaction,
} from "./services/etherscanApi.js";
import { recalculateAnalytics } from "../../document-models/crypto-transaction-analytics/src/utils.js";
import { detectBaseCurrency } from "../../document-models/crypto-transaction-analytics/src/base-currency-detection.js";
import type { EtherscanTransaction } from "./services/etherscanApi.js";

type ViewMode = "dashboard" | "import";

const TRACKED_ADDRESS =
  import.meta.env.VITE_TRACKED_ETH_ADDRESS?.toLowerCase() ||
  "0xe1de155610bb5c85350ada3847c0d6f51ddbafc7";

export default function Editor() {
  return (
    <ErrorBoundary>
      <EditorContent />
    </ErrorBoundary>
  );
}

function EditorContent() {
  const [document, dispatch] = useSelectedCryptoTransactionAnalyticsDocument();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [activeTab, setActiveTab] = useState("transactions");
  const [activeUploadTab, setActiveUploadTab] = useState<"csv" | "etherscan">("csv");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const transactions = document?.state?.global?.transactions || [];
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const analytics = document?.state?.global?.analytics;
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

  const currencyCode = baseCurrency === "GBPe" ? "GBP" : baseCurrency === "EURe" ? "EUR" : "USD";

  // Calculate metrics
  const calculatedMetrics = useMemo(() => {
    return recalculateAnalytics(transactions, baseCurrency, undefined, undefined);
  }, [transactions, baseCurrency]);

  const currentBalance = calculatedMetrics.totalAdded - calculatedMetrics.totalSpent;

  // Persist detected currency
  useEffect(() => {
    if (baseCurrency && !detectedBaseCurrency && dispatch && transactions.length > 0) {
      dispatch(calculateAnalytics({ baseCurrency }));
    }
  }, [baseCurrency, detectedBaseCurrency, dispatch, transactions.length]);

  // Handle CSV import
  const handleCsvImport = (parsed: {
    transactionCount: number;
    documentId: string;
    transactions: ParsedTransaction[];
  }) => {
    const csvData = parsed.transactions
      .map((t) => {
        const amountIn = t.amountIn ? `${t.amountIn}` : "";
        const amountOut = t.amountOut ? `${t.amountOut}` : "";
        return `${t.transactionHash},${t.rawTimestamp},${amountIn},${amountOut},${t.feeAmount || 0},${t.token},${t.fromAddress},${t.toAddress},1`;
      })
      .join("\n");

    const header = "Transaction Hash,DateTime (UTC),Value_IN,Value_OUT,TxnFee,TokenSymbol,From,To,Status\n";

    dispatch?.(
      importCsvTransactions({
        csvData: header + csvData,
        timestamp: new Date().toISOString(),
        transactionIds: parsed.transactions.map((t) => t.transactionHash),
      })
    );

    setTimeout(() => {
      dispatch?.(calculateAnalytics({ baseCurrency }));
    }, 100);

    setViewMode("dashboard");
  };

  // Normalize token symbols to GnosisPay format
  const normalizeToken = (token: string): string => {
    const upper = token.toUpperCase();
    if (upper === "GBP" || upper === "GBPE") return "GBPe";
    if (upper === "EUR" || upper === "EURE") return "EURe";
    if (upper === "USDC" || upper === "USDCE") return "USDC";
    return token;
  };

  // Handle Etherscan import
  const handleEtherscanImport = async (address: string, apiKey: string) => {
    const service = new EtherscanApiService(apiKey);
    const txs = await service.fetchERC20Transactions(address, {
      startBlock: 0,
      endBlock: 99999999,
    });
    const converted = txs.map((t: EtherscanTransaction) =>
      convertEtherscanToParseTransaction(t, address)
    );

    // Build CSV with token-specific columns for proper detection
    const csvData = converted
      .map((t: ParsedTransaction) => {
        const normalizedToken = normalizeToken(t.token);
        const amountIn = t.amountIn ? `${t.amountIn}` : "";
        const amountOut = t.amountOut ? `${t.amountOut}` : "";
        return `${t.transactionHash},${t.rawTimestamp},${amountIn},${normalizedToken},${amountOut},${normalizedToken},${t.feeAmount || 0},XDAI,${t.fromAddress},${t.toAddress},1`;
      })
      .join("\n");

    // Headers with token columns for proper extraction
    const header = "Transaction Hash,DateTime (UTC),Value_IN,TokenSymbol_IN,Value_OUT,TokenSymbol_OUT,TxnFee,FeeToken,From,To,Status\n";

    dispatch?.(
      importCsvTransactions({
        csvData: header + csvData,
        timestamp: new Date().toISOString(),
        transactionIds: converted.map((t: ParsedTransaction) => t.transactionHash),
      })
    );

    // Calculate analytics after import with detected base currency
    setTimeout(() => {
      const result = detectBaseCurrency(
        converted.map((t: ParsedTransaction) => ({
          id: t.transactionHash,
          txHash: t.transactionHash,
          blockNumber: "",
          timestamp: t.rawTimestamp,
          fromAddress: t.fromAddress,
          toAddress: t.toAddress,
          valueIn: t.amountIn ? { amount: t.amountIn, token: normalizeToken(t.token), usdValue: null } : null,
          valueOut: t.amountOut ? { amount: t.amountOut, token: normalizeToken(t.token), usdValue: null } : null,
          txnFee: { amount: t.feeAmount || 0, token: "XDAI", usdValue: null },
          status: "SUCCESS",
        })) as any
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-bold text-gray-900">Import Transactions</h1>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Upload Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveUploadTab("csv")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeUploadTab === "csv"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              CSV File
            </button>
            <button
              onClick={() => setActiveUploadTab("etherscan")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeUploadTab === "etherscan"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Etherscan API
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {activeUploadTab === "csv" ? (
              <CsvUploader
                onUploadSuccess={handleCsvImport}
              />
            ) : (
              <EtherscanUploader
                onUploadSuccess={(parsed, fetchData) => {
                  if (fetchData) {
                    handleEtherscanImport(fetchData.address, fetchData.apiKey);
                  }
                }}
              />
            )}
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
            <QuickActionButton icon="↓" label="Receive" color="bg-emerald-500" />
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
            { id: "budget", label: "Budget" },
            { id: "cards", label: "Cards" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
              <TransactionFilters
                transactions={transactions}
                onFilterChange={setFilteredTransactions}
              />
              <TransactionsTable transactions={filteredTransactions} baseCurrency={baseCurrency} />
            </>
          )}

          {activeTab === "analytics" && (
            <SpendingAnalytics
              transactions={transactions}
              baseCurrency={baseCurrency}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === "budget" && (
            <BudgetDashboard
              transactions={transactions}
              baseCurrency={baseCurrency}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === "cards" && (
            <CardManagement />
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

function QuickActionButton({ icon, label, color, onClick }: QuickActionButtonProps) {
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
