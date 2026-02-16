import React, { useState } from "react";

interface SettingsProps {
  baseCurrency: string;
  onBaseCurrencyChange?: (currency: string) => void;
  walletAddress?: string;
  onWalletAddressChange?: (address: string) => void;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function SettingsPanel({
  baseCurrency,
  onBaseCurrencyChange,
  walletAddress = "0xe1de...afc7",
  onWalletAddressChange,
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<
    "general" | "notifications" | "security" | "advanced"
  >("general");

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "1",
      label: "Transaction Alerts",
      description: "Get notified for every transaction",
      enabled: true,
    },
    {
      id: "2",
      label: "Budget Warnings",
      description: "Alert when approaching budget limits",
      enabled: true,
    },
    {
      id: "3",
      label: "Weekly Summary",
      description: "Receive weekly spending summary",
      enabled: false,
    },
    {
      id: "4",
      label: "Price Alerts",
      description: "Crypto price movement notifications",
      enabled: false,
    },
  ]);

  const currencies = [
    { code: "GBPe", label: "GBP Pound", symbol: "£", color: "bg-violet-500" },
    { code: "EURe", label: "Euro", symbol: "€", color: "bg-blue-500" },
    { code: "USDC", label: "USD Coin", symbol: "$", color: "bg-green-500" },
  ];

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {[
          { id: "general", label: "General", icon: "⚙️" },
          { id: "notifications", label: "Notifications", icon: "🔔" },
          { id: "security", label: "Security", icon: "🔒" },
          { id: "advanced", label: "Advanced", icon: "⚡" },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === section.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span>{section.icon}</span>
            <span className="hidden sm:inline">{section.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeSection === "general" && (
        <div className="space-y-4">
          {/* Base Currency */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Base Currency</h3>
            <div className="space-y-2">
              {currencies.map((currency) => (
                <label
                  key={currency.code}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    baseCurrency === currency.code
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={currency.code}
                    checked={baseCurrency === currency.code}
                    onChange={() => onBaseCurrencyChange?.(currency.code)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div
                    className={`w-10 h-10 rounded-full ${currency.color} flex items-center justify-center text-white font-bold`}
                  >
                    {currency.symbol}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {currency.label}
                    </p>
                    <p className="text-sm text-gray-500">{currency.code}</p>
                  </div>
                  {baseCurrency === currency.code && (
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Connected Wallet
            </h3>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-gray-900 truncate">
                  {walletAddress}
                </p>
                <p className="text-xs text-gray-500">Gnosis Safe</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeSection === "notifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              Notification Preferences
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose what you want to be notified about
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {notification.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {notification.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(notification.id)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notification.enabled ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notification.enabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeSection === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
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
                  <span className="font-medium text-gray-900">Change PIN</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </span>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  Enabled
                </span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 3.133c-4.659.99-7.131 2.462-7.131 5.434 0 2.472.345 4.865.99 7.131"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Biometric Login
                  </span>
                </div>
                <span className="text-sm text-gray-500">Face ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeSection === "advanced" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Advanced</h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-900">
                      Export All Data
                    </span>
                    <p className="text-xs text-gray-500">
                      Download your complete transaction history
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
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
                    <span className="font-medium text-gray-900">About</span>
                    <p className="text-xs text-gray-500">
                      Version 1.0.0 • GnosisPay Analytics
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
