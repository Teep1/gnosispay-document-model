import { z } from "zod";
import type {
  AddTransactionInput,
  Analytics,
  CalculateAnalyticsInput,
  ConvertTransactionValuesInput,
  CryptoTransactionAnalyticsState,
  DateRange,
  DeleteTransactionInput,
  DetectedBaseCurrency,
  ExchangeRate,
  ExchangeRateInput,
  ImportCsvTransactionsInput,
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
  UpdateExchangeRatesInput,
  UpdateTransactionInput,
  VolumeCounts,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const TransactionStatusSchema = z.enum(["FAILED", "SUCCESS"]);

export const TransactionStatusInputSchema = z.enum(["FAILED", "SUCCESS"]);

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
    status: z.lazy(() => TransactionStatusInputSchema),
    timestamp: z.string().datetime(),
    toAddress: z.string().nullish(),
    txHash: z.string(),
    txnFee: z.lazy(() => TokenValueInputSchema()),
    valueIn: z.lazy(() => TokenValueInputSchema().nullish()),
    valueOut: z.lazy(() => TokenValueInputSchema().nullish()),
  });
}

export function AnalyticsSchema(): z.ZodObject<Properties<Analytics>> {
  return z.object({
    __typename: z.literal("Analytics").optional(),
    averageTransaction: TokenValueSchema().nullable(),
    monthlyBreakdown: z.array(TokenValueSchema()),
    totalSpent: TokenValueSchema().nullable(),
    transactionsByToken: z.array(TokenValueSchema()),
  });
}

export function CalculateAnalyticsInputSchema(): z.ZodObject<
  Properties<CalculateAnalyticsInput>
> {
  return z.object({
    baseCurrency: z.string(),
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

export function CryptoTransactionAnalyticsStateSchema(): z.ZodObject<
  Properties<CryptoTransactionAnalyticsState>
> {
  return z.object({
    __typename: z.literal("CryptoTransactionAnalyticsState").optional(),
    analytics: AnalyticsSchema().nullable(),
    detectedBaseCurrency: DetectedBaseCurrencySchema().nullable(),
    metadata: TransactionMetadataSchema().nullable(),
    settings: SettingsSchema(),
    transactions: z.array(TransactionSchema()),
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
    totalVolume: VolumeCountsSchema(),
    transactionCounts: TransactionCountsSchema(),
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

export function ImportCsvTransactionsInputSchema(): z.ZodObject<
  Properties<ImportCsvTransactionsInput>
> {
  return z.object({
    csvData: z.string(),
    timestamp: z.string().datetime(),
    transactionIds: z.array(z.string()),
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
    exchangeRates: z.array(ExchangeRateSchema()),
    lastForexUpdate: z.string().datetime().nullable(),
  });
}

export function TokenValueSchema(): z.ZodObject<Properties<TokenValue>> {
  return z.object({
    __typename: z.literal("TokenValue").optional(),
    amount: z.number(),
    token: z.string(),
    usdValue: z.number().nullable(),
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
    contractAddress: z.string().nullable(),
    convertedValue: PriceInfoSchema().nullable(),
    currentValue: PriceInfoSchema().nullable(),
    errorCode: z.string().nullable(),
    fromAddress: z.string().nullable(),
    historicalPrice: PriceInfoSchema().nullable(),
    id: z.string(),
    method: z.string().nullable(),
    status: TransactionStatusSchema,
    timestamp: z.string().datetime(),
    toAddress: z.string().nullable(),
    txHash: z.string(),
    txnFee: TokenValueSchema(),
    valueIn: TokenValueSchema().nullable(),
    valueOut: TokenValueSchema().nullable(),
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
    dateRange: DateRangeSchema().nullable(),
    importedAt: z.string().datetime(),
    totalTransactions: z.number(),
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
    status: TransactionStatusSchema.nullish(),
    timestamp: z.string().datetime().nullish(),
    toAddress: z.string().nullish(),
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
