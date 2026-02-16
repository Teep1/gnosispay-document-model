import type { Transaction } from "../../document-models/crypto-transaction-analytics/gen/types.js";

export interface ExportOptions {
  format: "csv" | "json" | "pdf";
  dateRange?: { start: string; end: string };
  categories?: string[];
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Time",
    "Transaction Hash",
    "From",
    "To",
    "Category",
    "Type",
    "Amount",
    "Token",
    "Fee",
    "Fee Token",
    "Status",
  ].join(",");

  const rows = transactions.map((tx) => {
    const date = new Date(tx.timestamp);
    const isOutgoing = tx.valueOut && tx.valueOut.amount > 0;
    const amount = isOutgoing ? tx.valueOut?.amount : tx.valueIn?.amount;
    const token = isOutgoing ? tx.valueOut?.token : tx.valueIn?.token;

    return [
      date.toLocaleDateString("en-GB"),
      date.toLocaleTimeString("en-GB"),
      tx.txHash,
      tx.fromAddress || "",
      tx.toAddress || "",
      tx.category || "other",
      isOutgoing ? "Outgoing" : "Incoming",
      amount?.toString() || "0",
      token || "",
      tx.txnFee?.amount?.toString() || "0",
      tx.txnFee?.token || "",
      tx.status,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

export function exportToJSON(transactions: Transaction[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    transactionCount: transactions.length,
    transactions: transactions.map((tx) => ({
      id: tx.id,
      txHash: tx.txHash,
      timestamp: tx.timestamp,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      category: tx.category || "other",
      valueIn: tx.valueIn,
      valueOut: tx.valueOut,
      txnFee: tx.txnFee,
      status: tx.status,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function generatePDFHTML(transactions: Transaction[], title: string): string {
  const totalSpent = transactions
    .filter((tx) => tx.valueOut && tx.valueOut.amount > 0)
    .reduce((sum, tx) => sum + (tx.valueOut?.amount || 0), 0);

  const totalReceived = transactions
    .filter((tx) => tx.valueIn && tx.valueIn.amount > 0)
    .reduce((sum, tx) => sum + (tx.valueIn?.amount || 0), 0);

  const rows = transactions
    .map((tx) => {
      const date = new Date(tx.timestamp);
      const isOutgoing = tx.valueOut && tx.valueOut.amount > 0;
      const amount = isOutgoing ? tx.valueOut?.amount : tx.valueIn?.amount;
      const token = isOutgoing ? tx.valueOut?.token : tx.valueIn?.token;

      return `
        <tr>
          <td>${date.toLocaleDateString("en-GB")}</td>
          <td>${tx.toAddress?.slice(0, 10)}...</td>
          <td>${tx.category || "other"}</td>
          <td style="color: ${isOutgoing ? "#dc2626" : "#059669"}; text-align: right;">
            ${isOutgoing ? "-" : "+"}${amount?.toFixed(2)} ${token}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    h1 { color: #111827; font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 32px; }
    .summary-card { background: #f9fafb; padding: 16px 24px; border-radius: 8px; flex: 1; }
    .summary-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .summary-value { font-size: 20px; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tr:hover { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleDateString("en-GB")}</p>
  
  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Total Spent</div>
      <div class="summary-value" style="color: #dc2626;">${totalSpent.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Received</div>
      <div class="summary-value" style="color: #059669;">${totalReceived.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Transactions</div>
      <div class="summary-value">${transactions.length}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
  `;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
