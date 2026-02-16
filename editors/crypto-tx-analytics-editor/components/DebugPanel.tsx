import React, { useState } from "react";
import { useSelectedCryptoTransactionAnalyticsDocument } from "../../../document-models/crypto-transaction-analytics/index.js";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";

export function DebugPanel() {
  const [document] = useSelectedCryptoTransactionAnalyticsDocument();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  const transactions = document?.state?.global?.transactions || [];
  const detectedBaseCurrency = document?.state?.global?.detectedBaseCurrency;

  // Count transactions by token
  const tokenCounts: Record<string, number> = {};
  transactions.forEach((tx: Transaction) => {
    if (tx.valueOut?.token) {
      tokenCounts[tx.valueOut.token] = (tokenCounts[tx.valueOut.token] || 0) + 1;
    }
    if (tx.valueIn?.token) {
      tokenCounts[tx.valueIn.token] = (tokenCounts[tx.valueIn.token] || 0) + 1;
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug Info</h2>
          <button onClick={() => setShowDebug(false)} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Detected Base Currency</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(detectedBaseCurrency, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Token Counts</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(tokenCounts, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">First 3 Transactions</h3>
            <pre className="text-sm overflow-auto max-h-60">
              {JSON.stringify(transactions.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
