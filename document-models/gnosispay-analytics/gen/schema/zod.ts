import * as z from "zod";
import type {
  AddTransactionInput,
  Analytics,
  CalculateAnalyticsInput,
  CategoryValue,
  ConvertTransactionValuesInput,
  DateRange,
  DeleteTransactionInput,
  DetectedBaseCurrency,
  ExchangeRate,
  ExchangeRateInput,
  GnosispayAnalyticsState,
  ImportTransactionsInput,
  PriceInfo,
  PriceInfoInput,
  SetBaseCurrencyInput,
  Settings,
  TokenValue,
  TokenValueInput,
  Transaction,
  TransactionCounts,
  TransactionMetadata,
  TransactionStatus,
  TransactionStatusInput,
  TransactionType,
  TransactionTypeInput,
  UpdateExchangeRatesInput,
  UpdateTransactionInput,
  VolumeCounts,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const TransactionStatusSchema = z.enum(["FAILED", "SUCCESS"]);

export const TransactionStatusInputSchema = z.enum(["FAILED", "SUCCESS"]);

export const TransactionTypeSchema = z.enum(["EXPENSE", "INCOME", "NEUTRAL"]);

export const TransactionTypeInputSchema = z.enum([
  "EXPENSE",
  "INCOME",
  "NEUTRAL",
]);

export function AddTransactionInputSchema(): z.ZodObject<
  Properties<AddTransactionInput>
> {
  return z.object({
    blockNumber: z.string(),
    contractAddress: z.string().nullish(),
    convertedValue: z.lazy(() => PriceInfoInputSchema().nullish()),
    currentValue: z.lazy(() => PriceInfoInputSchema().nullish()),
    errorCode: z.string().nullish(),
    fromAddress: z.string().nullish(),
    historicalPrice: z.lazy(() => PriceInfoInputSchema().nullish()),
    id: z.string(),
    method: z.string().nullish(),
    signedAmount: z.number(),
    status: TransactionStatusInputSchema,
    timestamp: z.string().datetime(),
    toAddress: z.string().nullish(),
    transactionType: TransactionTypeInputSchema,
    txHash: z.string(),
    txnFee: z.lazy(() => TokenValueInputSchema()),
    valueIn: z.lazy(() => TokenValueInputSchema().nullish()),
    valueOut: z.lazy(() => TokenValueInputSchema().nullish()),
  });
}

export function AnalyticsSchema(): z.ZodObject<Properties<Analytics>> {
  return z.object({
    __typename: z.literal("Analytics").optional(),
    averageTransaction: z.lazy(() => TokenValueSchema().nullish()),
    monthlyBreakdown: z.array(z.lazy(() => TokenValueSchema())),
    spendingByCategory: z.array(z.lazy(() => CategoryValueSchema())),
    totalSpent: z.lazy(() => TokenValueSchema().nullish()),
    transactionsByToken: z.array(z.lazy(() => TokenValueSchema())),
  });
}

export function CalculateAnalyticsInputSchema(): z.ZodObject<
  Properties<CalculateAnalyticsInput>
> {
  return z.object({
    baseCurrency: z.string(),
  });
}

export function CategoryValueSchema(): z.ZodObject<Properties<CategoryValue>> {
  return z.object({
    __typename: z.literal("CategoryValue").optional(),
    amount: z.number(),
    category: z.string(),
    token: z.string(),
    usdValue: z.number().nullish(),
  });
}

export function ConvertTransactionValuesInputSchema(): z.ZodObject<
  Properties<ConvertTransactionValuesInput>
> {
  return z.object({
    baseCurrency: z.string(),
    transactionId: z.string(),
  });
}

export function DateRangeSchema(): z.ZodObject<Properties<DateRange>> {
  return z.object({
    __typename: z.literal("DateRange").optional(),
    endDate: z.string().datetime(),
    startDate: z.string().datetime(),
  });
}

export function DeleteTransactionInputSchema(): z.ZodObject<
  Properties<DeleteTransactionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DetectedBaseCurrencySchema(): z.ZodObject<
  Properties<DetectedBaseCurrency>
> {
  return z.object({
    __typename: z.literal("DetectedBaseCurrency").optional(),
    confidence: z.number(),
    currencyCode: z.string(),
    reason: z.string(),
    stablecoin: z.string(),
    totalVolume: z.lazy(() => VolumeCountsSchema()),
    transactionCounts: z.lazy(() => TransactionCountsSchema()),
  });
}

export function ExchangeRateSchema(): z.ZodObject<Properties<ExchangeRate>> {
  return z.object({
    __typename: z.literal("ExchangeRate").optional(),
    fromCurrency: z.string(),
    rate: z.number(),
    timestamp: z.string().datetime(),
    toCurrency: z.string(),
  });
}

export function ExchangeRateInputSchema(): z.ZodObject<
  Properties<ExchangeRateInput>
> {
  return z.object({
    fromCurrency: z.string(),
    rate: z.number(),
    timestamp: z.string().datetime(),
    toCurrency: z.string(),
  });
}

export function GnosispayAnalyticsStateSchema(): z.ZodObject<
  Properties<GnosispayAnalyticsState>
> {
  return z.object({
    __typename: z.literal("GnosispayAnalyticsState").optional(),
    analytics: z.lazy(() => AnalyticsSchema().nullish()),
    detectedBaseCurrency: z.lazy(() => DetectedBaseCurrencySchema().nullish()),
    metadata: z.lazy(() => TransactionMetadataSchema().nullish()),
    settings: z.lazy(() => SettingsSchema()),
    transactions: z.array(z.lazy(() => TransactionSchema())),
  });
}

export function ImportTransactionsInputSchema(): z.ZodObject<
  Properties<ImportTransactionsInput>
> {
  return z.object({
    timestamp: z.string().datetime(),
    trackedAddress: z.string(),
    transactions: z.array(z.lazy(() => AddTransactionInputSchema())),
  });
}

export function PriceInfoSchema(): z.ZodObject<Properties<PriceInfo>> {
  return z.object({
    __typename: z.literal("PriceInfo").optional(),
    amount: z.number(),
    currency: z.string(),
  });
}

export function PriceInfoInputSchema(): z.ZodObject<
  Properties<PriceInfoInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
  });
}

export function SetBaseCurrencyInputSchema(): z.ZodObject<
  Properties<SetBaseCurrencyInput>
> {
  return z.object({
    baseCurrency: z.string(),
  });
}

export function SettingsSchema(): z.ZodObject<Properties<Settings>> {
  return z.object({
    __typename: z.literal("Settings").optional(),
    baseCurrency: z.string(),
    exchangeRates: z.array(z.lazy(() => ExchangeRateSchema())),
    lastForexUpdate: z.string().datetime().nullish(),
  });
}

export function TokenValueSchema(): z.ZodObject<Properties<TokenValue>> {
  return z.object({
    __typename: z.literal("TokenValue").optional(),
    amount: z.number(),
    token: z.string(),
    usdValue: z.number().nullish(),
  });
}

export function TokenValueInputSchema(): z.ZodObject<
  Properties<TokenValueInput>
> {
  return z.object({
    amount: z.number(),
    token: z.string(),
    usdValue: z.number().nullish(),
  });
}

export function TransactionSchema(): z.ZodObject<Properties<Transaction>> {
  return z.object({
    __typename: z.literal("Transaction").optional(),
    blockNumber: z.string(),
    category: z.string().nullish(),
    contractAddress: z.string().nullish(),
    convertedValue: z.lazy(() => PriceInfoSchema().nullish()),
    currentValue: z.lazy(() => PriceInfoSchema().nullish()),
    errorCode: z.string().nullish(),
    fromAddress: z.string().nullish(),
    historicalPrice: z.lazy(() => PriceInfoSchema().nullish()),
    id: z.string(),
    method: z.string().nullish(),
    signedAmount: z.number(),
    status: TransactionStatusSchema,
    timestamp: z.string().datetime(),
    toAddress: z.string().nullish(),
    transactionType: TransactionTypeSchema,
    txHash: z.string(),
    txnFee: z.lazy(() => TokenValueSchema()),
    valueIn: z.lazy(() => TokenValueSchema().nullish()),
    valueOut: z.lazy(() => TokenValueSchema().nullish()),
  });
}

export function TransactionCountsSchema(): z.ZodObject<
  Properties<TransactionCounts>
> {
  return z.object({
    __typename: z.literal("TransactionCounts").optional(),
    EURe: z.number(),
    GBPe: z.number(),
    USDC: z.number(),
  });
}

export function TransactionMetadataSchema(): z.ZodObject<
  Properties<TransactionMetadata>
> {
  return z.object({
    __typename: z.literal("TransactionMetadata").optional(),
    dateRange: z.lazy(() => DateRangeSchema().nullish()),
    importedAt: z.string().datetime(),
    totalTransactions: z.number(),
    trackedAddress: z.string().nullish(),
  });
}

export function UpdateExchangeRatesInputSchema(): z.ZodObject<
  Properties<UpdateExchangeRatesInput>
> {
  return z.object({
    rates: z.array(z.lazy(() => ExchangeRateInputSchema())),
    timestamp: z.string().datetime(),
  });
}

export function UpdateTransactionInputSchema(): z.ZodObject<
  Properties<UpdateTransactionInput>
> {
  return z.object({
    blockNumber: z.string().nullish(),
    contractAddress: z.string().nullish(),
    convertedValue: z.lazy(() => PriceInfoInputSchema().nullish()),
    currentValue: z.lazy(() => PriceInfoInputSchema().nullish()),
    errorCode: z.string().nullish(),
    fromAddress: z.string().nullish(),
    historicalPrice: z.lazy(() => PriceInfoInputSchema().nullish()),
    id: z.string(),
    method: z.string().nullish(),
    signedAmount: z.number().nullish(),
    status: TransactionStatusInputSchema.nullish(),
    timestamp: z.string().datetime().nullish(),
    toAddress: z.string().nullish(),
    transactionType: TransactionTypeInputSchema.nullish(),
    txHash: z.string().nullish(),
    txnFee: z.lazy(() => TokenValueInputSchema().nullish()),
    valueIn: z.lazy(() => TokenValueInputSchema().nullish()),
    valueOut: z.lazy(() => TokenValueInputSchema().nullish()),
  });
}

export function VolumeCountsSchema(): z.ZodObject<Properties<VolumeCounts>> {
  return z.object({
    __typename: z.literal("VolumeCounts").optional(),
    EURe: z.number(),
    GBPe: z.number(),
    USDC: z.number(),
  });
}
