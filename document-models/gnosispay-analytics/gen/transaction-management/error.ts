export type ErrorCode =
  | "InvalidCsvFormatError"
  | "TransactionNotFoundError"
  | "DeleteTransactionNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidCsvFormatError extends Error implements ReducerError {
  errorCode = "InvalidCsvFormatError" as ErrorCode;
  constructor(message = "InvalidCsvFormatError") {
    super(message);
  }
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

export const errors = {
  ImportCsvTransactions: { InvalidCsvFormatError },
  UpdateTransaction: { TransactionNotFoundError },
  DeleteTransaction: { DeleteTransactionNotFoundError },
};
