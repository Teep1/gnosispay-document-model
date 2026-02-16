import React, { useState, useMemo } from "react";
import type { Transaction } from "../../../document-models/gnosispay-analytics/gen/types.js";
import {
  detectCategory,
  type SpendingCategory,
  categoryConfig,
} from "../utils/categories.js";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export function TransactionFilters({
  transactions,
  onFilterChange,
}: TransactionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    SpendingCategory | "all"
  >("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "incoming" | "outgoing"
  >("all");

  const categories = Object.keys(categoryConfig) as SpendingCategory[];

  useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.txHash.toLowerCase().includes(query) ||
          tx.toAddress?.toLowerCase().includes(query) ||
          tx.fromAddress?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (tx) => detectCategory(tx.toAddress) === selectedCategory,
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((tx) => {
        const isOutgoing = tx.valueOut && tx.valueOut.amount > 0;
        return selectedType === "outgoing" ? isOutgoing : !isOutgoing;
      });
    }

    onFilterChange(filtered);
  }, [
    transactions,
    searchQuery,
    selectedCategory,
    selectedType,
    onFilterChange,
  ]);

  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Type filters */}
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedType === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedType("outgoing")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedType === "outgoing"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Outgoing
        </button>
        <button
          onClick={() => setSelectedType("incoming")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedType === "incoming"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Incoming
        </button>

        <div className="w-px h-8 bg-gray-200 mx-2" />

        {/* Category filters */}
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{categoryConfig[cat].icon}</span>
            <span className="hidden sm:inline">
              {categoryConfig[cat].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
