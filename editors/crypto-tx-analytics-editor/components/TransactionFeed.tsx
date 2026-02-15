import React, { useState } from "react";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";

interface TransactionFeedProps {
  transactions: Transaction[];
  baseCurrency: string;
  onTransactionClick?: (tx: Transaction) => void;
}

interface GroupedTransactions {
  [key: string]: Transaction[];
}

const merchantLogos: Record<string, string> = {
  "0x4822521e6135cd2599199c83ea35179229a172ee": "🛒", // Gnosis Pay
  "0x1234567890abcdef": "🏪",
};

function getMerchantName(toAddress?: string | null): string {
  if (!toAddress) return "Unknown";
  const merchants: Record<string, string> = {
    "0x4822521e6135cd2599199c83ea35179229a172ee": "Gnosis Pay",
  };
  return merchants[toAddress.toLowerCase()] || `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`;
}

function getCategoryIcon(toAddress?: string | null): string {
  if (!toAddress) return "💸";
  // Simple category detection based on common addresses
  if (toAddress.toLowerCase().includes("4822")) return "💳";
  return "💸";
}

function formatDate(dateString: string): { day: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
  };
}

function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions {
  const grouped: GroupedTransactions = {};
  
  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(tx);
  });
  
  return grouped;
}

export function TransactionFeed({
  transactions,
  baseCurrency,
  onTransactionClick,
}: TransactionFeedProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  
  const grouped = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(grouped).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-gray-400 text-sm mt-1">Import some data to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 px-4">{date}</h3>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {grouped[date].map((tx) => {
              const isOutgoing = tx.valueOut && tx.valueOut.amount > 0;
              const amount = isOutgoing ? tx.valueOut?.amount : tx.valueIn?.amount;
              const token = isOutgoing ? tx.valueOut?.token : tx.valueIn?.token;
              const merchantName = getMerchantName(tx.toAddress);
              const icon = getCategoryIcon(tx.toAddress);
              const { day, weekday } = formatDate(tx.timestamp);
              const isExpanded = expandedTx === tx.id;

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    setExpandedTx(isExpanded ? null : tx.id);
                    onTransactionClick?.(tx);
                  }}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {/* Date Indicator */}
                  <div className="flex flex-col items-center w-10">
                    <span className="text-xs font-bold text-gray-400">{weekday}</span>
                    <span className="text-lg font-bold text-gray-800">{day}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                    {icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{merchantName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {isOutgoing ? "Payment" : "Received"} • {tx.status.toLowerCase()}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-bold ${isOutgoing ? "text-gray-900" : "text-green-600"}`}>
                      {isOutgoing ? "-" : "+"}
                      {amount?.toFixed(2)} {token}
                    </p>
                    {tx.txnFee && (
                      <p className="text-xs text-gray-400">
                        Fee: {tx.txnFee.amount} {tx.txnFee.token}
                      </p>
                    )}
                  </div>

                  {/* Expand Indicator */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
