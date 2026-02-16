export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  Attachment: { input: string; output: string };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AddTransactionInput = {
  blockNumber: Scalars["String"]["input"];
  contractAddress?: InputMaybe<Scalars["String"]["input"]>;
  convertedValue?: InputMaybe<PriceInfoInput>;
  currentValue?: InputMaybe<PriceInfoInput>;
  errorCode?: InputMaybe<Scalars["String"]["input"]>;
  fromAddress?: InputMaybe<Scalars["String"]["input"]>;
  historicalPrice?: InputMaybe<PriceInfoInput>;
  id: Scalars["OID"]["input"];
  method?: InputMaybe<Scalars["String"]["input"]>;
  signedAmount: Scalars["Float"]["input"];
  status: TransactionStatusInput;
  timestamp: Scalars["DateTime"]["input"];
  toAddress?: InputMaybe<Scalars["String"]["input"]>;
  transactionType: TransactionTypeInput;
  txHash: Scalars["String"]["input"];
  txnFee: TokenValueInput;
  valueIn?: InputMaybe<TokenValueInput>;
  valueOut?: InputMaybe<TokenValueInput>;
};

export type Analytics = {
  averageTransaction: Maybe<TokenValue>;
  monthlyBreakdown: Array<TokenValue>;
  spendingByCategory: Array<CategoryValue>;
  totalSpent: Maybe<TokenValue>;
  transactionsByToken: Array<TokenValue>;
};

export type CalculateAnalyticsInput = {
  baseCurrency: Scalars["Currency"]["input"];
};

export type CategoryValue = {
  amount: Scalars["Float"]["output"];
  category: Scalars["String"]["output"];
  token: Scalars["String"]["output"];
  usdValue: Maybe<Scalars["Float"]["output"]>;
};

export type ConvertTransactionValuesInput = {
  baseCurrency: Scalars["Currency"]["input"];
  transactionId: Scalars["OID"]["input"];
};

export type DateRange = {
  endDate: Scalars["Date"]["output"];
  startDate: Scalars["Date"]["output"];
};

export type DeleteTransactionInput = {
  id: Scalars["OID"]["input"];
};

export type DetectedBaseCurrency = {
  confidence: Scalars["Float"]["output"];
  currencyCode: Scalars["String"]["output"];
  reason: Scalars["String"]["output"];
  stablecoin: Scalars["String"]["output"];
  totalVolume: VolumeCounts;
  transactionCounts: TransactionCounts;
};

export type ExchangeRate = {
  fromCurrency: Scalars["Currency"]["output"];
  rate: Scalars["Float"]["output"];
  timestamp: Scalars["DateTime"]["output"];
  toCurrency: Scalars["Currency"]["output"];
};

export type ExchangeRateInput = {
  fromCurrency: Scalars["Currency"]["input"];
  rate: Scalars["Float"]["input"];
  timestamp: Scalars["DateTime"]["input"];
  toCurrency: Scalars["Currency"]["input"];
};

export type GnosispayAnalyticsState = {
  analytics: Maybe<Analytics>;
  detectedBaseCurrency: Maybe<DetectedBaseCurrency>;
  metadata: Maybe<TransactionMetadata>;
  settings: Settings;
  transactions: Array<Transaction>;
};

export type ImportCsvTransactionsInput = {
  csvData: Scalars["String"]["input"];
  timestamp: Scalars["DateTime"]["input"];
  trackedAddress: Scalars["String"]["input"];
  transactionIds: Array<Scalars["OID"]["input"]>;
};

export type PriceInfo = {
  amount: Scalars["Float"]["output"];
  currency: Scalars["Currency"]["output"];
};

export type PriceInfoInput = {
  amount: Scalars["Float"]["input"];
  currency: Scalars["Currency"]["input"];
};

export type SetBaseCurrencyInput = {
  baseCurrency: Scalars["Currency"]["input"];
};

export type Settings = {
  baseCurrency: Scalars["Currency"]["output"];
  exchangeRates: Array<ExchangeRate>;
  lastForexUpdate: Maybe<Scalars["DateTime"]["output"]>;
};

export type TokenValue = {
  amount: Scalars["Float"]["output"];
  token: Scalars["String"]["output"];
  usdValue: Maybe<Scalars["Float"]["output"]>;
};

export type TokenValueInput = {
  amount: Scalars["Float"]["input"];
  token: Scalars["String"]["input"];
  usdValue?: InputMaybe<Scalars["Float"]["input"]>;
};

export type Transaction = {
  blockNumber: Scalars["String"]["output"];
  category: Maybe<Scalars["String"]["output"]>;
  contractAddress: Maybe<Scalars["String"]["output"]>;
  convertedValue: Maybe<PriceInfo>;
  currentValue: Maybe<PriceInfo>;
  errorCode: Maybe<Scalars["String"]["output"]>;
  fromAddress: Maybe<Scalars["String"]["output"]>;
  historicalPrice: Maybe<PriceInfo>;
  id: Scalars["OID"]["output"];
  method: Maybe<Scalars["String"]["output"]>;
  signedAmount: Scalars["Float"]["output"];
  status: TransactionStatus;
  timestamp: Scalars["DateTime"]["output"];
  toAddress: Maybe<Scalars["String"]["output"]>;
  transactionType: TransactionType;
  txHash: Scalars["String"]["output"];
  txnFee: TokenValue;
  valueIn: Maybe<TokenValue>;
  valueOut: Maybe<TokenValue>;
};

export type TransactionCounts = {
  EURe: Scalars["Int"]["output"];
  GBPe: Scalars["Int"]["output"];
  USDC: Scalars["Int"]["output"];
};

export type TransactionMetadata = {
  dateRange: Maybe<DateRange>;
  importedAt: Scalars["DateTime"]["output"];
  totalTransactions: Scalars["Int"]["output"];
  trackedAddress: Maybe<Scalars["String"]["output"]>;
};

export type TransactionStatus = "FAILED" | "SUCCESS";

export type TransactionStatusInput = "FAILED" | "SUCCESS";

export type TransactionType = "EXPENSE" | "INCOME" | "NEUTRAL";

export type TransactionTypeInput = "EXPENSE" | "INCOME" | "NEUTRAL";

export type UpdateExchangeRatesInput = {
  rates: Array<ExchangeRateInput>;
  timestamp: Scalars["DateTime"]["input"];
};

export type UpdateTransactionInput = {
  blockNumber?: InputMaybe<Scalars["String"]["input"]>;
  contractAddress?: InputMaybe<Scalars["String"]["input"]>;
  convertedValue?: InputMaybe<PriceInfoInput>;
  currentValue?: InputMaybe<PriceInfoInput>;
  errorCode?: InputMaybe<Scalars["String"]["input"]>;
  fromAddress?: InputMaybe<Scalars["String"]["input"]>;
  historicalPrice?: InputMaybe<PriceInfoInput>;
  id: Scalars["OID"]["input"];
  method?: InputMaybe<Scalars["String"]["input"]>;
  signedAmount?: InputMaybe<Scalars["Float"]["input"]>;
  status?: InputMaybe<TransactionStatusInput>;
  timestamp?: InputMaybe<Scalars["DateTime"]["input"]>;
  toAddress?: InputMaybe<Scalars["String"]["input"]>;
  transactionType?: InputMaybe<TransactionTypeInput>;
  txHash?: InputMaybe<Scalars["String"]["input"]>;
  txnFee?: InputMaybe<TokenValueInput>;
  valueIn?: InputMaybe<TokenValueInput>;
  valueOut?: InputMaybe<TokenValueInput>;
};

export type VolumeCounts = {
  EURe: Scalars["Float"]["output"];
  GBPe: Scalars["Float"]["output"];
  USDC: Scalars["Float"]["output"];
};
