import React from "react";

interface TokenBalance {
  token: string;
  amount: number;
  currencyCode: string;
  color: string;
}

interface TokenBalancesProps {
  balances: TokenBalance[];
  onSelectToken?: (token: string) => void;
  selectedToken?: string;
}

const tokenConfig: Record<string, { name: string; color: string; gradient: string }> = {
  GBPe: {
    name: "GBP Pound",
    color: "bg-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
  EURe: {
    name: "Euro",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-cyan-600",
  },
  USDC: {
    name: "USD Coin",
    color: "bg-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  USDCE: {
    name: "USD Coin (Ethereum)",
    color: "bg-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  XDAI: {
    name: "xDAI",
    color: "bg-yellow-500",
    gradient: "from-yellow-500 to-orange-600",
  },
};

export function TokenBalances({
  balances,
  onSelectToken,
  selectedToken,
}: TokenBalancesProps) {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 px-4">Your Balances</h3>
      <div className="space-y-2 px-4">
        {balances.map((balance) => {
          const config = tokenConfig[balance.token] || {
            name: balance.token,
            color: "bg-gray-500",
            gradient: "from-gray-500 to-gray-600",
          };
          const isSelected = selectedToken === balance.token;

          return (
            <div
              key={balance.token}
              onClick={() => onSelectToken?.(balance.token)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-gradient-to-r " + config.gradient + " text-white shadow-lg"
                  : "bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {/* Token Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  isSelected ? "bg-white/20" : config.color
                }`}
              >
                {balance.token.slice(0, 2)}
              </div>

              {/* Token Info */}
              <div className="flex-1">
                <p className={`font-semibold ${isSelected ? "text-white" : "text-gray-900"}`}>
                  {config.name}
                </p>
                <p className={`text-sm ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                  {balance.token}
                </p>
              </div>

              {/* Balance */}
              <div className="text-right">
                <p className={`font-bold text-lg ${isSelected ? "text-white" : "text-gray-900"}`}>
                  {formatAmount(balance.amount, balance.currencyCode)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
