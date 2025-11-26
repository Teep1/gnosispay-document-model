import type { CryptoTransactionAnalyticsCurrencyManagementOperations } from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

export const cryptoTransactionAnalyticsCurrencyManagementOperations: CryptoTransactionAnalyticsCurrencyManagementOperations =
  {
    setBaseCurrencyOperation(state, action) {
      state.settings.baseCurrency = action.input.baseCurrency;
    },
    updateExchangeRatesOperation(state, action) {
      state.settings.exchangeRates = action.input.rates;
      state.settings.lastForexUpdate = action.input.timestamp;
    },
    convertTransactionValuesOperation(state, action) {
      const transaction = state.transactions.find(
        (t) => t.id === action.input.transactionId,
      );
      if (!transaction) {
        throw new Error(
          `Transaction with ID ${action.input.transactionId} not found`,
        );
      }

      const findExchangeRate = (fromCurrency: string, toCurrency: string) => {
        return state.settings.exchangeRates.find(
          (rate) =>
            rate.fromCurrency === fromCurrency &&
            rate.toCurrency === toCurrency,
        );
      };

      if (
        transaction.valueIn &&
        transaction.valueIn.token !== action.input.baseCurrency
      ) {
        const rate = findExchangeRate(
          transaction.valueIn.token,
          action.input.baseCurrency,
        );
        if (rate) {
          transaction.convertedValue = {
            amount: transaction.valueIn.amount * rate.rate,
            currency: action.input.baseCurrency,
          };
        }
      }

      if (transaction.txnFee && action.input.baseCurrency === "USD") {
        const rate = findExchangeRate(transaction.txnFee.token, "USD");
        if (rate) {
          transaction.txnFee.usdValue = transaction.txnFee.amount * rate.rate;
        }
      }

      if (transaction.valueIn && action.input.baseCurrency === "USD") {
        const rate = findExchangeRate(transaction.valueIn.token, "USD");
        if (rate) {
          transaction.valueIn.usdValue = transaction.valueIn.amount * rate.rate;
        }
      }

      if (transaction.valueOut && action.input.baseCurrency === "USD") {
        const rate = findExchangeRate(transaction.valueOut.token, "USD");
        if (rate) {
          transaction.valueOut.usdValue =
            transaction.valueOut.amount * rate.rate;
        }
      }
    },
  };
