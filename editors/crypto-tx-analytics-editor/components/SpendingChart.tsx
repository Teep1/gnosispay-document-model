import React from "react";
import type { Transaction } from "../../../document-models/crypto-transaction-analytics/gen/types.js";
import { detectCategory, categoryConfig, type SpendingCategory } from "../utils/categories.js";

interface SpendingChartProps {
  transactions: Transaction[];
  baseCurrency: string;
  type?: "bar" | "pie" | "line";
}

interface MonthlyData {
  month: string;
  amount: number;
}

export function SpendingChart({ transactions, baseCurrency, type = "bar" }: SpendingChartProps) {
  // Calculate monthly spending data
  const monthlyData = React.useMemo((): MonthlyData[] => {
    const data: Record<string, number> = {};
    
    transactions.forEach((tx) => {
      if (tx.valueOut && tx.valueOut.amount > 0) {
        const date = new Date(tx.timestamp);
        const monthKey = date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        data[monthKey] = (data[monthKey] || 0) + tx.valueOut.amount;
      }
    });

    return Object.entries(data)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  }, [transactions]);

  // Calculate category data for pie chart
  const categoryData = React.useMemo(() => {
    const data: Record<string, number> = {};
    
    transactions.forEach((tx) => {
      if (tx.valueOut && tx.valueOut.amount > 0) {
        const category = detectCategory(tx.toAddress);
        data[category] = (data[category] || 0) + tx.valueOut.amount;
      }
    });

    return Object.entries(data)
      .map(([category, amount]) => ({
        category: category as SpendingCategory,
        amount,
        color: categoryConfig[category as SpendingCategory]?.bgColor.replace("bg-", "#") || "#9ca3af",
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  if (monthlyData.length === 0 && categoryData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-gray-500">No data available for charts</p>
        <p className="text-gray-400 text-sm mt-1">Import transactions to see spending trends</p>
      </div>
    );
  }

  if (type === "pie") {
    return <PieChart data={categoryData} />;
  }

  return <BarChart data={monthlyData} />;
}

interface PieData {
  category: SpendingCategory;
  amount: number;
  color: string;
}

function PieChart({ data }: { data: PieData[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {data.map((item, index) => {
          const percentage = item.amount / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = ((startAngle + angle) * Math.PI) / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 flex-1">
              {categoryConfig[item.category]?.label || item.category}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {((item.amount / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: MonthlyData[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.amount / maxAmount) * 100;
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">{item.month}</span>
              <span className="text-gray-900 font-semibold">
                {item.amount.toFixed(2)}
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.max(percentage, 5)}%` }}
              >
                {percentage > 20 && (
                  <span className="text-white text-xs font-medium">
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
