export type ErrorCode =
  | "TransactionNotFoundError"
  | "DeleteTransactionNotFoundError"
  | "EmptyTransactionsError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class TransactionNotFoundError extends Error implements ReducerError {
  errorCode = "TransactionNotFoundError" as ErrorCode;
  constructor(message = "TransactionNotFoundError") {
    super(message);
  }
}

export class DeleteTransactionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "DeleteTransactionNotFoundError" as ErrorCode;
  constructor(message = "DeleteTransactionNotFoundError") {
    super(message);
  }
}

export class EmptyTransactionsError extends Error implements ReducerError {
  errorCode = "EmptyTransactionsError" as ErrorCode;
  constructor(message = "EmptyTransactionsError") {
    super(message);
  }
}

export const errors = {
  UpdateTransaction: { TransactionNotFoundError },
  DeleteTransaction: { DeleteTransactionNotFoundError },
  ImportTransactions: { EmptyTransactionsError },
};
