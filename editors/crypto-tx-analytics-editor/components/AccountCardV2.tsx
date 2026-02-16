import React from "react";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";

interface AccountCardProps {
  balance: number;
  baseCurrency: string;
  currencyCode: string;
  accountName?: string;
  cardLastFour?: string;
  onTap?: () => void;
}

const currencyGradients: Record<string, string> = {
  GBPe: "from-violet-600 via-purple-600 to-indigo-700",
  EURe: "from-blue-600 via-cyan-600 to-teal-700",
  USDC: "from-emerald-500 via-green-600 to-teal-700",
  USDCE: "from-emerald-500 via-green-600 to-teal-700",
  XDAI: "from-amber-500 via-yellow-600 to-orange-700",
};

export function AccountCard({
  balance,
  baseCurrency,
  currencyCode,
  accountName = "GnosisPay",
  cardLastFour = "••••",
  onTap,
}: AccountCardProps) {
  const gradient =
    currencyGradients[baseCurrency] || "from-gray-600 to-gray-800";

  return (
    <div
      onClick={onTap}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 active:scale-[0.98]`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Card Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
              {accountName}
            </p>
            <p className="text-white/50 text-xs mt-0.5 font-mono">
              {baseCurrency} • Gnosis Chain
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-10 rounded bg-gradient-to-r from-yellow-400/90 via-yellow-500/90 to-yellow-600/90 shadow-lg" />
          </div>
        </div>

        {/* Balance */}
        <div className="mt-8">
          <p className="text-white/60 text-sm mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white/80">
              {currencyCode === "GBP"
                ? "£"
                : currencyCode === "EUR"
                  ? "€"
                  : "$"}
            </span>
            <span className="text-5xl font-bold tracking-tight">
              <FormattedNumber value={balance} decimalScale={2} />
            </span>
          </div>
        </div>

        {/* Card Details Footer */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              <div className="h-8 w-8 rounded-full bg-red-500/90 shadow-md" />
              <div className="h-8 w-8 rounded-full bg-yellow-500/90 shadow-md" />
            </div>
            <span className="text-white/40 text-xs ml-1">Debit</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs tracking-widest">••••</span>
            <span className="text-white/80 font-mono text-sm tracking-wider">
              {cardLastFour}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
