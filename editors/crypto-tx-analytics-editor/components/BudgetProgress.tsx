import React from "react";

interface BudgetProgressProps {
  current: number;
  budget: number;
  currency: string;
  title?: string;
  alertThreshold?: number;
  className?: string;
}

export function BudgetProgress({
  current,
  budget,
  currency,
  title = "Monthly Budget",
  alertThreshold = 80,
  className = "",
}: BudgetProgressProps) {
  if (budget <= 0) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">
          No budget set. Configure your monthly budget in settings.
        </p>
      </div>
    );
  }

  const percentage = Math.min((current / budget) * 100, 100);
  const remaining = Math.max(budget - current, 0);
  const isOverBudget = current > budget;
  const isAlert = percentage >= alertThreshold && !isOverBudget;

  let progressColor = "bg-green-500";
  if (isOverBudget) progressColor = "bg-red-500";
  else if (isAlert) progressColor = "bg-amber-500";

  let statusMessage = "";
  if (isOverBudget) {
    statusMessage = `Over budget by ${(current - budget).toFixed(2)} ${currency}`;
  } else if (isAlert) {
    statusMessage = `Alert: You've used ${percentage.toFixed(1)}% of your budget`;
  } else {
    statusMessage = `${remaining.toFixed(2)} ${currency} remaining`;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            isOverBudget
              ? "bg-red-100 text-red-800"
              : isAlert
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
          }`}
        >
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">
            Spent: {current.toFixed(2)} {currency}
          </span>
          <span className="text-gray-600">
            Budget: {budget.toFixed(2)} {currency}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`${progressColor} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <p
        className={`text-sm font-medium ${
          isOverBudget
            ? "text-red-600"
            : isAlert
              ? "text-amber-600"
              : "text-green-600"
        }`}
      >
        {statusMessage}
      </p>

      {isOverBudget && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            ⚠️ You've exceeded your monthly budget. Consider reviewing your
            spending.
          </p>
        </div>
      )}

      {isAlert && !isOverBudget && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-700">
            ⚠️ You're approaching your budget limit. Monitor your spending
            closely.
          </p>
        </div>
      )}
    </div>
  );
}

interface SpendingAlertProps {
  alerts: string[];
  className?: string;
}

export function SpendingAlerts({ alerts, className = "" }: SpendingAlertProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div
        className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-green-800">
            No spending alerts. You're on track!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}
    >
      <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        Spending Alerts
      </h4>
      <ul className="space-y-2">
        {alerts.map((alert, index) => (
          <li
            key={index}
            className="text-sm text-amber-800 flex items-start gap-2"
          >
            <span className="text-amber-600 mt-0.5">•</span>
            {alert}
          </li>
        ))}
      </ul>
    </div>
  );
}
