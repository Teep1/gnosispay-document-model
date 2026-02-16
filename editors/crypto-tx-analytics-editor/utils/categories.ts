import React from "react";

export type SpendingCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "travel"
  | "health"
  | "education"
  | "income"
  | "other";

interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  keywords: string[];
}

export const categoryConfig: Record<SpendingCategory, CategoryConfig> = {
  food: {
    label: "Food & Dining",
    icon: "🍔",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    keywords: [
      "restaurant",
      "cafe",
      "food",
      "grocery",
      "supermarket",
      "delivery",
      "uber eats",
      "deliveroo",
    ],
  },
  transport: {
    label: "Transport",
    icon: "🚗",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    keywords: [
      "uber",
      "lyft",
      "taxi",
      "bus",
      "train",
      "metro",
      "fuel",
      "parking",
      "transport",
    ],
  },
  shopping: {
    label: "Shopping",
    icon: "🛍️",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    keywords: [
      "amazon",
      "shop",
      "store",
      "retail",
      "clothing",
      "electronics",
      "market",
    ],
  },
  entertainment: {
    label: "Entertainment",
    icon: "🎬",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    keywords: [
      "netflix",
      "spotify",
      "cinema",
      "movie",
      "game",
      "entertainment",
      "subscription",
    ],
  },
  utilities: {
    label: "Utilities",
    icon: "⚡",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    keywords: [
      "electricity",
      "water",
      "gas",
      "internet",
      "phone",
      "bill",
      "utility",
    ],
  },
  travel: {
    label: "Travel",
    icon: "✈️",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    keywords: [
      "hotel",
      "flight",
      "booking",
      "airbnb",
      "travel",
      "vacation",
      "trip",
    ],
  },
  health: {
    label: "Health",
    icon: "🏥",
    color: "text-red-600",
    bgColor: "bg-red-100",
    keywords: [
      "pharmacy",
      "doctor",
      "hospital",
      "medical",
      "health",
      "fitness",
      "gym",
    ],
  },
  education: {
    label: "Education",
    icon: "📚",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    keywords: [
      "course",
      "school",
      "university",
      "book",
      "education",
      "learning",
      "tutorial",
    ],
  },
  income: {
    label: "Income",
    icon: "💰",
    color: "text-green-600",
    bgColor: "bg-green-100",
    keywords: ["salary", "payment received", "refund", "deposit", "income"],
  },
  other: {
    label: "Other",
    icon: "📦",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    keywords: [],
  },
};

// Known merchant mappings
const merchantCategories: Record<string, SpendingCategory> = {
  "0x4822521e6135cd2599199c83ea35179229a172ee": "shopping", // Gnosis Pay
};

export function detectCategory(
  toAddress: string | null | undefined,
  description?: string | null,
): SpendingCategory {
  // Check known merchants first
  if (toAddress && merchantCategories[toAddress.toLowerCase()]) {
    return merchantCategories[toAddress.toLowerCase()];
  }

  // Check description keywords
  if (description) {
    const desc = description.toLowerCase();
    for (const [category, config] of Object.entries(categoryConfig)) {
      if (config.keywords.some((kw) => desc.includes(kw))) {
        return category as SpendingCategory;
      }
    }
  }

  return "other";
}

export function getCategoryIcon(category: SpendingCategory): string {
  return categoryConfig[category]?.icon || "📦";
}

export function getCategoryLabel(category: SpendingCategory): string {
  return categoryConfig[category]?.label || "Other";
}

export function getCategoryColor(category: SpendingCategory): string {
  return categoryConfig[category]?.color || "text-gray-600";
}

export function getCategoryBgColor(category: SpendingCategory): string {
  return categoryConfig[category]?.bgColor || "bg-gray-100";
}
