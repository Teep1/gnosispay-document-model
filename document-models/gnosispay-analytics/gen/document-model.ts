import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Claude",
    website: "https://powerhouse.inc",
  },
  description:
    "Track and analyze GnosisPay card transactions with multi-token and forex support",
  extension: "gpa",
  id: "gnosispay/analytics",
  name: "GnosispayAnalytics",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description: "Operations for managing blockchain transactions",
          id: "transaction-management",
          name: "Transaction Management",
          operations: [
            {
              description:
                "Import transactions from CSV data exported from blockchain explorers",
              errors: [
                {
                  code: "INVALID_CSV_FORMAT",
                  description:
                    "The CSV data format is invalid or required fields are missing",
                  id: "invalid-csv-format-error",
                  name: "InvalidCsvFormatError",
                  template: "Invalid CSV format: {message}",
                },
              ],
              examples: [],
              id: "import-csv-transactions",
              name: "IMPORT_CSV_TRANSACTIONS",
              reducer:
                'if (!action.input.csvData || action.input.csvData.trim().length === 0) {\n  throw new InvalidCsvFormatError("CSV data is required");\n}\n\nif (!action.input.trackedAddress) {\n  throw new InvalidCsvFormatError("Tracked address is required for transaction classification");\n}\n\nif (!state.transactions) {\n  state.transactions = [];\n}\n\nconst transactions = [];\nconst csvLines = action.input.csvData.trim().split("\\n");\n\nif (csvLines.length < 2) {\n  throw new InvalidCsvFormatError("CSV must contain header row and at least one data row");\n}\n\nconst headers = csvLines[0].split(",").map(h => h.trim().replace(/"/g, ""));\nlet transactionIndex = 0;\nconst trackedAddressLower = action.input.trackedAddress.toLowerCase();\n\nfor (let i = 1; i < csvLines.length; i++) {\n  const line = csvLines[i].trim();\n  if (!line) continue;\n  \n  if (transactionIndex >= action.input.transactionIds.length) {\n    throw new InvalidCsvFormatError("Not enough transaction IDs provided for CSV data");\n  }\n  \n  const values = line.split(",").map(v => v.trim().replace(/"/g, ""));\n  if (values.length !== headers.length) continue;\n  \n  const txData: Record<string, string> = {};\n  headers.forEach((header, index) => {\n    txData[header] = values[index];\n  });\n  \n  const fromAddress = txData["From"] || null;\n  const toAddress = txData["To"] || null;\n  const valueInAmount = txData["Value_IN(Token)"] || txData["Value_IN(x)"] || "0";\n  const valueOutAmount = txData["Value_OUT(Token)"] || txData["Value_OUT(x)"] || "0";\n  const tokenSymbol = txData["TokenSymbol"] || "ETH";\n  \n  // Calculate signed amount and transaction type\n  let signedAmount = 0;\n  let transactionType: "INCOME" | "EXPENSE" | "NEUTRAL" = "NEUTRAL";\n  \n  const fromMatches = fromAddress?.toLowerCase() === trackedAddressLower;\n  const toMatches = toAddress?.toLowerCase() === trackedAddressLower;\n  const outgoingAmount = parseFloat(valueOutAmount) || parseFloat(valueInAmount) || 0;\n  const incomingAmount = parseFloat(valueInAmount) || parseFloat(valueOutAmount) || 0;\n  \n  if (fromMatches && !toMatches) {\n    // Outgoing transaction (expense)\n    signedAmount = -(outgoingAmount || 0);\n    transactionType = "EXPENSE";\n  } else if (toMatches && !fromMatches) {\n    // Incoming transaction (income)\n    signedAmount = incomingAmount || 0;\n    transactionType = "INCOME";\n  } else {\n    // Self-transfer or neither address matches\n    signedAmount = 0;\n    transactionType = "NEUTRAL";\n  }\n  \n  const transaction = {\n    id: action.input.transactionIds[transactionIndex],\n    txHash: txData["Transaction Hash"] || txData["TxHash"] || "",\n    blockNumber: txData["Blockno"] || txData["Block Number"] || "",\n    timestamp: txData["DateTime (UTC)"] || txData["DateTime"] || action.input.timestamp,\n    fromAddress,\n    toAddress,\n    contractAddress: txData["ContractAddress"] || null,\n    valueIn: parseFloat(valueInAmount) > 0 ? {\n      amount: parseFloat(valueInAmount),\n      token: tokenSymbol,\n      usdValue: null\n    } : null,\n    valueOut: parseFloat(valueOutAmount) > 0 ? {\n      amount: parseFloat(valueOutAmount),\n      token: tokenSymbol,\n      usdValue: null\n    } : null,\n    txnFee: {\n      amount: parseFloat(txData["TxnFee(DAI)"]) || parseFloat(txData["TxnFee(USD)"]) || parseFloat(txData["TxnFee(ETH)"]) || 0,\n      token: txData["TxnFee(DAI)"] ? "DAI" : txData["TxnFee(USD)"] ? "USD" : "ETH",\n      usdValue: null\n    },\n    historicalPrice: txData["Historical $P"] && parseFloat(txData["Historical $P"]) > 0 ? {\n      amount: parseFloat(txData["Historical $P"]),\n      currency: "USD"\n    } : null,\n    currentValue: txData["CurrentValue TxnFee(x)"] && parseFloat(txData["CurrentValue TxnFee(x)"]) > 0 ? {\n      amount: parseFloat(txData["CurrentValue TxnFee(x)"]),\n      currency: "USD"\n    } : null,\n    convertedValue: null,\n    status: (txData["Status"] === "1" || txData["Status"] === "Success" ? "SUCCESS" : "FAILED") as TransactionStatus,\n    errorCode: txData["ErrCode"] || null,\n    method: txData["Method"] || null,\n    transactionType,\n    signedAmount\n  };\n  \n  transactions.push(transaction);\n  transactionIndex++;\n}\n\nstate.transactions.push(...transactions);\n\nif (transactions.length > 0) {\n  const timestamps = transactions.map(t => new Date(t.timestamp).getTime()).filter(t => !isNaN(t));\n  state.metadata = {\n    importedAt: action.input.timestamp,\n    totalTransactions: state.transactions.length,\n    dateRange: timestamps.length > 0 ? {\n      startDate: new Date(Math.min(...timestamps)).toISOString().split("T")[0],\n      endDate: new Date(Math.max(...timestamps)).toISOString().split("T")[0]\n    } : null,\n    trackedAddress: action.input.trackedAddress\n  };\n} else {\n  state.metadata = {\n    importedAt: action.input.timestamp,\n    totalTransactions: state.transactions.length,\n    dateRange: null,\n    trackedAddress: action.input.trackedAddress\n  };\n}',
              schema:
                "input ImportCsvTransactionsInput {\n  csvData: String!\n  timestamp: DateTime!\n  transactionIds: [OID!]!\n  trackedAddress: String!\n}",
              scope: "global",
              template:
                "Import transactions from CSV data exported from blockchain explorers",
            },
            {
              description: "Add a single transaction manually",
              errors: [],
              examples: [],
              id: "add-transaction",
              name: "ADD_TRANSACTION",
              reducer:
                "const transaction = {\n  id: action.input.id,\n  txHash: action.input.txHash,\n  blockNumber: action.input.blockNumber,\n  timestamp: action.input.timestamp,\n  fromAddress: action.input.fromAddress || null,\n  toAddress: action.input.toAddress || null,\n  contractAddress: action.input.contractAddress || null,\n  valueIn: action.input.valueIn ? {\n    amount: action.input.valueIn.amount,\n    token: action.input.valueIn.token,\n    usdValue: action.input.valueIn.usdValue ?? null\n  } : null,\n  valueOut: action.input.valueOut ? {\n    amount: action.input.valueOut.amount,\n    token: action.input.valueOut.token,\n    usdValue: action.input.valueOut.usdValue ?? null\n  } : null,\n  txnFee: {\n    amount: action.input.txnFee.amount,\n    token: action.input.txnFee.token,\n    usdValue: action.input.txnFee.usdValue ?? null\n  },\n  historicalPrice: action.input.historicalPrice || null,\n  currentValue: action.input.currentValue || null,\n  convertedValue: action.input.convertedValue || null,\n  status: action.input.status,\n  errorCode: action.input.errorCode || null,\n  method: action.input.method || null,\n  transactionType: action.input.transactionType,\n  signedAmount: action.input.signedAmount\n};\n\nstate.transactions.push(transaction);\n\nconst currentTrackedAddress = state.metadata?.trackedAddress || null;\n\nstate.metadata = {\n  importedAt: state.metadata?.importedAt || action.input.timestamp,\n  totalTransactions: state.transactions.length,\n  dateRange: state.metadata?.dateRange || {\n    startDate: action.input.timestamp.split('T')[0],\n    endDate: action.input.timestamp.split('T')[0]\n  },\n  trackedAddress: currentTrackedAddress\n};",
              schema:
                "input AddTransactionInput {\n  id: OID!\n  txHash: String!\n  blockNumber: String!\n  timestamp: DateTime!\n  fromAddress: String\n  toAddress: String\n  contractAddress: String\n  valueIn: TokenValueInput\n  valueOut: TokenValueInput\n  txnFee: TokenValueInput!\n  historicalPrice: PriceInfoInput\n  currentValue: PriceInfoInput\n  convertedValue: PriceInfoInput\n  status: TransactionStatusInput!\n  errorCode: String\n  method: String\n  transactionType: TransactionTypeInput!\n  signedAmount: Float!\n}\n\nenum TransactionTypeInput {\n  INCOME\n  EXPENSE\n  NEUTRAL\n}",
              scope: "global",
              template: "Add a single transaction manually",
            },
            {
              description: "Update an existing transaction",
              errors: [
                {
                  code: "TRANSACTION_NOT_FOUND",
                  description: "The specified transaction could not be found",
                  id: "transaction-not-found-error",
                  name: "TransactionNotFoundError",
                  template: "Transaction not found: {id}",
                },
              ],
              examples: [],
              id: "update-transaction",
              name: "UPDATE_TRANSACTION",
              reducer:
                "const transactionIndex = state.transactions.findIndex(t => t.id === action.input.id);\nif (transactionIndex === -1) {\n  throw new TransactionNotFoundError(`Transaction with ID ${action.input.id} not found`);\n}\n\nconst transaction = state.transactions[transactionIndex];\nif (action.input.txHash) transaction.txHash = action.input.txHash;\nif (action.input.blockNumber) transaction.blockNumber = action.input.blockNumber;\nif (action.input.timestamp) transaction.timestamp = action.input.timestamp;\nif (action.input.fromAddress !== undefined) transaction.fromAddress = action.input.fromAddress;\nif (action.input.toAddress !== undefined) transaction.toAddress = action.input.toAddress;\nif (action.input.contractAddress !== undefined) transaction.contractAddress = action.input.contractAddress;\nif (action.input.valueIn !== undefined) transaction.valueIn = action.input.valueIn ? {\n  amount: action.input.valueIn.amount,\n  token: action.input.valueIn.token,\n  usdValue: action.input.valueIn.usdValue ?? null\n} : null;\nif (action.input.valueOut !== undefined) transaction.valueOut = action.input.valueOut ? {\n  amount: action.input.valueOut.amount,\n  token: action.input.valueOut.token,\n  usdValue: action.input.valueOut.usdValue ?? null\n} : null;\nif (action.input.txnFee) transaction.txnFee = {\n  amount: action.input.txnFee.amount,\n  token: action.input.txnFee.token,\n  usdValue: action.input.txnFee.usdValue ?? null\n};\nif (action.input.historicalPrice !== undefined) transaction.historicalPrice = action.input.historicalPrice;\nif (action.input.currentValue !== undefined) transaction.currentValue = action.input.currentValue;\nif (action.input.convertedValue !== undefined) transaction.convertedValue = action.input.convertedValue;\nif (action.input.status) transaction.status = action.input.status;\nif (action.input.errorCode !== undefined) transaction.errorCode = action.input.errorCode;\nif (action.input.method !== undefined) transaction.method = action.input.method;\nif (action.input.transactionType) transaction.transactionType = action.input.transactionType;\nif (action.input.signedAmount !== undefined) transaction.signedAmount = action.input.signedAmount;",
              schema:
                "input UpdateTransactionInput {\n  id: OID!\n  txHash: String\n  blockNumber: String\n  timestamp: DateTime\n  fromAddress: String\n  toAddress: String\n  contractAddress: String\n  valueIn: TokenValueInput\n  valueOut: TokenValueInput\n  txnFee: TokenValueInput\n  historicalPrice: PriceInfoInput\n  currentValue: PriceInfoInput\n  convertedValue: PriceInfoInput\n  status: TransactionStatusInput\n  errorCode: String\n  method: String\n  transactionType: TransactionTypeInput\n  signedAmount: Float\n}",
              scope: "global",
              template: "Update an existing transaction",
            },
            {
              description: "Delete a transaction by ID",
              errors: [
                {
                  code: "DELETE_TRANSACTION_NOT_FOUND",
                  description:
                    "The specified transaction could not be found for deletion",
                  id: "delete-tx-not-found-error",
                  name: "DeleteTransactionNotFoundError",
                  template: "Transaction not found for deletion: {id}",
                },
              ],
              examples: [],
              id: "delete-transaction",
              name: "DELETE_TRANSACTION",
              reducer:
                "const transactionIndex = state.transactions.findIndex(t => t.id === action.input.id);\nif (transactionIndex === -1) {\n  throw new DeleteTransactionNotFoundError(`Transaction with ID ${action.input.id} not found`);\n}\n\nstate.transactions.splice(transactionIndex, 1);\n\nstate.metadata = {\n  importedAt: state.metadata?.importedAt || new Date().toISOString(),\n  totalTransactions: state.transactions.length,\n  dateRange: state.metadata?.dateRange || null,\n  trackedAddress: state.metadata?.trackedAddress || null\n};",
              schema: "input DeleteTransactionInput {\n  id: OID!\n}",
              scope: "global",
              template: "Delete a transaction by ID",
            },
          ],
        },
        {
          description: "Operations for managing currencies and exchange rates",
          id: "currency-management",
          name: "Currency Management",
          operations: [
            {
              description:
                "Set the base currency for analytics and conversions",
              errors: [],
              examples: [],
              id: "set-base-currency",
              name: "SET_BASE_CURRENCY",
              reducer:
                "state.settings.baseCurrency = action.input.baseCurrency;",
              schema:
                "input SetBaseCurrencyInput {\n  baseCurrency: Currency!\n}",
              scope: "global",
              template: "Set the base currency for analytics and conversions",
            },
            {
              description: "Update exchange rates for currency conversions",
              errors: [],
              examples: [],
              id: "update-exchange-rates",
              name: "UPDATE_EXCHANGE_RATES",
              reducer:
                "state.settings.exchangeRates = action.input.rates;\nstate.settings.lastForexUpdate = action.input.timestamp;",
              schema:
                "input UpdateExchangeRatesInput {\n  rates: [ExchangeRateInput!]!\n  timestamp: DateTime!\n}\n\ninput ExchangeRateInput {\n  fromCurrency: Currency!\n  toCurrency: Currency!\n  rate: Float!\n  timestamp: DateTime!\n}",
              scope: "global",
              template: "Update exchange rates for currency conversions",
            },
            {
              description:
                "Convert transaction values to the specified base currency",
              errors: [],
              examples: [],
              id: "convert-transaction-values",
              name: "CONVERT_TRANSACTION_VALUES",
              reducer:
                "const transaction = state.transactions.find(t => t.id === action.input.transactionId);\nif (!transaction) {\n  throw new TransactionNotFoundError(`Transaction with ID ${action.input.transactionId} not found`);\n}\n\nconst findExchangeRate = (fromCurrency: string, toCurrency: string) => {\n  return state.settings.exchangeRates.find(rate => \n    rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency\n  );\n};\n\nif (transaction.valueIn && transaction.valueIn.token !== action.input.baseCurrency) {\n  const rate = findExchangeRate(transaction.valueIn.token, action.input.baseCurrency);\n  if (rate) {\n    transaction.convertedValue = {\n      amount: transaction.valueIn.amount * rate.rate,\n      currency: action.input.baseCurrency\n    };\n  }\n}\n\nif (transaction.txnFee && action.input.baseCurrency === 'USD') {\n  const rate = findExchangeRate(transaction.txnFee.token, 'USD');\n  if (rate) {\n    transaction.txnFee.usdValue = transaction.txnFee.amount * rate.rate;\n  }\n}\n\nif (transaction.valueIn && action.input.baseCurrency === 'USD') {\n  const rate = findExchangeRate(transaction.valueIn.token, 'USD');\n  if (rate) {\n    transaction.valueIn.usdValue = transaction.valueIn.amount * rate.rate;\n  }\n}\n\nif (transaction.valueOut && action.input.baseCurrency === 'USD') {\n  const rate = findExchangeRate(transaction.valueOut.token, 'USD');\n  if (rate) {\n    transaction.valueOut.usdValue = transaction.valueOut.amount * rate.rate;\n  }\n}",
              schema:
                "input ConvertTransactionValuesInput {\n  transactionId: OID!\n  baseCurrency: Currency!\n}",
              scope: "global",
              template:
                "Convert transaction values to the specified base currency",
            },
          ],
        },
        {
          description: "Operations for calculating transaction analytics",
          id: "analytics",
          name: "Analytics",
          operations: [
            {
              description: "Calculate spending analytics based on transactions",
              errors: [],
              examples: [],
              id: "calculate-analytics",
              name: "CALCULATE_ANALYTICS",
              reducer:
                "const transactions = state.transactions;\nif (transactions.length === 0) {\n  state.analytics = {\n    totalSpent: null,\n    averageTransaction: null,\n    transactionsByToken: [],\n    monthlyBreakdown: []\n  };\n  return;\n}\n\nlet totalAmount = 0;\nconst tokenAmounts: Record<string, number> = {};\nconst monthlyAmounts: Record<string, number> = {};\n\ntransactions.forEach(tx => {\n  let amount = 0;\n  let token = action.input.baseCurrency;\n  \n  if (tx.convertedValue) {\n    amount = tx.convertedValue.amount;\n  } else if (tx.valueOut && tx.valueOut.token === action.input.baseCurrency) {\n    amount = tx.valueOut.amount;\n  } else if (tx.valueOut && tx.valueOut.usdValue && action.input.baseCurrency === 'USD') {\n    amount = tx.valueOut.usdValue;\n  }\n  \n  if (amount > 0) {\n    totalAmount += amount;\n    \n    const originalToken = tx.valueOut?.token || 'Unknown';\n    tokenAmounts[originalToken] = (tokenAmounts[originalToken] || 0) + (tx.valueOut?.amount || 0);\n    \n    const month = new Date(tx.timestamp).toISOString().substring(0, 7);\n    monthlyAmounts[month] = (monthlyAmounts[month] || 0) + amount;\n  }\n});\n\nstate.analytics = {\n  totalSpent: totalAmount > 0 ? {\n    amount: totalAmount,\n    token: action.input.baseCurrency,\n    usdValue: action.input.baseCurrency === 'USD' ? totalAmount : null\n  } : null,\n  averageTransaction: totalAmount > 0 ? {\n    amount: totalAmount / transactions.length,\n    token: action.input.baseCurrency,\n    usdValue: action.input.baseCurrency === 'USD' ? totalAmount / transactions.length : null\n  } : null,\n  transactionsByToken: Object.entries(tokenAmounts).map(([token, amount]) => ({\n    amount,\n    token,\n    usdValue: null\n  })),\n  monthlyBreakdown: Object.entries(monthlyAmounts).map(([month, amount]) => ({\n    amount,\n    token: action.input.baseCurrency,\n    usdValue: action.input.baseCurrency === 'USD' ? amount : null\n  }))\n};",
              schema:
                "input CalculateAnalyticsInput {\n  baseCurrency: Currency!\n}",
              scope: "global",
              template: "Calculate spending analytics based on transactions",
            },
          ],
        },
      ],
      state: {
        global: {
          examples: [],
          initialValue:
            '{\n  "transactions": [],\n  "analytics": null,\n  "metadata": null,\n  "detectedBaseCurrency": null,\n  "settings": {\n    "baseCurrency": "USD",\n    "lastForexUpdate": null,\n    "exchangeRates": []\n  }\n}',
          schema:
            "type GnosispayAnalyticsState {\n  transactions: [Transaction!]!\n  analytics: Analytics\n  metadata: TransactionMetadata\n  detectedBaseCurrency: DetectedBaseCurrency\n  settings: Settings!\n}\n\ntype DetectedBaseCurrency {\n  stablecoin: String!\n  currencyCode: String!\n  confidence: Float!\n  transactionCounts: TransactionCounts!\n  totalVolume: VolumeCounts!\n  reason: String!\n}\n\ntype TransactionCounts {\n  USDC: Int!\n  EURe: Int!\n  GBPe: Int!\n}\n\ntype VolumeCounts {\n  USDC: Float!\n  EURe: Float!\n  GBPe: Float!\n}\n\ntype TokenValue {\n  amount: Float!\n  token: String!\n  usdValue: Float\n}\n\ntype PriceInfo {\n  amount: Float!\n  currency: Currency!\n}\n\ntype DateRange {\n  startDate: Date!\n  endDate: Date!\n}\n\ntype TransactionMetadata {\n  importedAt: DateTime!\n  totalTransactions: Int!\n  dateRange: DateRange\n  trackedAddress: String\n}\n\nenum TransactionStatus {\n  SUCCESS\n  FAILED\n}\n\nenum TransactionType {\n  INCOME\n  EXPENSE\n  NEUTRAL\n}\n\ntype Transaction {\n  id: OID!\n  txHash: String!\n  blockNumber: String!\n  timestamp: DateTime!\n  fromAddress: String\n  toAddress: String\n  contractAddress: String\n  category: String\n  valueIn: TokenValue\n  valueOut: TokenValue\n  txnFee: TokenValue!\n  historicalPrice: PriceInfo\n  currentValue: PriceInfo\n  convertedValue: PriceInfo\n  status: TransactionStatus!\n  errorCode: String\n  method: String\n  transactionType: TransactionType!\n  signedAmount: Float!\n}\n\ntype ExchangeRate {\n  fromCurrency: Currency!\n  toCurrency: Currency!\n  rate: Float!\n  timestamp: DateTime!\n}\n\ntype Settings {\n  baseCurrency: Currency!\n  lastForexUpdate: DateTime\n  exchangeRates: [ExchangeRate!]!\n}\n\ntype Analytics {\n  totalSpent: TokenValue\n  averageTransaction: TokenValue\n  transactionsByToken: [TokenValue!]!\n  monthlyBreakdown: [TokenValue!]!\n  spendingByCategory: [CategoryValue!]!\n}\n\ntype CategoryValue {\n  category: String!\n  amount: Float!\n  token: String!\n  usdValue: Float\n}\n\ninput TokenValueInput {\n  amount: Float!\n  token: String!\n  usdValue: Float\n}\n\ninput PriceInfoInput {\n  amount: Float!\n  currency: Currency!\n}\n\nenum TransactionStatusInput {\n  SUCCESS\n  FAILED\n}",
        },
        local: {
          examples: [],
          initialValue: "",
          schema: "",
        },
      },
      version: 1,
    },
  ],
};
