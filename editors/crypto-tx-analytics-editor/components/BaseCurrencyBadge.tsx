import React from "react";
import type { GnosisPayStablecoin } from "../../../document-models/crypto-transaction-analytics/src/base-currency-detection.js";

interface BaseCurrencyBadgeProps {
  currency: GnosisPayStablecoin | string | null;
  confidence?: number;
  reason?: string;
  className?: string;
  showTooltip?: boolean;
}

const currencyConfig: Record<string, { color: string; label: string; symbol: string }> = {
  USDC: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "USDC",
    symbol: "$",
  },
  EURe: {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    label: "EURe",
    symbol: "€",
  },
  GBPe: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "GBPe",
    symbol: "£",
  },
  USD: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "USD",
    symbol: "$",
  },
  EUR: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "EUR",
    symbol: "€",
  },
  GBP: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "GBP",
    symbol: "£",
  },
};

export function BaseCurrencyBadge({
  currency,
  confidence,
  reason,
  className = "",
  showTooltip = true,
}: BaseCurrencyBadgeProps) {
  if (!currency) {
    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Currency Unknown
      </div>
    );
  }

  const config = currencyConfig[currency] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: currency,
    symbol: "",
  };

  const badgeContent = (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${config.color} ${className}`}
    >
      <span className="mr-1.5 text-lg">{config.symbol}</span>
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="ml-2 text-xs opacity-75">
          ({Math.round(confidence * 100)}% confidence)
        </span>
      )}
    </div>
  );

  if (!showTooltip || !reason) {
    return badgeContent;
  }

  return (
    <div className="relative group inline-block">
      {badgeContent}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg py-2 px-3 -mt-2 left-1/2 transform -translate-x-1/2 -translate-y-full w-64 text-center">
        {reason}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

interface WalletSummaryCardProps {
  address: string;
  currency: string | null;
  balance: number;
  totalAdded: number;
  totalSpent: number;
  className?: string;
}

export function WalletSummaryCard({
  address,
  currency,
  balance,
  totalAdded,
  totalSpent,
  className = "",
}: WalletSummaryCardProps) {
  const currencySymbol = currency
    ? currencyConfig[currency]?.symbol || "$"
    : "$";

  return (
    <div
      className={`bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-200 text-sm font-medium">Wallet Address</p>
          <p className="font-mono text-sm mt-1">
            {address
              ? `${address.slice(0, 8)}...${address.slice(-6)}`
              : "Not tracked"}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-blue-200 text-sm font-medium">Current Balance</p>
        <p className="text-4xl font-bold mt-1">
          {currencySymbol}
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-300 text-sm">
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
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            Added
          </div>
          <p className="text-lg font-semibold mt-1">
            +{currencySymbol}
            {totalAdded.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-red-300 text-sm">
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
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
            Spent
          </div>
          <p className="text-lg font-semibold mt-1">
            -{currencySymbol}
            {totalSpent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
