import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Queries: CryptoTransactionAnalytics Document
  """
  type CryptoTransactionAnalyticsQueries {
    getDocument(docId: PHID!, driveId: PHID): CryptoTransactionAnalytics
    getDocuments(driveId: String!): [CryptoTransactionAnalytics!]
  }

  type Query {
    CryptoTransactionAnalytics: CryptoTransactionAnalyticsQueries
  }

  """
  Mutations: CryptoTransactionAnalytics
  """
  type Mutation {
    CryptoTransactionAnalytics_createDocument(
      name: String!
      driveId: String
    ): String

    CryptoTransactionAnalytics_importCsvTransactions(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_ImportCsvTransactionsInput
    ): Int
    CryptoTransactionAnalytics_addTransaction(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_AddTransactionInput
    ): Int
    CryptoTransactionAnalytics_updateTransaction(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_UpdateTransactionInput
    ): Int
    CryptoTransactionAnalytics_deleteTransaction(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_DeleteTransactionInput
    ): Int
    CryptoTransactionAnalytics_setBaseCurrency(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_SetBaseCurrencyInput
    ): Int
    CryptoTransactionAnalytics_updateExchangeRates(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_UpdateExchangeRatesInput
    ): Int
    CryptoTransactionAnalytics_convertTransactionValues(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_ConvertTransactionValuesInput
    ): Int
    CryptoTransactionAnalytics_calculateAnalytics(
      driveId: String
      docId: PHID
      input: CryptoTransactionAnalytics_CalculateAnalyticsInput
    ): Int
  }

  """
  Module: TransactionManagement
  """
  input CryptoTransactionAnalytics_ImportCsvTransactionsInput {
    csvData: String!
    timestamp: DateTime!
    transactionIds: [OID!]!
  }
  input CryptoTransactionAnalytics_AddTransactionInput {
    id: OID!
    txHash: String!
    blockNumber: String!
    timestamp: DateTime!
    fromAddress: String
    toAddress: String
    contractAddress: String
    valueIn: CryptoTransactionAnalytics_TokenValueInput
    valueOut: CryptoTransactionAnalytics_TokenValueInput
    txnFee: CryptoTransactionAnalytics_TokenValueInput!
    historicalPrice: CryptoTransactionAnalytics_PriceInfoInput
    currentValue: CryptoTransactionAnalytics_PriceInfoInput
    convertedValue: CryptoTransactionAnalytics_PriceInfoInput
    status: CryptoTransactionAnalytics_TransactionStatusInput!
    errorCode: String
    method: String
  }

  input CryptoTransactionAnalytics_TokenValueInput {
    amount: Float!
    token: String!
    usdValue: Float
  }

  input CryptoTransactionAnalytics_PriceInfoInput {
    amount: Float!
    currency: Currency!
  }

  enum CryptoTransactionAnalytics_TransactionStatusInput {
    SUCCESS
    FAILED
  }

  input CryptoTransactionAnalytics_UpdateTransactionInput {
    id: OID!
    txHash: String
    blockNumber: String
    timestamp: DateTime
    fromAddress: String
    toAddress: String
    contractAddress: String
    valueIn: CryptoTransactionAnalytics_TokenValueInput
    valueOut: CryptoTransactionAnalytics_TokenValueInput
    txnFee: CryptoTransactionAnalytics_TokenValueInput
    historicalPrice: CryptoTransactionAnalytics_PriceInfoInput
    currentValue: CryptoTransactionAnalytics_PriceInfoInput
    convertedValue: CryptoTransactionAnalytics_PriceInfoInput
    status: CryptoTransactionAnalytics_TransactionStatus
    errorCode: String
    method: String
  }
  input CryptoTransactionAnalytics_DeleteTransactionInput {
    id: OID!
  }

  """
  Module: CurrencyManagement
  """
  input CryptoTransactionAnalytics_SetBaseCurrencyInput {
    baseCurrency: Currency!
  }
  input CryptoTransactionAnalytics_UpdateExchangeRatesInput {
    rates: [CryptoTransactionAnalytics_ExchangeRateInput!]!
    timestamp: DateTime!
  }

  input CryptoTransactionAnalytics_ExchangeRateInput {
    fromCurrency: Currency!
    toCurrency: Currency!
    rate: Float!
    timestamp: DateTime!
  }
  input CryptoTransactionAnalytics_ConvertTransactionValuesInput {
    transactionId: OID!
    baseCurrency: Currency!
  }

  """
  Module: Analytics
  """
  input CryptoTransactionAnalytics_CalculateAnalyticsInput {
    baseCurrency: Currency!
  }
`;
