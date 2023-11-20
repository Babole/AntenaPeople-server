export type ErrorSource =
  | {
      pointer: string;
    }
  | {
      parameter: string;
    };

export abstract class BaseError extends Error {
  readonly code: string = "INTERNAL_SERVER_ERROR";
  readonly title: string = "Internal Server Error";
  readonly status: number = 500;

  readonly detail?: string;
  readonly source?: ErrorSource;

  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
