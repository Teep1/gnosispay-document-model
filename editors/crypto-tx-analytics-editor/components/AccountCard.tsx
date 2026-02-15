import React from "react";
import type { TokenValue } from "../../../document-models/crypto-transaction-analytics/gen/types.js";

interface AccountCardProps {
  balance: number;
  baseCurrency: string;
  currencyCode: string;
  accountName?: string;
  cardLastFour?: string;
  onTap?: () => void;
}

const currencyColors: Record<string, { from: string; to: string }> = {
  GBPe: { from: "from-violet-500", to: "to-purple-600" },
  EURe: { from: "from-blue-500", to: "to-cyan-600" },
  USDC: { from: "from-green-500", to: "to-emerald-600" },
  USDCE: { from: "from-green-500", to: "to-emerald-600" },
  XDAI: { from: "from-yellow-500", to: "to-orange-600" },
};

export function AccountCard({
  balance,
  baseCurrency,
  currencyCode,
  accountName = "GnosisPay",
  cardLastFour = "••••",
  onTap,
}: AccountCardProps) {
  const colors = currencyColors[baseCurrency] || { from: "from-gray-500", to: "to-gray-600" };
  const formattedBalance = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <div
      onClick={onTap}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colors.from} ${colors.to} p-6 text-white shadow-xl cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Card Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{accountName}</p>
            <p className="text-white/60 text-xs mt-0.5">{baseCurrency}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded bg-gradient-to-r from-yellow-400/80 to-yellow-500/80" />
          </div>
        </div>

        {/* Balance */}
        <div className="mt-8">
          <p className="text-white/70 text-sm">Current Balance</p>
          <p className="text-4xl font-bold mt-1 tracking-tight">{formattedBalance}</p>
        </div>

        {/* Card Details */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full bg-red-500/80" />
              <div className="h-6 w-6 rounded-full bg-yellow-500/80" />
            </div>
          </div>
          <p className="text-white/80 font-mono text-sm tracking-wider">{cardLastFour}</p>
        </div>
      </div>
    </div>
  );
}
