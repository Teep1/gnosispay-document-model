import React from "react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface QuickActionsProps {
  onSend?: () => void;
  onRequest?: () => void;
  onAnalytics?: () => void;
  onMore?: () => void;
}

export function QuickActions({
  onSend,
  onRequest,
  onAnalytics,
  onMore,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: (
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      label: "Send",
      onClick: onSend || (() => {}),
      color: "bg-blue-500",
    },
    {
      icon: (
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
            d="M12 5l9 18-9-18-9 18 9-2zm0 0v8"
          />
        </svg>
      ),
      label: "Request",
      onClick: onRequest || (() => {}),
      color: "bg-green-500",
    },
    {
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "Analytics",
      onClick: onAnalytics || (() => {}),
      color: "bg-purple-500",
    },
    {
      icon: (
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
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      ),
      label: "More",
      onClick: onMore || (() => {}),
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="flex justify-around py-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`${action.color} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all group-hover:scale-110 group-active:scale-95`}
          >
            {action.icon}
          </div>
          <span className="text-xs font-medium text-gray-700">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
