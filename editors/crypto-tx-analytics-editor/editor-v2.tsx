import { useState, useMemo, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { BankingDashboard } from "./components/BankingDashboard.js";
import { CsvUploader } from "./components/CsvUploader.js";
import { EtherscanUploader } from "./components/EtherscanUploader.js";
import { FinancialAnalytics } from "./components/FinancialAnalytics.js";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
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

type ViewMode = "banking" | "import" | "analytics";

const TRACKED_ADDRESS =
  import.meta.env.VITE_TRACKED_ETH_ADDRESS?.toLowerCase() ||
  "0xe1de155610bb5c85350ada3847c0d6f51ddbafc7";

export default function Editor() {
  return (
    <ErrorBoundary>
      <DocumentToolbar />
      <EditorContent />
    </ErrorBoundary>
  );
}

function EditorContent() {
  const [document, dispatch] = useSelectedCryptoTransactionAnalyticsDocument();
  const [viewMode, setViewMode] = useState<ViewMode>("banking");
  const [previewTransactions, setPreviewTransactions] = useState<ParsedTransaction[] | null>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<"csv" | "etherscan">("csv");

  const transactions = document?.state?.global?.transactions || [];
  const analytics = document?.state?.global?.analytics;
  const detectedBaseCurrency = document?.state?.global?.detectedBaseCurrency;

  // Detect base currency
  const baseCurrency = useMemo(() => {
    if (detectedBaseCurrency?.stablecoin) {
      return detectedBaseCurrency.stablecoin;
    }
    const previewRows = previewTransactions || [];
    const result = detectBaseCurrency(
      previewRows.map((r) => ({
        id: r.transactionHash,
        txHash: r.transactionHash,
        blockNumber: "",
        timestamp: r.timestamp || new Date().toISOString(),
        fromAddress: r.fromAddress,
        toAddress: r.toAddress,
        contractAddress: r.contractAddress,
        valueIn: r.amountIn ? { amount: r.amountIn, token: r.token, usdValue: null } : null,
        valueOut: r.amountOut ? { amount: r.amountOut, token: r.token, usdValue: null } : null,
        txnFee: { amount: r.feeAmount || 0, token: r.feeToken || "XDAI", usdValue: null },
        historicalPrice: null,
        currentValue: null,
        convertedValue: null,
        status: "SUCCESS" as const,
        errorCode: null,
        method: null,
      }))
    );
    return result.stablecoin || "USDC";
  }, [detectedBaseCurrency, previewTransactions]);

  const currencyCode = baseCurrency === "GBPe" ? "GBP" : baseCurrency === "EURe" ? "EUR" : "USD";

  // Calculate metrics
  const calculatedMetrics = useMemo(() => {
    const previewRows = previewTransactions || [];
    const allTransactions = [...transactions];
    
    return recalculateAnalytics(
      allTransactions,
      baseCurrency,
      undefined,
      undefined
    );
  }, [transactions, baseCurrency, previewTransactions]);

  const currentBalance = calculatedMetrics.totalAdded - calculatedMetrics.totalSpent;

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

    // Calculate analytics after import
    setTimeout(() => {
      dispatch?.(calculateAnalytics({ baseCurrency }));
    }, 100);

    setViewMode("banking");
  };

  // Handle Etherscan import
  const handleEtherscanImport = async (address: string, apiKey: string) => {
    const service = new EtherscanApiService(apiKey);
    const txs = await service.fetchTransactions(address);
    const converted = txs.map((t) => convertEtherscanToParseTransaction(t, address));
    
    const csvData = converted
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
        transactionIds: converted.map((t) => t.transactionHash),
      })
    );

    setTimeout(() => {
      dispatch?.(calculateAnalytics({ baseCurrency }));
    }, 100);

    setViewMode("banking");
  };

  if (viewMode === "banking") {
    return (
      <BankingDashboard
        transactions={transactions}
        baseCurrency={baseCurrency}
        currencyCode={currencyCode}
        currentBalance={currentBalance}
        totalAdded={calculatedMetrics.totalAdded}
        totalSpent={calculatedMetrics.totalSpent}
        onImportClick={() => setViewMode("import")}
        onAnalyticsClick={() => setViewMode("analytics")}
      />
    );
  }

  if (viewMode === "analytics") {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setViewMode("banking")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <FinancialAnalytics
            detectedCurrency={baseCurrency}
            currencyConfidence={detectedBaseCurrency?.confidence || 0}
            currencyReason={detectedBaseCurrency?.reason || ""}
            currentBalance={currentBalance}
            totalAdded={calculatedMetrics.totalAdded}
            totalSpent={calculatedMetrics.totalSpent}
            thisMonthSpending={calculatedMetrics.currentMonthExpenses}
            previousMonthSpending={calculatedMetrics.previousMonthExpenses}
            availableToSpend={currentBalance}
            monthlyBudget={null}
            alertThreshold={80}
            averageDailySpend={calculatedMetrics.averageDailySpend}
            averageTransaction={calculatedMetrics.averageTransaction}
            daysUntilMonthEnd={calculatedMetrics.daysUntilMonthEnd || 0}
            projectedMonthSpend={calculatedMetrics.projectedMonthSpend}
            totalFees={calculatedMetrics.totalFees}
            spendingAlerts={calculatedMetrics.spendingAlerts || []}
            topTokens={analytics?.transactionsByToken?.slice(0, 5) || []}
            monthlyBreakdown={analytics?.monthlyBreakdown || []}
            walletAddress={TRACKED_ADDRESS}
          />
        </div>
      </div>
    );
  }

  // Import view
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => setViewMode("banking")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Transactions</h2>

        {/* Upload Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveUploadTab("csv")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeUploadTab === "csv"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            CSV File
          </button>
          <button
            onClick={() => setActiveUploadTab("etherscan")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeUploadTab === "etherscan"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Etherscan API
          </button>
        </div>

        {activeUploadTab === "csv" ? (
          <CsvUploader
            onParsed={(parsed) => {
              setPreviewTransactions(parsed.transactions);
              handleCsvImport(parsed);
            }}
          />
        ) : (
          <EtherscanUploader
            onFetch={(address, apiKey) => {
              handleEtherscanImport(address, apiKey);
            }}
          />
        )}
      </div>
    </div>
  );
}
