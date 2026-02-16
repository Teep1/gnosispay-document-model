import React, { useState } from "react";
import {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  downloadFile,
} from "../services/exportService.js";
import type { Transaction } from "../../../document-models/gnosispay-analytics/gen/types.js";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  baseCurrency: string;
}

export function ExportModal({
  isOpen,
  onClose,
  transactions,
  baseCurrency,
}: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      const timestamp = new Date().toISOString().split("T")[0];

      switch (format) {
        case "csv":
          const csv = exportToCSV(transactions);
          downloadFile(csv, `gnosispay-export-${timestamp}.csv`, "text/csv");
          break;
        case "json":
          const json = exportToJSON(transactions);
          downloadFile(
            json,
            `gnosispay-export-${timestamp}.json`,
            "application/json",
          );
          break;
        case "pdf":
          const html = generatePDFHTML(
            transactions,
            "GnosisPay Transaction Statement",
          );
          downloadFile(
            html,
            `gnosispay-statement-${timestamp}.html`,
            "text/html",
          );
          break;
      }

      setIsExporting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Export Transactions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Export {transactions.length} transactions in your preferred format
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-purple-200 transition-colors">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === "csv"}
              onChange={() => setFormat("csv")}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">CSV</p>
              <p className="text-xs text-gray-500">
                Spreadsheet format for Excel
              </p>
            </div>
            <span className="text-2xl">📊</span>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-purple-200 transition-colors">
            <input
              type="radio"
              name="format"
              value="json"
              checked={format === "json"}
              onChange={() => setFormat("json")}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">JSON</p>
              <p className="text-xs text-gray-500">Machine-readable format</p>
            </div>
            <span className="text-2xl">📋</span>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-purple-200 transition-colors">
            <input
              type="radio"
              name="format"
              value="pdf"
              checked={format === "pdf"}
              onChange={() => setFormat("pdf")}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">HTML/PDF</p>
              <p className="text-xs text-gray-500">
                Formatted statement document
              </p>
            </div>
            <span className="text-2xl">📄</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
