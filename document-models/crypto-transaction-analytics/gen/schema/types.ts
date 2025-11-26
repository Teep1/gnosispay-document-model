export type Maybe<T> = T | null;
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
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
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
  status: TransactionStatusInput;
  timestamp: Scalars["DateTime"]["input"];
  toAddress?: InputMaybe<Scalars["String"]["input"]>;
  txHash: Scalars["String"]["input"];
  txnFee: TokenValueInput;
  valueIn?: InputMaybe<TokenValueInput>;
  valueOut?: InputMaybe<TokenValueInput>;
};

export type Analytics = {
  averageTransaction: Maybe<TokenValue>;
  monthlyBreakdown: Array<TokenValue>;
  totalSpent: Maybe<TokenValue>;
  transactionsByToken: Array<TokenValue>;
};

export type CalculateAnalyticsInput = {
  baseCurrency: Scalars["Currency"]["input"];
};

export type ConvertTransactionValuesInput = {
  baseCurrency: Scalars["Currency"]["input"];
  transactionId: Scalars["OID"]["input"];
};

export type CryptoTransactionAnalyticsState = {
  analytics: Maybe<Analytics>;
  metadata: Maybe<TransactionMetadata>;
  settings: Settings;
  transactions: Array<Transaction>;
};

export type DateRange = {
  endDate: Scalars["Date"]["output"];
  startDate: Scalars["Date"]["output"];
};

export type DeleteTransactionInput = {
  id: Scalars["OID"]["input"];
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

export type ImportCsvTransactionsInput = {
  csvData: Scalars["String"]["input"];
  timestamp: Scalars["DateTime"]["input"];
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
  contractAddress: Maybe<Scalars["String"]["output"]>;
  convertedValue: Maybe<PriceInfo>;
  currentValue: Maybe<PriceInfo>;
  errorCode: Maybe<Scalars["String"]["output"]>;
  fromAddress: Maybe<Scalars["String"]["output"]>;
  historicalPrice: Maybe<PriceInfo>;
  id: Scalars["OID"]["output"];
  method: Maybe<Scalars["String"]["output"]>;
  status: TransactionStatus;
  timestamp: Scalars["DateTime"]["output"];
  toAddress: Maybe<Scalars["String"]["output"]>;
  txHash: Scalars["String"]["output"];
  txnFee: TokenValue;
  valueIn: Maybe<TokenValue>;
  valueOut: Maybe<TokenValue>;
};

export type TransactionMetadata = {
  dateRange: Maybe<DateRange>;
  importedAt: Scalars["DateTime"]["output"];
  totalTransactions: Scalars["Int"]["output"];
};

export type TransactionStatus = "FAILED" | "SUCCESS";

export type TransactionStatusInput = "FAILED" | "SUCCESS";

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
  status?: InputMaybe<TransactionStatus>;
  timestamp?: InputMaybe<Scalars["DateTime"]["input"]>;
  toAddress?: InputMaybe<Scalars["String"]["input"]>;
  txHash?: InputMaybe<Scalars["String"]["input"]>;
  txnFee?: InputMaybe<TokenValueInput>;
  valueIn?: InputMaybe<TokenValueInput>;
  valueOut?: InputMaybe<TokenValueInput>;
};
