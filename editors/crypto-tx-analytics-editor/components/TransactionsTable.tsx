import React from "react";
import {
  Table,
  TableRow,
  TableCell,
} from "@powerhousedao/design-system/rwa";
import { FormattedNumber } from "@powerhousedao/design-system/rwa";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";
import { detectCategory, getCategoryIcon, getCategoryLabel } from "../utils/categories.js";

interface TransactionsTableProps {
  transactions: Transaction[];
  baseCurrency: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionsTable({ transactions, baseCurrency }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-4xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Import your GnosisPay transactions to start tracking your spending
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx, index) => {
              const isOutgoing = tx.valueOut && tx.valueOut.amount > 0;
              const amount = isOutgoing ? tx.valueOut?.amount : tx.valueIn?.amount;
              const token = isOutgoing ? tx.valueOut?.token : tx.valueIn?.token;
              const category = detectCategory(tx.toAddress);
              const categoryIcon = getCategoryIcon(category);
              const categoryLabel = getCategoryLabel(category);
              const description = tx.toAddress
                ? `${tx.toAddress.slice(0, 6)}...${tx.toAddress.slice(-4)}`
                : "Unknown";

              return (
                <TableRow
                  key={tx.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(tx.timestamp)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(tx.timestamp)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcon}</span>
                      <span className="text-sm text-gray-600">{categoryLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {description}
                      </span>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">
                        {tx.txHash.slice(0, 10)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-sm font-bold ${
                          isOutgoing ? "text-gray-900" : "text-emerald-600"
                        }`}
                      >
                        {isOutgoing ? "−" : "+"}
                        <FormattedNumber value={amount || 0} decimalScale={2} />
                        {" "}
                        {token}
                      </span>
                      {tx.txnFee && (
                        <span className="text-xs text-gray-400 mt-0.5">
                          Fee: <FormattedNumber value={tx.txnFee.amount} decimalScale={4} /> {tx.txnFee.token}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
