import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: "blue" | "green" | "red" | "amber" | "purple";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    subtitle: "text-blue-700",
    icon: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    subtitle: "text-green-700",
    icon: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    subtitle: "text-red-700",
    icon: "text-red-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    subtitle: "text-amber-700",
    icon: "text-amber-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
    subtitle: "text-purple-700",
    icon: "text-purple-600",
  },
};

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
  color = "blue",
  loading = false,
}: DashboardCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div
        className={`${colors.bg} border ${colors.border} rounded-lg p-6 shadow-sm ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${colors.subtitle} mb-1`}>
            {title}
          </h3>
          <div className={`text-2xl font-bold ${colors.text}`}>
            {value}
          </div>
          {subtitle && (
            <p className={`text-xs ${colors.subtitle} mt-1`}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && <div className={`${colors.icon}`}>{icon}</div>}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({ label, value, change, className = "" }: MetricCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
      {change && (
        <p
          className={`text-xs mt-1 ${
            change.value >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {change.value >= 0 ? "+" : ""}
          {change.value.toFixed(1)}% {change.label}
        </p>
      )}
    </div>
  );
}
