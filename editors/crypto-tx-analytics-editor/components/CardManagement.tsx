import React, { useState } from "react";

interface GnosisPayCard {
  id: string;
  lastFour: string;
  status: "active" | "frozen" | "blocked";
  type: "virtual" | "physical";
  expiryDate: string;
  spendingLimit: number | null;
  currency: string;
}

interface CardManagementProps {
  cards?: GnosisPayCard[];
  onFreezeCard?: (cardId: string) => void;
  onUnfreezeCard?: (cardId: string) => void;
}

const mockCards: GnosisPayCard[] = [
  {
    id: "1",
    lastFour: "4242",
    status: "active",
    type: "physical",
    expiryDate: "12/27",
    spendingLimit: 5000,
    currency: "GBP",
  },
  {
    id: "2",
    lastFour: "8888",
    status: "active",
    type: "virtual",
    expiryDate: "06/26",
    spendingLimit: 1000,
    currency: "EUR",
  },
];

export function CardManagement({
  cards = mockCards,
  onFreezeCard,
  onUnfreezeCard,
}: CardManagementProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleFreeze = (card: GnosisPayCard) => {
    if (card.status === "active") {
      onFreezeCard?.(card.id);
    } else if (card.status === "frozen") {
      onUnfreezeCard?.(card.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "frozen":
        return "bg-amber-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Cards</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Card
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl p-5 text-white transition-all ${
              card.status === "frozen"
                ? "bg-gray-600"
                : "bg-gradient-to-br from-violet-600 to-purple-700"
            }`}
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10" />
            </div>

            {/* Card Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(card.status)}`}
                    />
                    <span className="text-white/80 text-sm font-medium capitalize">
                      {card.status}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs">
                    {card.type === "virtual" ? "Virtual Card" : "Physical Card"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-6 w-8 rounded bg-gradient-to-r from-yellow-400/80 to-yellow-500/80" />
                </div>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <p className="text-2xl font-mono tracking-wider">
                  •••• •••• •••• {card.lastFour}
                </p>
              </div>

              {/* Card Details */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                    Expires
                  </p>
                  <p className="font-mono text-sm">{card.expiryDate}</p>
                </div>
                {card.spendingLimit && (
                  <div className="text-right">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                      Limit
                    </p>
                    <p className="font-mono text-sm">
                      {card.currency} {card.spendingLimit.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Overlay for Frozen */}
            {card.status === "frozen" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-white font-semibold flex items-center gap-2">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Card Frozen
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleToggleFreeze(cards[0])}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
            cards[0]?.status === "active"
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {cards[0]?.status === "active" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            )}
          </svg>
          {cards[0]?.status === "active" ? "Freeze" : "Unfreeze"}
        </button>

        <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </button>
      </div>

      {/* Card Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">GnosisPay Card</p>
            <p className="text-xs text-blue-700 mt-1">
              Your card is linked to your Gnosis Safe. Spend directly from your
              crypto wallet anywhere Visa is accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
