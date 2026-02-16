import React, { useState, useEffect } from "react";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";

interface RealTimeSyncProps {
  transactions: Transaction[];
  onNewTransaction?: (tx: Transaction) => void;
  isEnabled?: boolean;
}

export function RealTimeSync({ transactions, onNewTransaction, isEnabled = true }: RealTimeSyncProps) {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Simulate real-time sync indicator
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      setLastSyncTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isEnabled]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      setPendingCount(0);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEnabled ? "bg-green-100" : "bg-gray-100"
          }`}>
            {isEnabled ? (
              <span className="text-green-600 text-lg">●</span>
            ) : (
              <span className="text-gray-400 text-lg">○</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">Real-time Sync</p>
            <p className="text-xs text-gray-500">
              {isEnabled 
                ? lastSyncTime 
                  ? `Last synced ${lastSyncTime.toLocaleTimeString()}`
                  : "Connected to Gnosis Chain"
                : "Sync disabled"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              {pendingCount} pending
            </span>
          )}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`p-2 rounded-lg transition-colors ${
              isSyncing 
                ? "bg-gray-100 cursor-not-allowed" 
                : "bg-purple-100 hover:bg-purple-200 text-purple-600"
            }`}
          >
            <svg 
              className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {isEnabled && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Gnosis Chain</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
